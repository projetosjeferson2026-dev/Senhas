import { createClient } from "@supabase/supabase-js";

import { VaultBackend, type VaultBackendPort } from "@/lib/vault-backend";

export type SupabaseConfiguration = {
  allowedEmail: string;
  backend: VaultBackendPort;
};

let cachedConfiguration: SupabaseConfiguration | null | undefined;

export function getSupabaseConfiguration(): SupabaseConfiguration | null {
  if (cachedConfiguration !== undefined) return cachedConfiguration;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const allowedEmail = process.env.NEXT_PUBLIC_ALLOWED_EMAIL;

  if (!url || !anonKey || !allowedEmail) {
    cachedConfiguration = null;
    return cachedConfiguration;
  }

  cachedConfiguration = {
    allowedEmail: allowedEmail.trim().toLocaleLowerCase("pt-BR"),
    backend: new VaultBackend(
      createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      }),
    ),
  };
  return cachedConfiguration;
}
