"use client";

import { FormEvent, useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";

type LoginScreenProps = {
  error?: string;
  onSubmit: (email: string, password: string) => Promise<void> | void;
};

export function LoginScreen({ error, onSubmit }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(email.trim(), password);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand" aria-label="Nexus Vault">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            <ShieldCheck size={28} />
          </span>
          <span>NEXUS VAULT</span>
        </div>
        <div>
          <p className="eyebrow">Seu espaço privado</p>
          <h1>Credenciais protegidas.<br />Sempre ao seu alcance.</h1>
          <p className="auth-lead">
            Senhas, tokens e chaves são criptografados no seu dispositivo
            antes de seguirem para a nuvem.
          </p>
        </div>
        <div className="security-note">
          <LockKeyhole size={18} aria-hidden="true" />
          <span>Criptografia ponta a ponta com AES-256-GCM</span>
        </div>
      </section>

      <section className="auth-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-card-icon" aria-hidden="true">
            <LockKeyhole size={24} />
          </div>
          <p className="eyebrow">Acesso pessoal</p>
          <h2>Entrar no Nexus Vault</h2>
          <p className="muted">Use a conta autorizada no Supabase.</p>

          <label className="field">
            <span>E-mail</span>
            <input
              autoComplete="email"
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@exemplo.com"
              required
              type="email"
              value={email}
            />
          </label>

          <label className="field">
            <span>Senha</span>
            <input
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Sua senha de acesso"
              required
              type="password"
              value={password}
            />
          </label>

          {error ? <p className="form-error" role="alert">{error}</p> : null}

          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? "Entrando..." : "Entrar"}
          </button>
          <p className="auth-footnote">
            Acesso restrito. Não existe cadastro público.
          </p>
        </form>
      </section>
    </main>
  );
}
