import { supabase } from "../config/supabase.js";

export const getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("custom_users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({ message: "Intelligence Profile missing", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { id, username, email } = req.body;
    const { data, error } = await supabase
      .from("custom_users")
      .update({
        email,
        username
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Profile Sync Error:", error.message);
      return res.status(500).json({ 
        message: "Identity Sync Failed", 
        error: error.message,
        hint: "Check if 'custom_users' table exists."
      });
    }
    res.status(200).json(data[0]);
  } catch (error) {
    res.status(500).json({ message: "Profile update failed", error: error.message });
  }
};
