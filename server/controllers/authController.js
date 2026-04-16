import { supabase } from "../config/supabase.js";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const { data: existing } = await supabase
      .from("custom_users")
      .select("*")
      .eq("email", email)
      .single();

    if (existing) {
      return res.status(400).json({ message: "Identity already exists in archive" });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const { data, error } = await supabase
      .from("custom_users")
      .insert([{ 
        email, 
        password: hashedPassword, 
        username: email.split('@')[0] 
      }])
      .select();

    if (error) throw error;
    res.status(201).json({ user: data[0], message: "Access Granted" });
  } catch (error) {
    console.error("Registration technical error:", error.message);
    res.status(500).json({ message: "Registration Failed", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data: user, error } = await supabase
      .from("custom_users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: "Invalid Intelligence Credentials" });
    }

    // Compare Hashed Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Intelligence Credentials" });
    }

    // Strip password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({ user: userWithoutPassword, message: "Authentication Successful" });
  } catch (error) {
    console.error("Login technical error:", error.message);
    res.status(500).json({ message: "Login Error", error: error.message });
  }
};
