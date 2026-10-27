import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CredentialModal } from "@/components/credential-modal";

describe("CredentialModal", () => {
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
