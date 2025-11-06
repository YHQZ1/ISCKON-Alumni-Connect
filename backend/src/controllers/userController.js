import supabase from "../../src/config/supabaseClient.js";
import bcrypt from "bcryptjs";

export async function getMe(req, res) {
  try {
    const authUser = req.user;
    if (!authUser?.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, user_type, graduation_year, institution_name, location, created_at")
      .eq("id", authUser.id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: "Database error" });
    }
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateProfile(req, res) {
  try {
    const authUser = req.user;
    if (!authUser?.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const allowedFields = ["first_name", "last_name", "location", "graduation_year", "institution_name"];
    const payload = {};
    
    for (const k of allowedFields) {
      if (typeof req.body[k] !== "undefined") payload[k] = req.body[k];
    }
    
    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ error: "No updatable fields provided" });
    }

    const { data, error } = await supabase
      .from("users")
      .update(payload)
      .eq("id", authUser.id)
      .select()
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: "Failed to update profile" });
    }

    const safe = { ...data };
    delete safe.password;
    return res.json({ user: safe });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function changePassword(req, res) {
  try {
    const authUser = req.user;
    if (!authUser?.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "currentPassword and newPassword required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "newPassword must be at least 6 characters" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, password")
      .eq("id", authUser.id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: "Database error" });
    }
    if (!user?.password) {
      return res.status(400).json({ error: "Invalid user or password not set" });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    const { data, error: updateErr } = await supabase
      .from("users")
      .update({ password: newHash })
      .eq("id", authUser.id)
      .select()
      .maybeSingle();

    if (updateErr) {
      return res.status(500).json({ error: "Failed to update password" });
    }

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function listUsers(req, res) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, user_type, graduation_year, institution_name, location, created_at");

    if (error) {
      return res.status(500).json({ error: "Failed to fetch users" });
    }

    return res.json({ users: data });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getUser(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "id required" });
    }

    const { data, error } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, user_type, graduation_year, institution_name, location, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: "Failed to fetch user" });
    }
    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user: data });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}