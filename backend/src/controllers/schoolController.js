import supabase from "../../src/config/supabaseClient.js";

export async function createSchool(req, res) {
  try {
    const authUser = req.user;
    if (!authUser?.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (authUser.userType !== "institution") {
      return res.status(403).json({ error: "Only institution users can create school profiles" });
    }

    const {
      name,
      display_name = null,
      registration_number = null,
      street = null,
      city = null,
      state = null,
      pincode = null,
      country = "India",
      contact_person_name = null,
      contact_email = null,
      contact_phone = null,
      website = null,
      logo_url = null,
      description = null,
      metadata = {},
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }

    const { data, error } = await supabase
      .from("schools")
      .insert([{
        owner_id: authUser.id,
        name,
        display_name,
        registration_number,
        street,
        city,
        state,
        pincode,
        country,
        contact_person_name,
        contact_email,
        contact_phone,
        website,
        logo_url,
        description,
        metadata,
      }])
      .select()
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message || "Failed to create school" });
    }

    return res.status(201).json({ school: data });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function listSchools(req, res) {
  try {
    const q = (req.query.q || "").trim();
    let builder = supabase.from("schools").select("*").order("created_at", { ascending: false });

    if (q) {
      builder = builder.ilike("name", `%${q}%`);
    }

    const { data, error } = await builder;

    if (error) {
      return res.status(500).json({ error: error.message || "Failed to list schools" });
    }

    return res.json({ schools: data });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getSchool(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "id required" });
    }

    const { data, error } = await supabase
      .from("schools")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message || "Failed to fetch school" });
    }
    if (!data) {
      return res.status(404).json({ error: "School not found" });
    }

    return res.json({ school: data });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateSchool(req, res) {
  try {
    const authUser = req.user;
    if (!authUser?.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (authUser.userType !== "institution") {
      return res.status(403).json({ error: "Only institution users can update school profiles" });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "id required" });
    }

    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .select("owner_id, logo_url")
      .eq("id", id)
      .eq("owner_id", authUser.id)
      .maybeSingle();

    if (schoolError || !school) {
      return res.status(404).json({ error: "School not found or you do not have permission" });
    }

    let logoUrl = school.logo_url;
    const logo = req.files?.logo;

    if (logo) {
      if (!["image/jpeg", "image/png"].includes(logo.mimetype)) {
        return res.status(400).json({ error: "Logo must be a JPEG or PNG image" });
      }
      if (logo.size > 5 * 1024 * 1024) {
        return res.status(400).json({ error: "Logo must be less than 5MB" });
      }

      const fileName = `${id}/${logo.name}`;
      const { error: uploadError } = await supabase.storage
        .from("school-logos")
        .upload(fileName, logo.data, {
          contentType: logo.mimetype,
          upsert: true,
        });

      if (uploadError) {
        return res.status(500).json({ error: "Failed to upload logo" });
      }

      const { data: publicUrlData } = supabase.storage
        .from("school-logos")
        .getPublicUrl(fileName);

      logoUrl = publicUrlData.publicUrl;
    }

    const {
      display_name = null,
      street = null,
      city = null,
      state = null,
      pincode = null,
      contact_person_name = null,
      contact_email = null,
      contact_phone = null,
      website = null,
      description = null,
    } = req.body;

    const updateData = {
      display_name,
      street,
      city,
      state,
      pincode,
      contact_person_name,
      contact_email,
      contact_phone,
      website,
      logo_url: logoUrl,
      description,
      updated_at: new Date(),
    };

    const { data, error } = await supabase
      .from("schools")
      .update(updateData)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message || "Failed to update school" });
    }

    return res.json({ school: data });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}