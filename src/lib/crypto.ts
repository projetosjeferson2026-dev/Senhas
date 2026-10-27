export const KDF_ITERATIONS = 600_000;

export type EncryptedPayload = {
  ciphertext: string;
  iv: string;
  version: 1;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const AAD = encoder.encode("nexus-vault:v1");

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export function createSalt(): string {
  return bytesToBase64(crypto.getRandomValues(new Uint8Array(32)));
}

export async function deriveVaultKey(
  password: string,
  salt: string,
): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      iterations: KDF_ITERATIONS,
      salt: base64ToBytes(salt),
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptJson(
  key: CryptoKey,
  value: unknown,
): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = encoder.encode(JSON.stringify(value));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: AAD, tagLength: 128 },
    key,
    plaintext,
  );

  return {
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
    iv: bytesToBase64(iv),
    version: 1,
  };
}

export async function decryptJson<T>(
  key: CryptoKey,
  payload: EncryptedPayload,
): Promise<T> {
  if (payload.version !== 1) {
    throw new Error("Versão de criptografia não suportada.");
  }

  try {
    const plaintext = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: base64ToBytes(payload.iv),
        additionalData: AAD,
        tagLength: 128,
      },
      key,
      base64ToBytes(payload.ciphertext),
    );

    return JSON.parse(decoder.decode(plaintext)) as T;
  } catch {
    throw new Error("Não foi possível desbloquear o cofre.");
  }
}
