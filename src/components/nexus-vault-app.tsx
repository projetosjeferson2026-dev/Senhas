"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, LoaderCircle, Settings2, ShieldCheck } from "lucide-react";

import { CredentialModal } from "@/components/credential-modal";
import { LoginScreen } from "@/components/login-screen";
import { UnlockScreen } from "@/components/unlock-screen";
import { VaultDashboard } from "@/components/vault-dashboard";
import { decryptJson, encryptJson } from "@/lib/crypto";
import type { SupabaseConfiguration } from "@/lib/supabase";
import {
  createVaultProfile,
  unlockVault,
  type VaultEntry,
  type VaultEntryDraft,
  type VaultProfile,
} from "@/lib/vault";
import type { VaultUser } from "@/lib/vault-backend";

type AppStatus = "loading" | "signed-out" | "locked" | "unlocked";
const AUTO_LOCK_MS = 5 * 60 * 1000;

export function NexusVaultApp({
  configuration,
}: {
  configuration: SupabaseConfiguration | null;
}) {
  const [status, setStatus] = useState<AppStatus>("loading");
  const [user, setUser] = useState<VaultUser | null>(null);
  const [profile, setProfile] = useState<VaultProfile | null>(null);
  const [vaultKey, setVaultKey] = useState<CryptoKey | null>(null);
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<VaultEntry | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");

  const isAuthorized = useCallback(
    (email: string) =>
      email.trim().toLocaleLowerCase("pt-BR") === configuration?.allowedEmail,
    [configuration?.allowedEmail],
  );

  const loadAuthenticatedUser = useCallback(
    async (currentUser: VaultUser) => {
      if (!configuration) return;
      if (!isAuthorized(currentUser.email)) {
        await configuration.backend.signOut();
        setUser(null);
        setStatus("signed-out");
        setError("Esta conta não está autorizada.");
        return;
      }

      const currentProfile = await configuration.backend.getProfile();
      setUser(currentUser);
      setProfile(currentProfile);
      setStatus("locked");
    },
    [configuration, isAuthorized],
  );

  useEffect(() => {
    if (!configuration) return;
    let active = true;

    configuration.backend
      .getUser()
      .then(async (currentUser) => {
        if (!active) return;
        if (currentUser) await loadAuthenticatedUser(currentUser);
        else setStatus("signed-out");
      })
      .catch(() => {
        if (active) {
          setError("Não foi possível verificar sua sessão.");
          setStatus("signed-out");
        }
      });

    const unsubscribe = configuration.backend.onAuthChange((currentUser) => {
      if (!active || currentUser) return;
      setVaultKey(null);
      setEntries([]);
      setUser(null);
      setStatus("signed-out");
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [configuration, loadAuthenticatedUser]);

  const lockVault = useCallback(() => {
    setVaultKey(null);
    setEntries([]);
    setEditingEntry(null);
    setModalOpen(false);
    setError("");
    setStatus("locked");
  }, []);

  useEffect(() => {
    if (status !== "unlocked") return;
    let timer = window.setTimeout(lockVault, AUTO_LOCK_MS);
    const resetTimer = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(lockVault, AUTO_LOCK_MS);
    };
    const events: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [lockVault, status]);

  if (!configuration) return <ConfigurationScreen />;

  async function handleSignIn(email: string, password: string) {
    setError("");
    try {
      const signedInUser = await configuration!.backend.signIn(email, password);
      await loadAuthenticatedUser(signedInUser);
    } catch (signInError) {
      setError(
        signInError instanceof Error
          ? signInError.message
          : "Não foi possível entrar.",
      );
    }
  }

  async function handleUnlock(masterPassword: string) {
    setError("");
    try {
      let key: CryptoKey;
      let activeProfile = profile;

      if (activeProfile) {
        key = await unlockVault(masterPassword, activeProfile);
      } else {
        const created = await createVaultProfile(masterPassword);
        activeProfile = created.profile;
        key = created.key;
        await configuration!.backend.saveProfile(activeProfile);
        setProfile(activeProfile);
      }

      const encryptedItems = await configuration!.backend.listItems();
      const decryptionResults = await Promise.allSettled(
        encryptedItems.map(async (item) => ({
          ...(await decryptJson<VaultEntryDraft>(key, item)),
          id: item.id,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
      );
      const decryptedEntries = decryptionResults.flatMap((result) =>
        result.status === "fulfilled" ? [result.value] : [],
      );
      const corruptedCount = decryptionResults.length - decryptedEntries.length;

      setVaultKey(key);
      setEntries(decryptedEntries);
      if (corruptedCount > 0) {
        setError(
          `${corruptedCount} ${corruptedCount === 1 ? "credencial não pôde" : "credenciais não puderam"} ser descriptografada${corruptedCount === 1 ? "" : "s"}. Os demais dados continuam disponíveis.`,
        );
      }
      setStatus("unlocked");
    } catch (unlockError) {
      setError(
        unlockError instanceof Error
          ? unlockError.message
          : "Não foi possível desbloquear o cofre.",
      );
    }
  }

  async function handleSaveEntry(draft: VaultEntryDraft) {
    if (!vaultKey) return;
    setModalError("");
    try {
      const encrypted = await encryptJson(vaultKey, draft);
      if (editingEntry) {
        const updatedAt = await configuration!.backend.updateItem(editingEntry.id, encrypted);
        setEntries((current) =>
          current.map((entry) =>
            entry.id === editingEntry.id ? { ...entry, ...draft, updatedAt } : entry,
          ),
        );
      } else {
        const created = await configuration!.backend.createItem(encrypted);
        setEntries((current) => [
          {
            ...draft,
            id: created.id,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
          },
          ...current,
        ]);
      }
      setModalOpen(false);
      setEditingEntry(null);
    } catch {
      setModalError("Não foi possível salvar a credencial.");
    }
  }

  async function handleDeleteEntry(entry: VaultEntry) {
    if (!window.confirm(`Excluir “${entry.title}”? Esta ação não pode ser desfeita.`)) return;
    try {
      await configuration!.backend.deleteItem(entry.id);
      setEntries((current) => current.filter((item) => item.id !== entry.id));
    } catch {
      setError("Não foi possível excluir a credencial.");
    }
  }

  async function handleSignOut() {
    setVaultKey(null);
    setEntries([]);
    setProfile(null);
    setUser(null);
    setStatus("signed-out");
    await configuration!.backend.signOut();
  }

  if (status === "loading") {
    return (
      <main className="loading-screen">
        <LoaderCircle className="spin" size={34} aria-hidden="true" />
        <p>Preparando seu cofre...</p>
      </main>
    );
  }

  if (status === "signed-out") {
    return <LoginScreen error={error} onSubmit={handleSignIn} />;
  }

  if (status === "locked") {
    return (
      <UnlockScreen
        error={error}
        firstUse={!profile}
        onSignOut={handleSignOut}
        onUnlock={handleUnlock}
      />
    );
  }

  return (
    <>
      {error ? <div className="global-alert" role="alert"><AlertTriangle size={17} />{error}</div> : null}
      <VaultDashboard
        email={user?.email ?? ""}
        entries={entries}
        onCreate={() => {
          setEditingEntry(null);
          setModalError("");
          setModalOpen(true);
        }}
        onDelete={handleDeleteEntry}
        onEdit={(entry) => {
          setEditingEntry(entry);
          setModalError("");
          setModalOpen(true);
        }}
        onLock={lockVault}
        onSignOut={handleSignOut}
      />
      {modalOpen ? (
        <CredentialModal
          entry={editingEntry}
          error={modalError}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveEntry}
        />
      ) : null}
    </>
  );
}

function ConfigurationScreen() {
  return (
    <main className="config-page">
      <section className="config-card">
        <span className="config-icon" aria-hidden="true"><Settings2 size={26} /></span>
        <p className="eyebrow">Configuração necessária</p>
        <h1>Configure o Supabase</h1>
        <p>Defina estas variáveis na Vercel para conectar autenticação e banco:</p>
        <ul>
          <li><code>NEXT_PUBLIC_SUPABASE_URL</code></li>
          <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
          <li><code>NEXT_PUBLIC_ALLOWED_EMAIL</code></li>
        </ul>
        <div className="zero-knowledge-note"><ShieldCheck size={18} /><span>Nunca use a service role key no navegador.</span></div>
      </section>
    </main>
  );
}
