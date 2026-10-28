import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CredentialModal } from "@/components/credential-modal";

describe("CredentialModal", () => {
  it("saves a provider token with its encrypted-payload identifier", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<CredentialModal entry={null} initialDraft={{
      title: "Cohere", category: "api", username: "COHERE_API_KEY", secret: "",
      url: "https://dashboard.cohere.com/api-keys", notes: "", favorite: false, providerId: "cohere",
    }} onClose={vi.fn()} onSave={onSave} />);
    expect(screen.getByLabelText("Nome")).toHaveValue("Cohere");
    await user.type(screen.getByLabelText("Senha, token ou chave"), "test-token");
    await user.click(screen.getByRole("button", { name: "Salvar credencial" }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ providerId: "cohere", category: "api", secret: "test-token" }));
  });

  it("validates required fields before saving", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<CredentialModal entry={null} onClose={vi.fn()} onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "Salvar credencial" }));

    expect(screen.getAllByRole("alert")).toHaveLength(2);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("submits a complete credential", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<CredentialModal entry={null} onClose={vi.fn()} onSave={onSave} />);

    await user.type(screen.getByLabelText("Nome"), "Vercel principal");
    await user.selectOptions(screen.getByLabelText("Categoria"), "vercel");
    await user.type(screen.getByLabelText("Senha, token ou chave"), "token-vercel");
    await user.click(screen.getByRole("button", { name: "Salvar credencial" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Vercel principal",
        category: "vercel",
        secret: "token-vercel",
      }),
    );
  });
});
