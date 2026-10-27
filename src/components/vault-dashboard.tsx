"use client";

import { useMemo, useState } from "react";
import { Copy, Edit3, Eye, EyeOff, LockKeyhole, LogOut, Plus, Search, ShieldCheck, Star, Trash2 } from "lucide-react";
import { categoryFilters, getCategory } from "@/lib/vault-categories";

import {
  filterEntries,
  type VaultCategoryFilter,
  type VaultEntry,
} from "@/lib/vault";

type VaultDashboardProps = {
  email: string;
  entries: VaultEntry[];
  onCreate: () => void;
  onDelete: (entry: VaultEntry) => void;
  onEdit: (entry: VaultEntry) => void;
  onLock: () => void;
  onSignOut: () => void;
};

export function VaultDashboard({
  email,
  entries,
  onCreate,
  onDelete,
  onEdit,
  onLock,
  onSignOut,
}: VaultDashboardProps) {
  const [category, setCategory] = useState<VaultCategoryFilter>("all");
  const [query, setQuery] = useState("");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [copyError, setCopyError] = useState("");

  const visibleEntries = useMemo(
    () => filterEntries(entries, query, category).filter((entry) => !favoritesOnly || entry.favorite),
    [entries, query, category, favoritesOnly],
  );

  const hasFilters = Boolean(query || category !== "all" || favoritesOnly);

  function resetFilters() {
    setQuery("");
    setCategory("all");
    setFavoritesOnly(false);
  }

  function countFor(filter: VaultCategoryFilter) {
    return filter === "all"
      ? entries.length
      : entries.filter((entry) => entry.category === filter).length;
  }

  function toggleReveal(id: string) {
    setRevealed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function copySecret(entry: VaultEntry) {
    setCopyError("");
    try {
      await navigator.clipboard.writeText(entry.secret);
    } catch {
      setCopyError("Não foi possível copiar. Permita o acesso à área de transferência no navegador.");
      return;
    }
    setCopiedId(entry.id);
    window.setTimeout(() => setCopiedId(null), 1800);
    window.setTimeout(async () => {
      try {
        if ((await navigator.clipboard.readText()) === entry.secret) {
          await navigator.clipboard.writeText("");
        }
      } catch {
        // Some browsers do not allow clipboard reads; never overwrite blindly.
      }
    }, 30_000);
  }

  const selectedLabel =
    categoryFilters.find((item) => item.id === category)?.label ?? "Todos";

  return (
    <div className="vault-shell">
      <aside className="vault-sidebar">
        <div className="brand-lockup sidebar-brand">
          <span className="brand-mark" aria-hidden="true"><ShieldCheck size={24} /></span>
          <span>NEXUS VAULT</span>
        </div>

        <nav aria-label="Categorias do cofre" className="category-nav">
          <p className="nav-label">Coleções</p>
          {categoryFilters.map(({ id, label, icon: Icon }) => (
            <button
              aria-pressed={category === id}
              className={category === id ? "category-item active" : "category-item"}
              key={id}
              onClick={() => setCategory(id)}
              type="button"
            >
              <Icon size={17} aria-hidden="true" />
              <span>{label}</span>
              <strong>{countFor(id)}</strong>
            </button>
          ))}
        </nav>

        <div className="sidebar-security">
          <ShieldCheck size={18} aria-hidden="true" />
          <div><b>Cofre protegido</b><span>Bloqueio após 5 min sem uso</span></div>
        </div>

        <div className="sidebar-account">
          <span className="avatar">{email.slice(0, 1).toUpperCase()}</span>
          <div><b>{email.split("@")[0]}</b><span>{email}</span></div>
          <button aria-label="Sair da conta" onClick={onSignOut} type="button">
            <LogOut size={16} aria-hidden="true" />
          </button>
        </div>
      </aside>

      <main className="vault-main">
        <header className="vault-topbar">
          <div><p className="eyebrow">Seu espaço seguro</p><h1>Minhas credenciais</h1><p className="page-description">Suas senhas, tokens e chaves em um só lugar.</p></div>
          <div className="topbar-actions">
            <button aria-label="Bloquear cofre" className="secondary-button" onClick={onLock} type="button">
              <LockKeyhole size={16} aria-hidden="true" /> Bloquear
            </button>
            <button className="primary-button compact" onClick={onCreate} type="button">
              <Plus size={17} aria-hidden="true" /> Novo item
            </button>
          </div>
        </header>

        <section className="vault-overview" aria-label="Resumo do cofre">
          <div><span className="overview-icon"><ShieldCheck size={21} aria-hidden="true" /></span><div><b>{entries.length}</b><span>Credenciais salvas</span></div></div>
          <div><span className="overview-icon warm"><Star size={21} aria-hidden="true" /></span><div><b>{entries.filter((entry) => entry.favorite).length}</b><span>Favoritos</span></div></div>
          <div className="overview-note"><LockKeyhole size={18} aria-hidden="true" /><p>Proteção no seu dispositivo<span>Só você tem a senha-mestra.</span></p></div>
        </section>

        <section className="vault-toolbar" aria-label="Pesquisar credenciais">
          <label className="search-box">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Pesquisar no cofre</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Pesquisar nome, usuário, site ou nota..."
              type="search"
              value={query}
            />
          </label>
          <button aria-label="Mostrar favoritos" aria-pressed={favoritesOnly} className="secondary-button favorite-filter" onClick={() => setFavoritesOnly((value) => !value)} type="button"><Star size={16} aria-hidden="true" /> Favoritos</button>
        </section>

        <div className="mobile-categories" aria-label="Filtro de categoria">
          {categoryFilters.map(({ id, label }) => (
            <button aria-pressed={category === id} key={id} onClick={() => setCategory(id)} type="button">
              {label} <span>{countFor(id)}</span>
            </button>
          ))}
        </div>

        <section className="entries-section">
          <div className="section-heading">
            <div><h2>{favoritesOnly ? `Favoritos · ${selectedLabel}` : selectedLabel} <span className="section-count">{visibleEntries.length}</span></h2><p>Use Copiar para a senha ou Editar para alterar o item.</p></div>
            {hasFilters ? <button className="text-button" onClick={resetFilters} type="button">Limpar filtros</button> : null}
          </div>

          {copyError ? <p className="form-error" role="alert">{copyError}</p> : null}
          <span className="sr-only" role="status">{copiedId ? "Senha copiada para a área de transferência." : ""}</span>

          {visibleEntries.length ? (
            <div className="credential-grid">
              {visibleEntries.map((entry) => {
                const { icon: Icon, singular: categoryLabel } = getCategory(entry.category);
                const isRevealed = revealed.has(entry.id);
                return (
                  <article className="credential-card" key={entry.id}>
                    <div className="credential-head">
                      <span className={`credential-icon category-${entry.category}`} aria-hidden="true"><Icon size={19} /></span>
                      <div className="credential-title">
                        <div><h3>{entry.title}</h3>{entry.favorite ? <Star size={14} fill="currentColor" aria-label="Favorito" /> : null}</div>
                        <span>{categoryLabel}</span>
                      </div>
                    </div>

                    <div className="credential-detail"><span>Usuário</span><b>{entry.username || "Não informado"}</b></div>
                    <div className="credential-detail secret-detail">
                      <span>Senha ou chave</span>
                      <div>
                        <code>{isRevealed ? entry.secret : "••••••••••••"}</code>
                        <button
                          aria-label={`${isRevealed ? "Ocultar" : "Revelar"} segredo de ${entry.title}`}
                          onClick={() => toggleReveal(entry.id)}
                          type="button"
                        >
                          {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="credential-actions">
                      <button onClick={() => copySecret(entry)} type="button"><Copy size={15} aria-hidden="true" />{copiedId === entry.id ? "Copiado" : "Copiar"}</button>
                      <button onClick={() => onEdit(entry)} type="button"><Edit3 size={15} aria-hidden="true" /> Editar</button>
                      <button aria-label={`Excluir ${entry.title}`} className="danger-icon" onClick={() => onDelete(entry)} type="button"><Trash2 size={15} aria-hidden="true" /></button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <ShieldCheck size={34} aria-hidden="true" />
              <h3>{entries.length ? "Nenhuma credencial encontrada" : "Seu cofre está pronto"}</h3>
              <p>{entries.length ? "Tente outro termo ou limpe os filtros para ver seus itens." : "Adicione sua primeira senha, token ou chave para começar."}</p>
              <button className="primary-button compact" onClick={onCreate} type="button"><Plus size={17} aria-hidden="true" /> Adicionar credencial</button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
