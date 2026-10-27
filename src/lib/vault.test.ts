import { describe, expect, it } from "vitest";

import {
  createVaultProfile,
  filterEntries,
  unlockVault,
  validateEntryDraft,
  type VaultEntry,
} from "@/lib/vault";

const entries: VaultEntry[] = [
  {
    id: "1",
    title: "GitHub pessoal",
    category: "github",
    username: "jeferson",
    secret: "token-1",
    url: "https://github.com",
    notes: "Conta principal",
    favorite: true,
    createdAt: "2026-10-26T20:00:00.000Z",
    updatedAt: "2026-10-26T20:00:00.000Z",
  },
  {
    id: "2",
    title: "Supabase produção",
    category: "database",
    username: "postgres",
    secret: "connection-string",
    url: "",
    notes: "Banco do Nexus",
    favorite: false,
    createdAt: "2026-10-26T20:00:00.000Z",
    updatedAt: "2026-10-26T20:00:00.000Z",
  },
];

describe("vault profile", () => {
  it("unlocks a newly created profile with the master password", async () => {
    const { profile } = await createVaultProfile("uma senha mestra forte");

    await expect(
      unlockVault("uma senha mestra forte", profile),
    ).resolves.toBeDefined();
  });

  it("rejects a wrong master password", async () => {
    const { profile } = await createVaultProfile("uma senha mestra forte");

    await expect(unlockVault("senha completamente errada", profile)).rejects.toThrow(
      "Senha-mestra incorreta.",
    );
  });
});

describe("vault entries", () => {
  it("filters by category and text without case sensitivity", () => {
    expect(filterEntries(entries, "GITHUB", "github")).toEqual([entries[0]]);
    expect(filterEntries(entries, "nexus", "all")).toEqual([entries[1]]);
  });

  it("requires a title and a secret", () => {
    expect(
      validateEntryDraft({
        title: "",
        category: "site",
        username: "",
        secret: "",
        url: "",
        notes: "",
        favorite: false,
      }),
    ).toEqual({
      title: "Informe um nome para a credencial.",
      secret: "Informe a senha, token ou chave.",
    });
  });
});
