import supabase from "../../src/config/supabaseClient.js";

export async function createCampaign(req, res) {
  try {
    const authUser = req.user;
    if (!authUser?.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

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

    if (!school_id) {
      return res.status(400).json({ error: "school_id is required" });
    }
    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }

    const { data: school, error: schoolErr } = await supabase
      .from("schools")
      .select("id, owner_id")
      .eq("id", school_id)
      .maybeSingle();

    if (schoolErr) {
      return res.status(500).json({ error: "DB error" });
    }
    if (!school) {
      return res.status(404).json({ error: "School not found" });
    }
    if (String(school.owner_id) !== String(authUser.id)) {
      return res.status(403).json({ error: "You do not own this school" });
    }

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
      return res.status(500).json({ error: "Failed to create campaign" });
    }

    return res.status(201).json({ campaign: data });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function listCampaigns(req, res) {
  try {
    const { school_id, status, q } = req.query;
    let builder = supabase
      .from("campaigns")
      .select(
        "id, school_id, title, short_description, body, target_amount, current_amount, currency, status, start_at, end_at, created_at, metadata"
      )
      .order("created_at", { ascending: false });

    if (school_id) builder = builder.eq("school_id", school_id);
    if (status) builder = builder.eq("status", status);
    if (q) builder = builder.ilike("title", `%${q}%`);

    const { data, error } = await builder;

    if (error) {
      return res.status(500).json({ error: "Failed to list campaigns" });
    }

    return res.json({ campaigns: data });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getCampaign(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "id required" });
    }

    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: "Failed to fetch campaign" });
    }
    if (!data) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    return res.json({ campaign: data });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateCampaign(req, res) {
  try {
    const authUser = req.user;
    if (!authUser) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "id required" });
    }

    const { data: campaign, error: campErr } = await supabase
      .from("campaigns")
      .select("id, school_id")
      .eq("id", id)
      .maybeSingle();

    if (campErr) {
      return res.status(500).json({ error: "DB error" });
    }
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const { data: school, error: schoolErr } = await supabase
      .from("schools")
      .select("owner_id")
      .eq("id", campaign.school_id)
      .maybeSingle();

    if (schoolErr) {
      return res.status(500).json({ error: "DB error" });
    }
    if (!school || String(school.owner_id) !== String(authUser.id)) {
      return res.status(403).json({ error: "Not authorized" });
    }

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

    for (const k of allowed) {
      if (req.body[k] !== undefined) payload[k] = req.body[k];
    }

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    const { data, error } = await supabase
      .from("campaigns")
      .update(payload)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: "Failed to update campaign" });
    }

    return res.json({ campaign: data });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteCampaign(req, res) {
  try {
    const authUser = req.user;
    if (!authUser) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "id required" });
    }

    const { data: campaign, error: cErr } = await supabase
      .from("campaigns")
      .select("id, school_id")
      .eq("id", id)
      .maybeSingle();

    if (cErr) {
      return res.status(500).json({ error: "DB error" });
    }
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const { data: school, error: sErr } = await supabase
      .from("schools")
      .select("owner_id")
      .eq("id", campaign.school_id)
      .maybeSingle();

    if (sErr) {
      return res.status(500).json({ error: "DB error" });
    }
    if (!school || String(school.owner_id) !== String(authUser.id)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { error } = await supabase.from("campaigns").delete().eq("id", id);

    if (error) {
      return res.status(500).json({ error: "Failed to delete campaign" });
    }

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getCampaignDonations(req, res) {
  try {
    const authUser = req.user;
    const { id: campaign_id } = req.params;

    if (!campaign_id) {
      return res.status(400).json({ error: "campaign id required" });
    }

    const { data: campaign, error: campErr } = await supabase
      .from("campaigns")
      .select("id, school_id")
      .eq("id", campaign_id)
      .maybeSingle();

    if (campErr) {
      return res.status(500).json({ error: "DB error" });
    }
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const { data: school, error: sErr } = await supabase
      .from("schools")
      .select("owner_id")
      .eq("id", campaign.school_id)
      .maybeSingle();

    if (sErr) {
      return res.status(500).json({ error: "DB error" });
    }
    if (!school || String(school.owner_id) !== String(authUser.id)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .eq("campaign_id", campaign_id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: "DB error" });
    }

    return res.json({ donations: data });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const getCampaignDonorCount = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("donations")
      .select("donor_user_id, donor_email")
      .eq("campaign_id", id)
      .eq("status", "completed");

    if (error) throw error;

    const uniqueDonors = new Set();
    data.forEach((donation) => {
      const donorKey = donation.donor_user_id || donation.donor_email;
      if (donorKey) uniqueDonors.add(donorKey);
    });

    res.json({ donorCount: uniqueDonors.size });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch donor count" });
  }
};
