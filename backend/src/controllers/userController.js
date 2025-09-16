// src/controllers/userController.js
import supabase from "../../src/config/supabaseClient.js"; // corrected path
import bcrypt from "bcryptjs";

/**
 * getMe - return the app user profile for the authenticated user (req.user.id)
 */
export async function getMe(req, res) {
  try {
    const authUser = req.user;
    if (!authUser || !authUser.id) return res.status(401).json({ error: "Not authenticated" });

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, user_type, graduation_year, institution_name, location, created_at")
      .eq("id", authUser.id)
      .maybeSingle();

    if (error) {
      console.error("getMe db error", error);
      return res.status(500).json({ error: "Database error" });
    }
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({ user });
  } catch (err) {
    console.error("getMe exception", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * updateProfile - patch app-level profile fields for authenticated user
 * Allowed updates: first_name, last_name, location, graduation_year, institution_name
 */
export async function updateProfile(req, res) {
  try {
    const authUser = req.user;
    if (!authUser || !authUser.id) return res.status(401).json({ error: "Not authenticated" });

    const allowedFields = ["first_name", "last_name", "location", "graduation_year", "institution_name"];
    const payload = {};
    for (const k of allowedFields) {
      if (typeof req.body[k] !== "undefined") payload[k] = req.body[k];
    }
    if (Object.keys(payload).length === 0) return res.status(400).json({ error: "No updatable fields provided" });

    const { data, error } = await supabase
      .from("users")
      .update(payload)
      .eq("id", authUser.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("updateProfile db error", error);
      return res.status(500).json({ error: "Failed to update profile" });
    }

    const safe = { ...data };
    delete safe.password;
    return res.json({ user: safe });
  } catch (err) {
    console.error("updateProfile exception", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * changePassword - change password for authenticated user
 * Body: { currentPassword, newPassword }
 */
export async function changePassword(req, res) {
  try {
    const authUser = req.user;
    if (!authUser || !authUser.id) return res.status(401).json({ error: "Not authenticated" });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: "currentPassword and newPassword required" });
    if (newPassword.length < 6) return res.status(400).json({ error: "newPassword must be at least 6 characters" });

    // fetch stored hash
    const { data: user, error } = await supabase
      .from("users")
      .select("id, password")
      .eq("id", authUser.id)
      .maybeSingle();

    if (error) {
      console.error("changePassword fetch error", error);
      return res.status(500).json({ error: "Database error" });
    }
    if (!user || !user.password) return res.status(400).json({ error: "Invalid user or password not set" });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ error: "Current password is incorrect" });

    const newHash = await bcrypt.hash(newPassword, 10);
    const { data, error: updateErr } = await supabase
      .from("users")
      .update({ password: newHash })
      .eq("id", authUser.id)
      .select()
      .maybeSingle();

    if (updateErr) {
      console.error("changePassword update error", updateErr);
      return res.status(500).json({ error: "Failed to update password" });
    }

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("changePassword exception", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}


/**
 * listUsers - get all users
 */
export async function listUsers(req, res) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, user_type, graduation_year, institution_name, location, created_at");

    if (error) {
      console.error("listUsers error", error);
      return res.status(500).json({ error: "Failed to fetch users" });
    }

    return res.json({ users: data });
  } catch (err) {
    console.error("listUsers exception", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * getUser - get one user by id
 */
export async function getUser(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "id required" });

    const { data, error } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, user_type, graduation_year, institution_name, location, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("getUser error", error);
      return res.status(500).json({ error: "Failed to fetch user" });
    }
    if (!data) return res.status(404).json({ error: "User not found" });

    return res.json({ user: data });
  } catch (err) {
    console.error("getUser exception", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
