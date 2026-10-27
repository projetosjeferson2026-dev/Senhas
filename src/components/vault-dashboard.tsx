"use client";

import { useMemo, useState } from "react";
import {
  Copy, Database, Edit3, Eye, EyeOff, GitBranch, Globe2, KeyRound,
  LayoutGrid, LockKeyhole, LogOut, MoreHorizontal, Plus, Search,
  ShieldCheck, Star, Trash2, Zap,
} from "lucide-react";

import {
  filterEntries,
  type VaultCategory,
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

const categoryMeta: Array<{
  id: VaultCategoryFilter;
  label: string;
  icon: typeof LayoutGrid;
}> = [
  { id: "all", label: "Todos", icon: LayoutGrid },
  { id: "site", label: "Sites", icon: Globe2 },
  { id: "api", label: "APIs", icon: KeyRound },
  { id: "database", label: "Bancos", icon: Database },
  { id: "github", label: "GitHub", icon: GitBranch },
  { id: "vercel", label: "Vercel", icon: Zap },
  { id: "other", label: "Outros", icon: MoreHorizontal },
];

const entryIcons: Record<VaultCategory, typeof Globe2> = {
  site: Globe2,
  api: KeyRound,
  database: Database,
  github: GitBranch,
  vercel: Zap,
  other: MoreHorizontal,
};

const categoryLabels: Record<VaultCategory, string> = {
  site: "Site",
  api: "API / token",
  database: "Banco de dados",
  github: "GitHub",
  vercel: "Vercel",
  other: "Outro",
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

  const visibleEntries = useMemo(
    () => filterEntries(entries, query, category),
    [entries, query, category],
  );

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
    await navigator.clipboard.writeText(entry.secret);
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
    categoryMeta.find((item) => item.id === category)?.label ?? "Todos";

  return (
    <div className="vault-shell">
      <aside className="vault-sidebar">
        <div className="brand-lockup sidebar-brand">
          <span className="brand-mark" aria-hidden="true"><ShieldCheck size={24} /></span>
          <span>NEXUS VAULT</span>
        </div>

        <nav aria-label="Categorias do cofre" className="category-nav">
          <p className="nav-label">Coleções</p>
          {categoryMeta.map(({ id, label, icon: Icon }) => (
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
          <div><b>Cofre protegido</b><span>AES-256-GCM</span></div>
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
          <div><p className="eyebrow">Cofre pessoal</p><h1>Minhas credenciais</h1></div>
          <div className="topbar-actions">
            <button className="secondary-button" onClick={onLock} type="button">
              <LockKeyhole size={16} aria-hidden="true" /> Bloquear
            </button>
            <button className="primary-button compact" onClick={onCreate} type="button">
              <Plus size={17} aria-hidden="true" /> Novo item
            </button>
          </div>
        </header>

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
          <div className="results-count"><b>{visibleEntries.length}</b><span>{visibleEntries.length === 1 ? "item" : "itens"}</span></div>
        </section>

        <div className="mobile-categories" aria-label="Filtro de categoria">
          {categoryMeta.map(({ id, label }) => (
            <button aria-pressed={category === id} key={id} onClick={() => setCategory(id)} type="button">
              {label} <span>{countFor(id)}</span>
            </button>
          ))}
        </div>

        <section className="entries-section">
          <div className="section-heading">
            <div><h2>{selectedLabel}</h2><p>Dados descriptografados apenas nesta sessão.</p></div>
          </div>

          {visibleEntries.length ? (
            <div className="credential-grid">
              {visibleEntries.map((entry) => {
                const Icon = entryIcons[entry.category];
                const isRevealed = revealed.has(entry.id);
                return (
                  <article className="credential-card" key={entry.id}>
                    <div className="credential-head">
                      <span className={`credential-icon category-${entry.category}`} aria-hidden="true"><Icon size={19} /></span>
                      <div className="credential-title">
                        <div><h3>{entry.title}</h3>{entry.favorite ? <Star size={14} fill="currentColor" aria-label="Favorito" /> : null}</div>
                        <span>{categoryLabels[entry.category]}</span>
                      </div>
                    </div>

                    <div className="credential-detail"><span>Usuário</span><b>{entry.username || "Não informado"}</b></div>
                    <div className="credential-detail secret-detail">
                      <span>Segredo</span>
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
              <h3>Nenhuma credencial encontrada</h3>
              <p>Ajuste a busca ou adicione o primeiro item desta categoria.</p>
              <button className="primary-button compact" onClick={onCreate} type="button"><Plus size={17} aria-hidden="true" /> Adicionar credencial</button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
