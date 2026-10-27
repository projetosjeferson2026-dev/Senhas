import { afterEach, describe, expect, it, vi } from "vitest";

import { getSupabaseConfiguration } from "@/lib/supabase";

afterEach(() => vi.unstubAllEnvs());

describe("Supabase configuration", () => {
  it("reuses one auth client inside the same browser tab", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "sb_publishable_test");
    vi.stubEnv("NEXT_PUBLIC_ALLOWED_EMAIL", "eu@exemplo.com");

    const first = getSupabaseConfiguration();
    const second = getSupabaseConfiguration();

    expect(first?.backend).toBe(second?.backend);
  });
});
