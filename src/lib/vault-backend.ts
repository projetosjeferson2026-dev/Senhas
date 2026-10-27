import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { EncryptedPayload } from "@/lib/crypto";
import type { VaultProfile } from "@/lib/vault";

export type VaultUser = { id: string; email: string };

export type EncryptedVaultItem = EncryptedPayload & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export interface VaultBackendPort {
  createItem(payload: EncryptedPayload): Promise<EncryptedVaultItem>;
  deleteItem(id: string): Promise<void>;
  getProfile(): Promise<VaultProfile | null>;
  getUser(): Promise<VaultUser | null>;
  listItems(): Promise<EncryptedVaultItem[]>;
  onAuthChange(callback: (user: VaultUser | null) => void): () => void;
  saveProfile(profile: VaultProfile): Promise<void>;
  signIn(email: string, password: string): Promise<VaultUser>;
  signOut(): Promise<void>;
  updateItem(id: string, payload: EncryptedPayload): Promise<string>;
}

function toVaultUser(user: User | null): VaultUser | null {
  if (!user?.email) return null;
  return { id: user.id, email: user.email };
}

export class VaultBackend implements VaultBackendPort {
  constructor(private readonly client: SupabaseClient) {}

  async getUser(): Promise<VaultUser | null> {
    const { data, error } = await this.client.auth.getUser();
    if (error) return null;
    return toVaultUser(data.user);
  }

  onAuthChange(callback: (user: VaultUser | null) => void) {
    const { data } = this.client.auth.onAuthStateChange((_event, session) => {
      callback(toVaultUser(session?.user ?? null));
    });
    return () => data.subscription.unsubscribe();
  }

  async signIn(email: string, password: string): Promise<VaultUser> {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error || !data.user?.email) throw new Error("E-mail ou senha inválidos.");
    return { id: data.user.id, email: data.user.email };
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  async getProfile(): Promise<VaultProfile | null> {
    const { data, error } = await this.client
      .from("vault_profiles")
      .select("salt, verifier_ciphertext, verifier_iv, crypto_version")
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      salt: data.salt,
      verifier: {
        ciphertext: data.verifier_ciphertext,
        iv: data.verifier_iv,
        version: data.crypto_version,
      },
    };
  }

  async saveProfile(profile: VaultProfile) {
    const user = await this.requireUser();
    const { error } = await this.client.from("vault_profiles").upsert({
      user_id: user.id,
      salt: profile.salt,
      verifier_ciphertext: profile.verifier.ciphertext,
      verifier_iv: profile.verifier.iv,
      crypto_version: profile.verifier.version,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  }

  async listItems(): Promise<EncryptedVaultItem[]> {
    const { data, error } = await this.client
      .from("vault_items")
      .select("id, ciphertext, iv, crypto_version, created_at, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      ciphertext: row.ciphertext,
      iv: row.iv,
      version: row.crypto_version,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async createItem(payload: EncryptedPayload): Promise<EncryptedVaultItem> {
    const user = await this.requireUser();
    const { data, error } = await this.client
      .from("vault_items")
      .insert({
        user_id: user.id,
        ciphertext: payload.ciphertext,
        iv: payload.iv,
        crypto_version: payload.version,
      })
      .select("id, ciphertext, iv, crypto_version, created_at, updated_at")
      .single();
    if (error) throw error;
    return {
      id: data.id,
      ciphertext: data.ciphertext,
      iv: data.iv,
      version: data.crypto_version,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateItem(id: string, payload: EncryptedPayload): Promise<string> {
    const updatedAt = new Date().toISOString();
    const { data, error } = await this.client
      .from("vault_items")
      .update({
        ciphertext: payload.ciphertext,
        iv: payload.iv,
        crypto_version: payload.version,
        updated_at: updatedAt,
      })
      .eq("id", id)
      .select("updated_at")
      .single();
    if (error) throw error;
    if (!data) throw new Error("Credencial não encontrada.");
    return data.updated_at;
  }

  async deleteItem(id: string) {
    const { data, error } = await this.client
      .from("vault_items")
      .delete()
      .eq("id", id)
      .select("id")
      .single();
    if (error) throw error;
    if (!data) throw new Error("Credencial não encontrada.");
  }

  private async requireUser(): Promise<VaultUser> {
    const user = await this.getUser();
    if (!user) throw new Error("Sessão expirada. Entre novamente.");
    return user;
  }
}
