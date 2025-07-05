import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_PROJECT_URL: string | undefined = process.env.REACT_APP_SUPABASE_PROJECT_URL;
const SUPABASE_API_KEY: string | undefined = process.env.REACT_APP_SUPABASE_ANON_KEY;

// 런타임에서 undefined 체크 후 타입 단언
if (!SUPABASE_PROJECT_URL) {
  throw new Error('SUPABASE_PROJECT_URL is not defined');
}
if (!SUPABASE_API_KEY) {
  throw new Error('SUPABASE_API_KEY is not defined');
}

const supabase: SupabaseClient = createClient(SUPABASE_PROJECT_URL, SUPABASE_API_KEY);

export default supabase;
