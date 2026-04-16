import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://fsojqsoygbdjkptuoagy.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzb2pxc295Z2JkamtwdHVvYWd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODA1ODksImV4cCI6MjA5MDQ1NjU4OX0.7avpEUzBsupZcWu-FldvY6Y3d4KARWDLLCsDPhZP7s8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
