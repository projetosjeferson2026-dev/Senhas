"use client";

import { useState } from "react";
import { ArrowUpRight, Check, KeyRound, Plus } from "lucide-react";
import { aiProviders, PROVIDERS_CHECKED_AT, providerDraft, providerEntries } from "@/lib/ai-providers";
import type { VaultEntry, VaultEntryDraft } from "@/lib/vault";

type Props = {
  entries: VaultEntry[];
  query: string;
  favoritesOnly: boolean;
  onAdd: (draft: VaultEntryDraft) => void;
  onEdit: (entry: VaultEntry) => void;
};

export function ApiProviderCatalog({ entries, query, favoritesOnly, onAdd, onEdit }: Props) {
  const [selectedId, setSelectedId] = useState("");
  const normalized = query.trim().toLocaleLowerCase("pt-BR");
  const providers = aiProviders.map((provider) => ({ provider, saved: providerEntries(provider, entries) }))
    .filter(({ provider, saved }) => {
      if (favoritesOnly && !saved.some((entry) => entry.favorite)) return false;
      return !normalized || [provider.name, provider.keyName, provider.description, provider.access,
        ...saved.flatMap((entry) => [entry.title, entry.username, entry.url, entry.notes])]
        .join(" ").toLocaleLowerCase("pt-BR").includes(normalized);
    });

  return (
    <section className="api-catalog" aria-labelledby="api-catalog-title">
      <header className="api-catalog-header">
        <div><h2 id="api-catalog-title">Provedores de IA</h2></div>
        <span className="catalog-total">{providers.length} provedores</span>
      </header>
      <label className="provider-selector">
        <span>Provedor de IA</span>
        <select value={providers.some(({ provider }) => provider.id === selectedId) ? selectedId : ""} onChange={(event) => setSelectedId(event.target.value)} disabled={!providers.length}>
          <option value="">Selecione um provedor para adicionar ou editar a chave</option>
          {providers.map(({ provider, saved }) => <option key={provider.id} value={provider.id}>{provider.name}{saved.length ? " · Chave salva" : ""}</option>)}
        </select>
      </label>
      <div className="provider-selection">
        {providers.filter(({ provider }) => provider.id === selectedId).map(({ provider, saved }) => {
          const hasKey = saved.length > 0;
          const editable = (favoritesOnly ? saved.find((entry) => entry.favorite) : saved[0]) ?? saved[0];
          return (
            <article key={provider.id} aria-label={provider.name} className={`provider-card${hasKey ? " has-key" : ""}`}>
              <div className="provider-heading"><div><h3>{provider.name}</h3><span className={`provider-status${hasKey ? " saved" : ""}`}>{hasKey ? <Check size={12} aria-hidden="true" /> : <KeyRound size={12} aria-hidden="true" />}{hasKey ? "Chave salva" : "Sem chave"}</span></div></div>
              <span className={`provider-access${provider.access === "Conferir condições" ? " conditional" : ""}`}>{provider.access}</span>
              <div className="provider-key"><span>Nome sugerido da variável</span><code>{provider.keyName}</code></div>
              <div className="provider-links"><a href={provider.keyUrl} target="_blank" rel="noopener noreferrer">Obter chave <ArrowUpRight size={14} aria-hidden="true" /></a><a href={provider.sourceUrl} target="_blank" rel="noopener noreferrer">Condições <ArrowUpRight size={14} aria-hidden="true" /></a></div>
              <button type="button" className={hasKey ? "secondary-button" : "primary-button compact"} aria-label={`${hasKey ? "Editar" : "Adicionar"} chave de ${provider.name}`} onClick={() => hasKey ? onEdit(editable) : onAdd(providerDraft(provider))}><KeyRound size={15} aria-hidden="true" />{hasKey ? "Gerenciar chave" : "Adicionar chave"}{!hasKey ? <Plus size={14} aria-hidden="true" /> : null}</button>
              <details className="provider-conditions"><summary>Sobre o acesso gratuito</summary><p>{provider.description}</p><small>Condições revisadas em {PROVIDERS_CHECKED_AT}. O destaque indica armazenamento, sem testar a chave.</small></details>
            </article>
          );
        })}
      </div>
      {!providers.length ? <p className="catalog-empty" role="status">Nenhum provedor corresponde aos filtros. Limpe a busca ou desative Favoritos.</p> : null}
    </section>
  );
}
