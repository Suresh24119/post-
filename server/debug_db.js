import { supabase } from "./config/supabase.js";

async function debugDB() {
  console.log("Fetching all posts to debug IDs...");
  const { data, error } = await supabase.from("posts").select("*");
  if (error) {
    console.error("Debug failed:", error);
    return;
  }
  console.log("Posts found:", data.length);
  data.forEach(p => {
    console.log(`ID: ${p.id} (type: ${typeof p.id}), Heading: ${p.heading}, File: ${p.file}`);
  });
}

debugDB();
