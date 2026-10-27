import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("Supabase database authorization", () => {
  it("requires an explicit allowlist row for every vault policy", () => {
    const migration = readFileSync(
      join(process.cwd(), "supabase/migrations/001_nexus_vault.sql"),
      "utf8",
    );

    expect(migration).toContain("create table if not exists public.vault_authorized_users");
    expect(migration).toContain("revoke all on table public.vault_authorized_users");
    expect(migration.match(/public\.vault_authorized_users/g)?.length).toBeGreaterThanOrEqual(5);
    expect(migration).toContain("exists (");
    expect(migration).toContain("authorized.user_id = (select auth.uid())");
  });
});
