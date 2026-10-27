import {
  createSalt,
  decryptJson,
  deriveVaultKey,
  encryptJson,
  type EncryptedPayload,
} from "@/lib/crypto";

export const VAULT_CATEGORIES = [
  "site",
  "api",
  "database",
  "github",
  "vercel",
  "other",
] as const;

export type VaultCategory = (typeof VAULT_CATEGORIES)[number];
export type VaultCategoryFilter = VaultCategory | "all";

export type VaultEntryDraft = {
  title: string;
  category: VaultCategory;
  username: string;
  secret: string;
  url: string;
  notes: string;
  favorite: boolean;
};

export type VaultEntry = VaultEntryDraft & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type VaultProfile = {
  salt: string;
  verifier: EncryptedPayload;
};

export async function createVaultProfile(
  masterPassword: string,
): Promise<{ key: CryptoKey; profile: VaultProfile }> {
  const salt = createSalt();
  const key = await deriveVaultKey(masterPassword, salt);
  const verifier = await encryptJson(key, { marker: "nexus-vault" });

  return { key, profile: { salt, verifier } };
}

export async function unlockVault(
  masterPassword: string,
  profile: VaultProfile,
): Promise<CryptoKey> {
  const key = await deriveVaultKey(masterPassword, profile.salt);

  try {
    const verifier = await decryptJson<{ marker: string }>(key, profile.verifier);
    if (verifier.marker !== "nexus-vault") throw new Error("Invalid verifier");
    return key;
  } catch {
    throw new Error("Senha-mestra incorreta.");
  }
}

export function filterEntries(
  entries: VaultEntry[],
  query: string,
  category: VaultCategoryFilter,
): VaultEntry[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");

  return entries.filter((entry) => {
    if (category !== "all" && entry.category !== category) return false;
    if (!normalizedQuery) return true;

    return [entry.title, entry.username, entry.url, entry.notes, entry.category]
      .join(" ")
      .toLocaleLowerCase("pt-BR")
      .includes(normalizedQuery);
  });
}

export function validateEntryDraft(
  draft: VaultEntryDraft,
): Partial<Record<"title" | "secret", string>> {
  const errors: Partial<Record<"title" | "secret", string>> = {};
  if (!draft.title.trim()) errors.title = "Informe um nome para a credencial.";
  if (!draft.secret.trim()) errors.secret = "Informe a senha, token ou chave.";
  return errors;
}
