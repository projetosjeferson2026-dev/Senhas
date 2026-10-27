import { Database, GitBranch, Globe2, KeyRound, LayoutGrid, MoreHorizontal, Zap } from "lucide-react";
import type { VaultCategory, VaultCategoryFilter } from "@/lib/vault";

// Shared by the navigation, credential cards and editor.
export const vaultCategories = [
  { id: "site", label: "Sites", singular: "Site", icon: Globe2 },
  { id: "api", label: "APIs", singular: "API / token", icon: KeyRound },
  { id: "database", label: "Bancos", singular: "Banco de dados", icon: Database },
  { id: "github", label: "GitHub", singular: "GitHub", icon: GitBranch },
  { id: "vercel", label: "Vercel", singular: "Vercel", icon: Zap },
  { id: "other", label: "Outros", singular: "Outro", icon: MoreHorizontal },
] satisfies Array<{ id: VaultCategory; label: string; singular: string; icon: typeof Globe2 }>;

export const categoryFilters: Array<{ id: VaultCategoryFilter; label: string; icon: typeof Globe2 }> = [
  { id: "all", label: "Todos", icon: LayoutGrid },
  ...vaultCategories,
];

export function getCategory(category: VaultCategory) {
  return vaultCategories.find((item) => item.id === category) ?? vaultCategories[5];
}
