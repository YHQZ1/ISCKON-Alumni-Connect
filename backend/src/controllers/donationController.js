import supabase from "../../src/config/supabaseClient.js";

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

    if (!campaign_id || !amount) {
      return res
        .status(400)
        .json({ error: "campaign_id and amount are required" });
    }

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
      return res.status(500).json({ error: "Failed to create donation" });
    }

    let donationId = data;
    if (Array.isArray(data)) donationId = data[0];
    if (
      donationId &&
      typeof donationId === "object" &&
      Object.keys(donationId).length === 1
    ) {
      donationId = Object.values(donationId)[0];
    }

    return res.status(201).json({ donation_id: donationId, status });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function webhookHandler(req, res) {
  try {
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

    if (!provider || !provider_payment_id || !status) {
      return res
        .status(400)
        .json({ error: "provider, provider_payment_id and status required" });
    }

    const { data: existing, error: fetchErr } = await supabase
      .from("donations")
      .select("*")
      .eq("provider_payment_id", provider_payment_id)
      .maybeSingle();

    if (fetchErr) {
      return res.status(500).json({ error: "DB error" });
    }

    if (existing) {
      if (existing.status === status) {
        return res.json({ ok: true, donation_id: existing.id });
      }

      const { data: updated, error: updateErr } = await supabase
        .from("donations")
        .update({ status, metadata })
        .eq("id", existing.id)
        .select()
        .maybeSingle();

      if (updateErr) {
        return res.status(500).json({ error: "Failed to update donation" });
      }

      if (status === "succeeded" && existing.status !== "succeeded") {
        await supabase.rpc("increment_campaign_amount", {
          p_campaign: existing.campaign_id,
          p_amount: existing.amount,
        });
      } else if (existing.status === "succeeded" && status !== "succeeded") {
        await supabase.rpc("increment_campaign_amount", {
          p_campaign: existing.campaign_id,
          p_amount: -existing.amount,
        });
      }

      return res.json({ ok: true, donation_id: existing.id });
    }

    if (!campaign_id || !amount) {
      return res
        .status(400)
        .json({ error: "campaign_id and amount required for new donation" });
    }

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
      return res.status(500).json({ error: "Failed to create donation" });
    }

    return res.json({ ok: true, donation_id: createdId });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const getMyDonationStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: donations, error } = await supabase
      .from("donations")
      .select(
        "amount, campaign_id, status, donor_user_id, campaigns ( school_id )"
      )
      .eq("donor_user_id", userId)
      .in("status", ["completed", "success", "succeeded"]);

    if (error) {
      throw error;
    }

    const totalDonated = donations.reduce(
      (sum, donation) => sum + parseFloat(donation.amount),
      0
    );
    const uniqueCampaigns = [...new Set(donations.map((d) => d.campaign_id))];
    const projectsSupported = uniqueCampaigns.length;
    const uniqueSchools = [
      ...new Set(donations.map((d) => d.campaigns?.school_id).filter(Boolean)),
    ];
    const schoolsHelped = uniqueSchools.length;

    res.json({
      totalDonated,
      projectsSupported,
      schoolsHelped,
      totalDonations: donations.length,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch donation statistics",
    });
  }
};

export const getMyRecentDonations = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: donations, error } = await supabase
      .from("donations")
      .select("id, amount, created_at, campaigns ( title, schools ( name ) )")
      .eq("donor_user_id", userId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      throw error;
    }

    res.json({
      donations: donations || [],
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch recent donations",
    });
  }
};

export const getCampaignDonations = async (req, res) => {
  try {
    const { campaignId } = req.params;

    const { data: donations, error } = await supabase
      .from("donations")
      .select(
        "id, amount, created_at, donor_name, donor_email, status, donor_user_id, users ( first_name, last_name )"
      )
      .eq("campaign_id", campaignId)
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      donations: donations || [],
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch campaign donations",
    });
  }
};

export const getSchoolDonations = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const { data: donations, error } = await supabase
      .from("donations")
      .select(
        `
        id, amount, created_at, donor_name, donor_email, status,
        campaigns!inner ( title, schools!inner ( id ) )
      `
      )
      .eq("campaigns.schools.id", schoolId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    res.json({ donations: donations || [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch school donations" });
  }
};
