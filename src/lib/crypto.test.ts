import { describe, expect, it } from "vitest";

import {
  createSalt,
  decryptJson,
  deriveVaultKey,
  encryptJson,
} from "@/lib/crypto";

describe("vault cryptography", () => {
  it("decrypts encrypted JSON with the same master password", async () => {
    const salt = createSalt();
    const key = await deriveVaultKey("uma senha mestra forte", salt);
    const encrypted = await encryptJson(key, {
      title: "GitHub pessoal",
      secret: "token-super-secreto",
    });

    await expect(decryptJson(key, encrypted)).resolves.toEqual({
      title: "GitHub pessoal",
      secret: "token-super-secreto",
    });
  });

  it("creates a different IV and ciphertext for the same value", async () => {
    const key = await deriveVaultKey("uma senha mestra forte", createSalt());

    const first = await encryptJson(key, { secret: "mesmo-valor" });
    const second = await encryptJson(key, { secret: "mesmo-valor" });

    expect(first.iv).not.toBe(second.iv);
    expect(first.ciphertext).not.toBe(second.ciphertext);
  });

  it("rejects decryption with a different master password", async () => {
    const salt = createSalt();
    const correctKey = await deriveVaultKey("senha correta", salt);
    const wrongKey = await deriveVaultKey("senha incorreta", salt);
    const encrypted = await encryptJson(correctKey, { secret: "protegido" });

    await expect(decryptJson(wrongKey, encrypted)).rejects.toThrow(
      "Não foi possível desbloquear o cofre.",
    );
  });
});
