"use client";

import { FormEvent, useState } from "react";
import { KeyRound, LogOut, ShieldKeyhole } from "lucide-react";

type UnlockScreenProps = {
  error?: string;
  firstUse: boolean;
  onSignOut: () => Promise<void> | void;
  onUnlock: (password: string) => Promise<void> | void;
};

export function UnlockScreen({
  error,
  firstUse,
  onSignOut,
  onUnlock,
}: UnlockScreenProps) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [localError, setLocalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError("");

    if (password.length < 12) {
      setLocalError("Use pelo menos 12 caracteres na senha-mestra.");
      return;
    }
    if (firstUse && password !== confirmation) {
      setLocalError("As senhas-mestras não coincidem.");
      return;
    }

    setSubmitting(true);
    try {
      await onUnlock(password);
    } finally {
      setSubmitting(false);
    }
  }

  const visibleError = localError || error;

  return (
    <main className="unlock-page">
      <header className="simple-header">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            <ShieldKeyhole size={26} />
          </span>
          <span>NEXUS VAULT</span>
        </div>
        <button className="text-button" onClick={onSignOut} type="button">
          <LogOut size={16} aria-hidden="true" /> Sair
        </button>
      </header>

      <section className="unlock-card">
        <div className="unlock-orbit" aria-hidden="true">
          <span><KeyRound size={30} /></span>
        </div>
        <p className="eyebrow">Criptografia local</p>
        <h1>{firstUse ? "Criar senha-mestra" : "Desbloquear cofre"}</h1>
        <p className="muted unlock-copy">
          {firstUse
            ? "Escolha uma senha com pelo menos 12 caracteres para proteger suas credenciais. Guarde-a bem: ela não pode ser recuperada."
            : "Digite sua senha-mestra para acessar suas senhas, tokens e chaves."}
        </p>

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Senha-mestra</span>
            <input
              autoComplete="off"
              autoFocus
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo de 12 caracteres"
              type="password"
              value={password}
            />
          </label>

          {firstUse ? (
            <label className="field">
              <span>Confirmar senha-mestra</span>
              <input
                autoComplete="off"
                onChange={(event) => setConfirmation(event.target.value)}
                placeholder="Digite novamente"
                type="password"
                value={confirmation}
              />
            </label>
          ) : null}

          {visibleError ? <p className="form-error" role="alert">{visibleError}</p> : null}

          <button className="primary-button" disabled={submitting} type="submit">
            {submitting
              ? "Abrindo seu cofre..."
              : firstUse
                ? "Criar e desbloquear"
                : "Desbloquear"}
          </button>
        </form>

        <div className="zero-knowledge-note">
          <ShieldKeyhole size={18} aria-hidden="true" />
          <span>Sua senha-mestra nunca sai deste dispositivo.</span>
        </div>
      </section>
    </main>
  );
}
