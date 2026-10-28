import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { NexusVaultApp } from "@/components/nexus-vault-app";
import { decryptJson, encryptJson } from "@/lib/crypto";
import type { SupabaseConfiguration } from "@/lib/supabase";
import { createVaultProfile, type VaultEntryDraft } from "@/lib/vault";
import type { VaultBackendPort } from "@/lib/vault-backend";

function createBackend(overrides: Partial<VaultBackendPort> = {}): VaultBackendPort {
  return {
    createItem: vi.fn(),
    deleteItem: vi.fn(),
    getProfile: vi.fn().mockResolvedValue(null),
    getUser: vi.fn().mockResolvedValue(null),
    listItems: vi.fn().mockResolvedValue([]),
    onAuthChange: vi.fn().mockReturnValue(() => undefined),
    saveProfile: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    updateItem: vi.fn(),
    ...overrides,
  } as VaultBackendPort;
}

describe("NexusVaultApp", () => {
  it("saves a catalog key encrypted and updates its provider status", async () => {
    const user = userEvent.setup();
    const masterPassword = "senha-mestra-de-teste-segura";
    const { key, profile } = await createVaultProfile(masterPassword);
    const createItem = vi.fn().mockResolvedValue({ id: "cohere-1", createdAt: "2026-10-28", updatedAt: "2026-10-28" });
    const backend = createBackend({
      getUser: vi.fn().mockResolvedValue({ id: "1", email: "eu@exemplo.com" }),
      getProfile: vi.fn().mockResolvedValue(profile), createItem,
    });
    render(<NexusVaultApp configuration={{ allowedEmail: "eu@exemplo.com", backend }} />);
    await user.type(await screen.findByLabelText("Senha-mestra"), masterPassword);
    await user.click(screen.getByRole("button", { name: "Desbloquear" }));
    await user.click(await screen.findByRole("button", { name: "APIs0" }));
    await user.selectOptions(screen.getByLabelText("Provedor de IA"), "cohere");
    await user.click(screen.getByRole("button", { name: "Adicionar chave de Cohere" }));
    await user.type(screen.getByLabelText("Senha, token ou chave"), "cohere-test-secret");
    await user.click(screen.getByRole("button", { name: "Salvar credencial" }));
    expect(await screen.findByText("Chave salva")).toBeInTheDocument();
    expect(screen.queryByText("cohere-test-secret")).not.toBeInTheDocument();
    const payload = createItem.mock.calls[0][0];
    expect(JSON.stringify(payload)).not.toContain("cohere-test-secret");
    expect(await decryptJson(key, payload)).toEqual(expect.objectContaining({ providerId: "cohere", secret: "cohere-test-secret" }));
    await user.click(screen.getByRole("button", { name: "Editar chave de Cohere" }));
    expect(screen.getByLabelText("Senha, token ou chave")).toHaveValue("cohere-test-secret");
  });

  it("explains which Supabase variables are missing", () => {
    render(<NexusVaultApp configuration={null} />);
    expect(
      screen.getByRole("heading", { name: "Configure o Supabase" }),
    ).toBeInTheDocument();
  });

  it("rejects a signed-in account that is not the allowed email", async () => {
    const user = userEvent.setup();
    const backend = createBackend({
      signIn: vi.fn().mockResolvedValue({ id: "2", email: "outra@conta.com" }),
    });
    const configuration: SupabaseConfiguration = {
      allowedEmail: "eu@exemplo.com",
      backend,
    };
    render(<NexusVaultApp configuration={configuration} />);

    await screen.findByRole("heading", { name: "Entrar no Nexus Vault" });
    await user.type(screen.getByLabelText("E-mail"), "outra@conta.com");
    await user.type(screen.getByLabelText("Senha"), "senha-da-conta");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Esta conta não está autorizada.",
      );
    });
    expect(backend.signOut).toHaveBeenCalled();
  });

  it("opens with valid entries and reports a corrupted encrypted item", async () => {
    const user = userEvent.setup();
    const masterPassword = "uma-senha-mestra-bem-longa";
    const { key, profile } = await createVaultProfile(masterPassword);
    const draft: VaultEntryDraft = {
      title: "GitHub pessoal",
      category: "github",
      username: "jeferson",
      secret: "token-cifrado",
      url: "https://github.com",
      notes: "",
      favorite: true,
    };
    const validPayload = await encryptJson(key, draft);
    const backend = createBackend({
      getUser: vi.fn().mockResolvedValue({ id: "1", email: "eu@exemplo.com" }),
      getProfile: vi.fn().mockResolvedValue(profile),
      listItems: vi.fn().mockResolvedValue([
        {
          ...validPayload,
          id: "valid",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        {
          ciphertext: "dados-corrompidos",
          iv: validPayload.iv,
          version: 1,
          id: "corrupt",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ]),
    });

    render(
      <NexusVaultApp
        configuration={{ allowedEmail: "eu@exemplo.com", backend }}
      />,
    );

    await user.type(await screen.findByLabelText("Senha-mestra"), masterPassword);
    await user.click(screen.getByRole("button", { name: "Desbloquear" }));

    expect(await screen.findByText("GitHub pessoal")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "1 credencial não pôde ser descriptografada",
    );
  });
});
