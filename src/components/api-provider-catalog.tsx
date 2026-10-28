"use client";

import { ArrowUpRight, Check, KeyRound, Plus, Sparkles } from "lucide-react";
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
        <div><p className="eyebrow"><Sparkles size={14} aria-hidden="true" /> Conecte suas ferramentas</p><h2 id="api-catalog-title">APIs de inteligência artificial</h2><p>Escolha um provedor, obtenha sua chave e guarde-a no cofre.</p></div>
        <span className="catalog-total">{providers.length} provedores</span>
      </header>
      <p className="catalog-note">Cotas e avaliações gratuitas têm limites. Confira as condições antes de usar. Revisado em {PROVIDERS_CHECKED_AT}.</p>
      <div className="provider-grid">
        {providers.map(({ provider, saved }) => {
          const hasKey = saved.length > 0;
          const editable = (favoritesOnly ? saved.find((entry) => entry.favorite) : saved[0]) ?? saved[0];
          return (
            <article key={provider.id} aria-label={provider.name} className={`provider-card${hasKey ? " has-key" : ""}`}>
              <div className="provider-heading"><span className="provider-monogram" aria-hidden="true">{provider.name.slice(0, 2).toUpperCase()}</span><div><h3>{provider.name}</h3><span className={`provider-status${hasKey ? " saved" : ""}`}>{hasKey ? <Check size={12} aria-hidden="true" /> : <KeyRound size={12} aria-hidden="true" />}{hasKey ? "Chave salva" : "Sem chave"}</span></div></div>
              <span className={`provider-access${provider.access === "Conferir condições" ? " conditional" : ""}`}>{provider.access}</span>
              <p className="provider-description">{provider.description}</p>
              <div className="provider-key"><span>Nome sugerido da variável</span><code>{provider.keyName}</code></div>
              <div className="provider-links"><a href={provider.keyUrl} target="_blank" rel="noopener noreferrer">Obter chave <ArrowUpRight size={14} aria-hidden="true" /></a><a href={provider.sourceUrl} target="_blank" rel="noopener noreferrer">Condições <ArrowUpRight size={14} aria-hidden="true" /></a></div>
              <button type="button" className={hasKey ? "secondary-button" : "primary-button compact"} aria-label={`${hasKey ? "Editar" : "Adicionar"} chave de ${provider.name}`} onClick={() => hasKey ? onEdit(editable) : onAdd(providerDraft(provider))}><KeyRound size={15} aria-hidden="true" />{hasKey ? "Gerenciar chave" : "Adicionar chave"}{!hasKey ? <Plus size={14} aria-hidden="true" /> : null}</button>
            </article>
          );
        })}
      </div>
      {!providers.length ? <p className="catalog-empty" role="status">Nenhum provedor corresponde aos filtros. Limpe a busca ou desative Favoritos.</p> : null}
      <p className="catalog-footnote">O destaque indica uma chave guardada, sem testar sua validade ou consumir tokens.</p>
    </section>
  );
}
