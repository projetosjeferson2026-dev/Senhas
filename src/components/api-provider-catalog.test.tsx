import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ApiProviderCatalog } from "@/components/api-provider-catalog";
import type { VaultEntry } from "@/lib/vault";

const saved: VaultEntry = {
  id: "key-1", providerId: "openrouter", title: "Minha chave pessoal", category: "api",
  username: "", secret: "private-test-token", url: "", notes: "", favorite: true,
  createdAt: "2026-10-28T00:00:00Z", updatedAt: "2026-10-28T00:00:00Z",
};

describe("ApiProviderCatalog", () => {
  it("opens a provider draft without creating an empty vault entry", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<ApiProviderCatalog entries={[]} query="cohere" favoritesOnly={false} onAdd={onAdd} onEdit={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Adicionar chave de Cohere" }));
    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({
      providerId: "cohere", category: "api", username: "COHERE_API_KEY", secret: "",
    }));
  });

  it("indicates and edits an existing key without exposing the token", async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<ApiProviderCatalog entries={[saved]} query="" favoritesOnly onAdd={vi.fn()} onEdit={onEdit} />);
    const card = screen.getByRole("article", { name: "OpenRouter" });
    expect(within(card).getByText("Chave salva")).toBeInTheDocument();
    expect(screen.queryByText(saved.secret)).not.toBeInTheDocument();
    expect(screen.queryByRole("article", { name: "Cohere" })).not.toBeInTheDocument();
    await user.click(within(card).getByRole("button", { name: "Editar chave de OpenRouter" }));
    expect(onEdit).toHaveBeenCalledWith(saved);
  });

  it("matches legacy keys by exact provider title and removes saved status after deletion", () => {
    const legacy = { ...saved, providerId: undefined, title: "OpenRouter", favorite: false };
    const props = { query: "openrouter", favoritesOnly: false, onAdd: vi.fn(), onEdit: vi.fn() };
    const { rerender } = render(<ApiProviderCatalog {...props} entries={[legacy]} />);
    expect(screen.getByText("Chave salva")).toBeInTheDocument();
    rerender(<ApiProviderCatalog {...props} entries={[]} />);
    expect(screen.queryByText("Chave salva")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Adicionar chave de OpenRouter" })).toBeInTheDocument();
  });
});
