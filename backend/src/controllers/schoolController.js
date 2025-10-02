import supabase from "../../src/config/supabaseClient.js";

/**
 * createSchool - creates a school profile. Owner is taken from authenticated JWT (req.user.id)
 * Protected: authenticateToken middleware must run before this.
 *
 * Body: {
 *  name, display_name, registration_number, street, city, state, pincode,
 *  contact_person_name, contact_email, contact_phone, website, logo_url, description, metadata
 * }
 */
export async function createSchool(req, res) {
  try {
    const authUser = req.user; // set by authenticateToken middleware
    if (!authUser || !authUser.id) return res.status(401).json({ error: "Not authenticated" });

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

    if (!name) return res.status(400).json({ error: "name is required" });

    const { data, error } = await supabase
      .from("schools")
      .insert([
        {
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
        },
      ])
      .select()
      .maybeSingle();

    if (error) {
      console.error("createSchool insert error", error);
      return res.status(500).json({ error: error.message || "Failed to create school" });
    }

    return res.status(201).json({ school: data });
  } catch (err) {
    console.error("createSchool error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * listSchools - public listing of schools (no auth required in server; endpoint is protected in routes if desired)
 * Query params: ?q=searchTerm
 */
export async function listSchools(req, res) {
  try {
    const q = (req.query.q || "").trim();

    let builder = supabase.from("schools").select("*").order("created_at", { ascending: false });

    if (q) {
      builder = builder.ilike("name", `%${q}%`);
    }

    const { data, error } = await builder;
    if (error) {
      console.error("listSchools error", error);
      return res.status(500).json({ error: error.message || "Failed to list schools" });
    }

    return res.json({ schools: data });
  } catch (err) {
    console.error("listSchools exception", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * getSchool - get a single school by id
 */
export async function getSchool(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "id required" });

    const { data, error } = await supabase.from("schools").select("*").eq("id", id).maybeSingle();
    if (error) {
      console.error("getSchool error", error);
      return res.status(500).json({ error: error.message || "Failed to fetch school" });
    }
    if (!data) return res.status(404).json({ error: "School not found" });

    return res.json({ school: data });
  } catch (err) {
    console.error("getSchool exception", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * updateSchool - updates a school profile. Only the owner (from JWT) can update.
 * Protected: authenticateToken middleware must run before this.
 *
 * Path: /api/schools/:id
 * Body: {
 *  display_name, street, city, state, pincode, contact_person_name,
 *  contact_email, contact_phone, website, logo_url, description
 * }
 */
export async function updateSchool(req, res) {
  try {
    const authUser = req.user; // set by authenticateToken middleware
    if (!authUser || !authUser.id) return res.status(401).json({ error: "Not authenticated" });

    if (authUser.userType !== "institution") {
      return res.status(403).json({ error: "Only institution users can update school profiles" });
    }

    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "id required" });

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
      logo_url = null,
      description = null,
    } = req.body;

    // Check if the authenticated user owns the school
    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .select("owner_id")
      .eq("id", id)
      .eq("owner_id", authUser.id)
      .maybeSingle();

    if (schoolError || !school) {
      return res.status(404).json({ error: "School not found or you do not have permission" });
    }

    // Update only the provided fields
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
      logo_url,
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
      console.error("updateSchool error", error);
      return res.status(500).json({ error: error.message || "Failed to update school" });
    }

    return res.json({ school: data });
  } catch (err) {
    console.error("updateSchool exception", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}