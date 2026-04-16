import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function inspectTable() {
  const { data, error } = await supabase
    .from("custom_users")
    .select("*")
    .limit(1);

  if (error) {
    console.error("Error inspecting table:", error.message);
    return;
  }

  if (data && data.length > 0) {
    console.log("Table 'posts' structure (first record):");
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log("Table 'posts' is empty.");
  }
}

inspectTable();
