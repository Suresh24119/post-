import { supabase } from "./config/supabase.js";

async function checkBuckets() {
  console.log("Checking Supabase Storage buckets...");
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error("Bucket check failed:", error);
    return;
  }
  console.log("Buckets found:", data.map(b => b.name).join(", "));
  
  const uploadBucket = data.find(b => b.name === "posts");
  if (!uploadBucket) {
    console.log("CRITICAL: 'posts' bucket MISSING. Creating it...");
    const { data: newBucket, error: createError } = await supabase.storage.createBucket("posts", {
      public: true
    });
    if (createError) console.error("Failed to create bucket:", createError.message);
    else console.log("Bucket created successfully.");
  } else {
    console.log("'posts' bucket exists.");
  }
}

checkBuckets();
