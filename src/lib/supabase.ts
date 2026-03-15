import { createClient } from "@supabase/supabase-js";

type SupabaseConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

function getSupabaseConfig(required: true): SupabaseConfig;
function getSupabaseConfig(required?: false): SupabaseConfig | null;
function getSupabaseConfig(required = true) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (!required) {
      return null;
    }

    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

export function createSupabaseServerClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig(true);

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}

export function createSupabaseBrowserClient() {
  const config = getSupabaseConfig(false);

  if (!config) {
    return null;
  }

  const { supabaseUrl, supabaseAnonKey } = config;

  return createClient(supabaseUrl, supabaseAnonKey);
}

export function hasSupabasePublicConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
