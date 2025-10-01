// src/controllers/campaignController.js
import supabase from "../../src/config/supabaseClient.js";

/*
  createCampaign:
  - Requires auth (req.user)
  - Body must include school_id (UUID). We verify the requesting user owns that school.
  - Inserts a campaign row and returns it.
*/
export async function createCampaign(req, res) {
  try {
    const authUser = req.user;
    if (!authUser || !authUser.id)
      return res.status(401).json({ error: "Not authenticated" });
    const {
      school_id,
      title,
      short_description = null,
      body = null,
      target_amount = 0,
      currency = "INR",
      start_at = null,
      end_at = null,
      metadata = {},
    } = req.body;

    if (!school_id)
      return res.status(400).json({ error: "school_id is required" });
    if (!title) return res.status(400).json({ error: "title is required" });

    // Verify ownership of the school
    const { data: school, error: schoolErr } = await supabase
      .from("schools")
      .select("id, owner_id")
      .eq("id", school_id)
      .maybeSingle();

    if (schoolErr) {
      console.error("createCampaign school lookup error", schoolErr);
      return res.status(500).json({ error: "DB error" });
    }
    if (!school) return res.status(404).json({ error: "School not found" });
    if (String(school.owner_id) !== String(authUser.id))
      return res.status(403).json({ error: "You do not own this school" });

    const { data, error } = await supabase
      .from("campaigns")
      .insert([
        {
          school_id,
          title,
          short_description,
          body,
          target_amount,
          current_amount: 0,
          currency,
          status: "active",
          start_at,
          end_at,
          metadata,
        },
      ])
      .select()
      .maybeSingle();

    if (error) {
      console.error("createCampaign insert error", error);
      return res.status(500).json({ error: "Failed to create campaign" });
    }

    return res.status(201).json({ campaign: data });
  } catch (err) {
    console.error("createCampaign exception", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/*
  listCampaigns:
  - Public listing (optional filters)
  - Query params: ?school_id=&status=&q=
*/
/*
  listCampaigns:
  - Public listing (optional filters)
  - Query params: ?school_id=&status=&q=
*/
export async function listCampaigns(req, res) {
  try {
    const { school_id, status, q } = req.query;
    let builder = supabase
      .from("campaigns")
      .select(
        "id, school_id, title, short_description, body, target_amount, current_amount, currency, status, start_at, end_at, created_at, metadata"
      ) // ADDED metadata and body here
      .order("created_at", { ascending: false });

    if (school_id) builder = builder.eq("school_id", school_id);
    if (status) builder = builder.eq("status", status);
    if (q) builder = builder.ilike("title", `%${q}%`);

    const { data, error } = await builder;
    if (error) {
      console.error("listCampaigns error", error);
      return res.status(500).json({ error: "Failed to list campaigns" });
    }

    return res.json({ campaigns: data });
  } catch (err) {
    console.error("listCampaigns exception", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/*
  getCampaign:
  - Fetch single campaign by id
*/
export async function getCampaign(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "id required" });

    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("getCampaign error", error);
      return res.status(500).json({ error: "Failed to fetch campaign" });
    }
    if (!data) return res.status(404).json({ error: "Campaign not found" });

    return res.json({ campaign: data });
  } catch (err) {
    console.error("getCampaign exception", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/*
  updateCampaign:
  - Only owner (via school.owner_id) can update
*/
export async function updateCampaign(req, res) {
  try {
    const authUser = req.user;
    if (!authUser) return res.status(401).json({ error: "Not authenticated" });

    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "id required" });

    // Verify campaign exists and that user owns it via school
    const { data: campaign, error: campErr } = await supabase
      .from("campaigns")
      .select("id, school_id")
      .eq("id", id)
      .maybeSingle();
    if (campErr) {
      console.error("updateCampaign fetch error", campErr);
      return res.status(500).json({ error: "DB error" });
    }
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    const { data: school, error: schoolErr } = await supabase
      .from("schools")
      .select("owner_id")
      .eq("id", campaign.school_id)
      .maybeSingle();
    if (schoolErr) {
      console.error("updateCampaign school fetch error", schoolErr);
      return res.status(500).json({ error: "DB error" });
    }
    if (!school || String(school.owner_id) !== String(authUser.id))
      return res.status(403).json({ error: "Not authorized" });

    // Allow fields to be updated
    const allowed = [
      "title",
      "short_description",
      "body",
      "target_amount",
      "status",
      "start_at",
      "end_at",
      "metadata",
    ];
    const payload = {};
    for (const k of allowed)
      if (req.body[k] !== undefined) payload[k] = req.body[k];
    if (Object.keys(payload).length === 0)
      return res.status(400).json({ error: "Nothing to update" });

    const { data, error } = await supabase
      .from("campaigns")
      .update(payload)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) {
      console.error("updateCampaign update error", error);
      return res.status(500).json({ error: "Failed to update campaign" });
    }

    return res.json({ campaign: data });
  } catch (err) {
    console.error("updateCampaign exception", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/*
  deleteCampaign:
  - Owner only
*/
export async function deleteCampaign(req, res) {
  try {
    const authUser = req.user;
    if (!authUser) return res.status(401).json({ error: "Not authenticated" });

    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "id required" });

    const { data: campaign, error: cErr } = await supabase
      .from("campaigns")
      .select("id, school_id")
      .eq("id", id)
      .maybeSingle();
    if (cErr) {
      console.error("deleteCampaign fetch error", cErr);
      return res.status(500).json({ error: "DB error" });
    }
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    const { data: school, error: sErr } = await supabase
      .from("schools")
      .select("owner_id")
      .eq("id", campaign.school_id)
      .maybeSingle();
    if (sErr) {
      console.error("deleteCampaign school fetch err", sErr);
      return res.status(500).json({ error: "DB error" });
    }
    if (!school || String(school.owner_id) !== String(authUser.id))
      return res.status(403).json({ error: "Not authorized" });

    const { error } = await supabase.from("campaigns").delete().eq("id", id);
    if (error) {
      console.error("deleteCampaign delete error", error);
      return res.status(500).json({ error: "Failed to delete campaign" });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("deleteCampaign exception", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/*
  getCampaignDonations:
  - Only the school owner (or admins) should be able to fetch all donations for a campaign.
*/
export async function getCampaignDonations(req, res) {
  try {
    const authUser = req.user;
    const { id: campaign_id } = req.params;
    if (!campaign_id)
      return res.status(400).json({ error: "campaign id required" });

    // Verify campaign -> school -> owner
    const { data: campaign, error: campErr } = await supabase
      .from("campaigns")
      .select("id, school_id")
      .eq("id", campaign_id)
      .maybeSingle();
    if (campErr) {
      console.error("getCampaignDonations campaign fetch", campErr);
      return res.status(500).json({ error: "DB error" });
    }
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    const { data: school, error: sErr } = await supabase
      .from("schools")
      .select("owner_id")
      .eq("id", campaign.school_id)
      .maybeSingle();
    if (sErr) {
      console.error("getCampaignDonations school fetch", sErr);
      return res.status(500).json({ error: "DB error" });
    }
    if (!school || String(school.owner_id) !== String(authUser.id))
      return res.status(403).json({ error: "Not authorized" });

    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .eq("campaign_id", campaign_id)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("getCampaignDonations error", error);
      return res.status(500).json({ error: "DB error" });
    }

    return res.json({ donations: data });
  } catch (err) {
    console.error("getCampaignDonations exception", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
