import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Use a valid placeholder during build/prerender when env vars aren't set
  const safeUrl = url && url.startsWith("http") ? url : "https://placeholder.supabase.co";
  const safeKey = key && key !== "your_supabase_anon_key" ? key : "placeholder-key";

  return createBrowserClient(safeUrl, safeKey);
}
