"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, KeyRound, X } from "lucide-react";
import { vaultCategories } from "@/lib/vault-categories";

import {
  validateEntryDraft,
  type VaultEntry,
  type VaultEntryDraft,
} from "@/lib/vault";

type CredentialModalProps = {
  entry: VaultEntry | null;
  error?: string;
  onClose: () => void;
  onSave: (draft: VaultEntryDraft) => Promise<void> | void;
};

const emptyDraft: VaultEntryDraft = {
  title: "",
  category: "site",
  username: "",
  secret: "",
  url: "",
  notes: "",
  favorite: false,
};

export function CredentialModal({ entry, error, onClose, onSave }: CredentialModalProps) {
  const [draft, setDraft] = useState<VaultEntryDraft>(
    entry
      ? {
          title: entry.title,
          category: entry.category,
          username: entry.username,
          secret: entry.secret,
          url: entry.url,
          notes: entry.notes,
          favorite: entry.favorite,
        }
      : emptyDraft,
  );
  const [errors, setErrors] = useState<ReturnType<typeof validateEntryDraft>>({});
  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof VaultEntryDraft>(key: K, value: VaultEntryDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateEntryDraft(draft);
    setErrors(validation);
    if (Object.keys(validation).length) return;

    setSaving(true);
    try {
      await onSave({ ...draft, title: draft.title.trim() });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section aria-labelledby="credential-modal-title" aria-modal="true" className="credential-modal" role="dialog">
        <header className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon" aria-hidden="true"><KeyRound size={20} /></span>
            <div><p className="eyebrow">Item criptografado</p><h2 id="credential-modal-title">{entry ? "Editar credencial" : "Nova credencial"}</h2></div>
          </div>
          <button aria-label="Fechar" className="icon-button" onClick={onClose} type="button"><X size={19} /></button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="modal-grid">
            <label className="field field-wide">
              <span>Nome</span>
              <input autoFocus onChange={(event) => update("title", event.target.value)} placeholder="Ex.: GitHub pessoal" value={draft.title} />
              {errors.title ? <small className="field-error" role="alert">{errors.title}</small> : null}
            </label>

            <label className="field">
              <span>Categoria</span>
              <select onChange={(event) => update("category", event.target.value as VaultEntryDraft["category"])} value={draft.category}>
                {vaultCategories.map(({ id, singular }) => (
                  <option key={id} value={id}>{singular}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Usuário ou identificação</span>
              <input autoComplete="off" onChange={(event) => update("username", event.target.value)} placeholder="E-mail, login ou usuário" value={draft.username} />
            </label>

            <label className="field field-wide">
              <span>Senha, token ou chave</span>
              <div className="secret-input-wrap">
                <input autoComplete="off" onChange={(event) => update("secret", event.target.value)} placeholder="Cole o segredo aqui" type={showSecret ? "text" : "password"} value={draft.secret} />
                <button aria-label={showSecret ? "Ocultar segredo" : "Revelar segredo"} onClick={() => setShowSecret((value) => !value)} type="button">
                  {showSecret ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.secret ? <small className="field-error" role="alert">{errors.secret}</small> : null}
            </label>

            <label className="field field-wide">
              <span>Endereço do site</span>
              <input inputMode="url" onChange={(event) => update("url", event.target.value)} placeholder="https://..." type="url" value={draft.url} />
            </label>

            <label className="field field-wide">
              <span>Notas</span>
              <textarea onChange={(event) => update("notes", event.target.value)} placeholder="Informações adicionais, ambiente ou instruções..." rows={3} value={draft.notes} />
            </label>
          </div>

          <label className="favorite-check">
            <input checked={draft.favorite} onChange={(event) => update("favorite", event.target.checked)} type="checkbox" />
            <span>Marcar como favorito</span>
          </label>

          {error ? <p className="form-error" role="alert">{error}</p> : null}

          <footer className="modal-actions">
            <button className="secondary-button" onClick={onClose} type="button">Cancelar</button>
            <button className="primary-button compact" disabled={saving} type="submit">{saving ? "Criptografando..." : "Salvar credencial"}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
