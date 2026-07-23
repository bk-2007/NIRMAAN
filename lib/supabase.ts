import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xyzcompany.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key";

// Public anon client (not used for backend privileged operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

let cachedAdminClient: any = null;

// Privileged admin client using service role key (bypasses RLS on the server)
// Wrapped in a Proxy to avoid module-loading/static-build exceptions when env vars are missing
export const supabaseAdmin = new Proxy({} as any, {
  get(target, prop) {
    if (!cachedAdminClient) {
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const isSupabaseActive = process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("xyzcompany");

      if (isSupabaseActive && !supabaseServiceKey) {
        throw new Error(
          "FATAL: SUPABASE_SERVICE_ROLE_KEY environment variable is not defined but Supabase is active. " +
          "Please define it in your .env file to execute privileged server-side operations bypassing RLS."
        );
      }

      cachedAdminClient = createClient(
        supabaseUrl,
        supabaseServiceKey || supabaseAnonKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      );
    }
    return cachedAdminClient[prop];
  },
});
