import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { VaultDashboard } from "@/components/vault-dashboard";
import type { VaultEntry } from "@/lib/vault";

const entries: VaultEntry[] = [
  {
    id: "1",
    title: "GitHub pessoal",
    category: "github",
    username: "jeferson",
    secret: "ghp-segredo",
    url: "https://github.com",
    notes: "Conta principal",
    favorite: true,
    createdAt: "2026-10-26T20:00:00.000Z",
    updatedAt: "2026-10-26T20:00:00.000Z",
  },
  {
    id: "2",
    title: "Supabase produção",
    category: "database",
    username: "postgres",
    secret: "postgres://segredo",
    url: "",
    notes: "Banco do Nexus",
    favorite: false,
    createdAt: "2026-10-26T20:00:00.000Z",
    updatedAt: "2026-10-26T20:00:00.000Z",
  },
];

const callbacks = {
  onCreate: vi.fn(),
  onDelete: vi.fn(),
  onEdit: vi.fn(),
  onLock: vi.fn(),
  onSignOut: vi.fn(),
};

describe("VaultDashboard", () => {
  it("filters decrypted entries by category", async () => {
    const user = userEvent.setup();
    render(
      <VaultDashboard email="eu@exemplo.com" entries={entries} {...callbacks} />,
    );

    expect(screen.getByText("GitHub pessoal")).toBeInTheDocument();
    expect(screen.getByText("Supabase produção")).toBeInTheDocument();

    await user.click(
      within(screen.getByRole("navigation", { name: "Categorias do cofre" }))
        .getByRole("button", { name: /GitHub.*1/ }),
    );

    expect(screen.getByText("GitHub pessoal")).toBeInTheDocument();
    expect(screen.queryByText("Supabase produção")).not.toBeInTheDocument();
  });

  it("reveals a secret only after an explicit action", async () => {
    const user = userEvent.setup();
    render(
      <VaultDashboard email="eu@exemplo.com" entries={entries} {...callbacks} />,
    );

    expect(screen.queryByText("ghp-segredo")).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Revelar segredo de GitHub pessoal" }),
    );
    expect(screen.getByText("ghp-segredo")).toBeInTheDocument();
  });
});
