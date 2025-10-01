// import supabase from "../../src/config/supabaseClient.js";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";

// // SIGNUP
// export const signUp = async (req, res) => {
//   try {
//     const {
//       email,
//       password,
//       firstName,
//       lastName,
//       userType,
//       graduationYear,
//       institutionName,
//       location,
//     } = req.body;

//     // Basic validation
//     if (!email || !password || !userType || !location) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     if (userType === "alumni" && !graduationYear) {
//       return res.status(400).json({ error: "Graduation year is required for alumni" });
//     }

//     if (userType === "institution" && !institutionName) {
//       return res.status(400).json({ error: "Institution name is required" });
//     }

//     // Check if email already exists
//     const { data: existingUser, error: existingError } = await supabase
//       .from("users")
//       .select("*")
//       .eq("email", email)
//       .single();

//     if (existingError && existingError.code !== "PGRST116")
//       return res.status(500).json({ error: existingError.message });

//     if (existingUser) return res.status(400).json({ error: "Email already in use" });

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Insert new user into Supabase
//     const { data, error } = await supabase
//       .from("users")
//       .insert([{
//         email,
//         password: hashedPassword,
//         first_name: firstName,
//         last_name: lastName,
//         user_type: userType,
//         graduation_year: graduationYear || null,
//         institution_name: institutionName || null,
//         location,
//       }])
//       .select();

//     if (error) return res.status(400).json({ error: error.message });

//     const user = data[0];

//     // Generate JWT including userType
//     const token = jwt.sign(
//       { id: user.id, email: user.email, userType: user.user_type },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.status(201).json({
//       message: "User created successfully",
//       user,
//       token,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// // LOGIN
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password)
//       return res.status(400).json({ error: "Email and password required" });

//     // Fetch user from Supabase
//     const { data: user, error } = await supabase
//       .from("users")
//       .select("*")
//       .eq("email", email)
//       .single();

//     if (error || !user) return res.status(400).json({ error: "Invalid credentials" });

//     // Compare password
//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) return res.status(400).json({ error: "Invalid credentials" });

//     // Generate JWT
//     const token = jwt.sign(
//       { id: user.id, email: user.email, userType: user.user_type },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.json({ message: "Login successful", token, user });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

import supabase from "../../src/config/supabaseClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// SIGNUP
export const signUp = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      userType,
      graduationYear,
      institutionName,
      displayName,
      registrationNumber,
      street,
      city,
      state,
      pincode,
      country,
      contactPersonName,
      contactEmail,
      contactPhone,
      website,
      description,
    } = req.body;

    const logo = req.files?.logo;

    // Basic validation
    if (!email || !password || !userType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (userType === "alumni" && (!firstName || !lastName || !graduationYear)) {
      return res
        .status(400)
        .json({ error: "First name, last name, and graduation year are required for alumni" });
    }

    if (userType === "institution" && !institutionName) {
      return res.status(400).json({ error: "Institution name is required" });
    }

    if (logo) {
      if (!["image/jpeg", "image/png"].includes(logo.mimetype)) {
        return res.status(400).json({ error: "Logo must be a JPEG or PNG image" });
      }
      if (logo.size > 5 * 1024 * 1024) {
        return res.status(400).json({ error: "Logo must be less than 5MB" });
      }
    }

    // Check if email already exists
    const { data: existingUser, error: existingError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existingError && existingError.code !== "PGRST116")
      return res.status(500).json({ error: existingError.message });

    if (existingUser) return res.status(400).json({ error: "Email already in use" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into Supabase
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([{
        email,
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        user_type: userType,
        graduation_year: userType === "alumni" ? graduationYear : null,
        institution_name: institutionName || null,
      }])
      .select()
      .single();

    if (userError) return res.status(400).json({ error: userError.message });

    const user = userData;

    // Handle logo upload for institutions
    let logoUrl = null;
    if (userType === "institution" && logo) {
      const fileName = `${user.id}/${logo.name}`;
      const { error: uploadError } = await supabase.storage
        .from("school-logos")
        .upload(fileName, logo.data, {
          contentType: logo.mimetype,
          upsert: true,
        });

      if (uploadError) {
        // Delete the user if logo upload fails
        await supabase.from("users").delete().eq("id", user.id);
        return res.status(500).json({ error: "Failed to upload logo" });
      }

      const { data: publicUrlData } = supabase.storage
        .from("school-logos")
        .getPublicUrl(fileName);

      logoUrl = publicUrlData.publicUrl;
    }

    // Create school record for institutions
    if (userType === "institution") {
      const { error: schoolError } = await supabase
        .from("schools")
        .insert([{
          owner_id: user.id,
          name: institutionName,
          display_name: displayName || institutionName,
          registration_number: registrationNumber,
          street,
          city,
          state,
          pincode,
          country: country || "India",
          contact_person_name: contactPersonName,
          contact_email: contactEmail || email,
          contact_phone: contactPhone,
          website,
          description,
          logo_url: logoUrl,
        }]);

      if (schoolError) {
        // Delete the user if school creation fails
        await supabase.from("users").delete().eq("id", user.id);
        return res.status(400).json({ error: schoolError.message });
      }
    }

    // Generate JWT including userType
    const token = jwt.sign(
      { id: user.id, email: user.email, userType: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "User created successfully",
      user,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    // Fetch user from Supabase
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) return res.status(400).json({ error: "Invalid credentials" });

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, userType: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};