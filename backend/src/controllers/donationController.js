// src/controllers/donationController.js
import supabase from "../../src/config/supabaseClient.js";

/*
  createDonation:
  - Protected route (authenticateToken). Uses req.user.id for donor_user_id.
  - Calls the DB RPC add_donation_and_increment (idempotent when provider_payment_id provided).
*/
export async function createDonation(req, res) {
  try {
    const authUser = req.user || null;
    const {
      campaign_id,
      amount,
      currency = "INR",
      payment_provider = null,
      provider_payment_id = null,
      donor_name = null,
      donor_email = null,
      status = "succeeded",
      metadata = {},
    } = req.body;

    if (!campaign_id || !amount)
      return res
        .status(400)
        .json({ error: "campaign_id and amount are required" });

    const params = {
      p_campaign: campaign_id,
      p_donor: authUser ? authUser.id : null,
      p_donor_name: donor_name,
      p_donor_email: donor_email,
      p_amount: amount,
      p_currency: currency,
      p_provider: payment_provider,
      p_provider_payment_id: provider_payment_id,
      p_status: status,
      p_metadata: metadata,
    };

    const { data, error } = await supabase.rpc(
      "add_donation_and_increment",
      params
    );

    if (error) {
      console.error("createDonation rpc error", error);
      return res.status(500).json({ error: "Failed to create donation" });
    }

    // supabase.rpc sometimes returns the scalar directly or as an array; normalize
    let donationId = data;
    if (Array.isArray(data)) donationId = data[0];
    // if data is object with key, handle generically
    if (
      donationId &&
      typeof donationId === "object" &&
      Object.keys(donationId).length === 1
    ) {
      donationId = Object.values(donationId)[0];
    }

    return res.status(201).json({ donation_id: donationId, status });
  } catch (err) {
    console.error("createDonation exception", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/*
  webhookHandler:
  - Public endpoint to be called by payment provider.
  - IMPORTANT: implement provider signature verification in production.
  - Idempotent: uses provider_payment_id to find existing donation or calls RPC.
*/
export async function webhookHandler(req, res) {
  try {
    // In production, verify signature here BEFORE trusting payload.
    const {
      provider,
      provider_payment_id,
      status,
      amount,
      currency = "INR",
      campaign_id,
      donor_name = null,
      donor_email = null,
      metadata = {},
    } = req.body;
    if (!provider || !provider_payment_id || !status)
      return res
        .status(400)
        .json({ error: "provider, provider_payment_id and status required" });

    // Try find existing donation by provider_payment_id
    const { data: existing, error: fetchErr } = await supabase
      .from("donations")
      .select("*")
      .eq("provider_payment_id", provider_payment_id)
      .maybeSingle();
    if (fetchErr) {
      console.error("webhook fetch err", fetchErr);
      return res.status(500).json({ error: "DB error" });
    }

    if (existing) {
      // If already in desired status -> idempotent OK
      if (existing.status === status)
        return res.json({ ok: true, donation_id: existing.id });

      // Update donation status
      const { data: updated, error: updateErr } = await supabase
        .from("donations")
        .update({ status, metadata })
        .eq("id", existing.id)
        .select()
        .maybeSingle();

      if (updateErr) {
        console.error("webhook update err", updateErr);
        return res.status(500).json({ error: "Failed to update donation" });
      }

      // Adjust campaign current_amount if needed
      if (status === "succeeded" && existing.status !== "succeeded") {
        await supabase.rpc("increment_campaign_amount", {
          p_campaign: existing.campaign_id,
          p_amount: existing.amount,
        });
      } else if (existing.status === "succeeded" && status !== "succeeded") {
        // refund/cancel
        await supabase.rpc("increment_campaign_amount", {
          p_campaign: existing.campaign_id,
          p_amount: -existing.amount,
        });
      }

      return res.json({ ok: true, donation_id: existing.id });
    }

    // No existing donation -> create via RPC (requires campaign_id & amount)
    if (!campaign_id || !amount)
      return res
        .status(400)
        .json({ error: "campaign_id and amount required for new donation" });

    const { data: createdId, error: rpcErr } = await supabase.rpc(
      "add_donation_and_increment",
      {
        p_campaign: campaign_id,
        p_donor: null,
        p_donor_name: donor_name,
        p_donor_email: donor_email,
        p_amount: amount,
        p_currency: currency,
        p_provider: provider,
        p_provider_payment_id: provider_payment_id,
        p_status: status,
        p_metadata: metadata,
      }
    );

    if (rpcErr) {
      console.error("webhook rpc err", rpcErr);
      return res.status(500).json({ error: "Failed to create donation" });
    }

    return res.json({ ok: true, donation_id: createdId });
  } catch (err) {
    console.error("webhook exception", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
