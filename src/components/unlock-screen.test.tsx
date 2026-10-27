import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { UnlockScreen } from "@/components/unlock-screen";

describe("UnlockScreen", () => {
  it("requires a strong master password on first setup", async () => {
    const user = userEvent.setup();
    const onUnlock = vi.fn();
    render(<UnlockScreen firstUse onUnlock={onUnlock} onSignOut={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: "Criar senha-mestra" }),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText("Senha-mestra"), "curta");
    await user.click(screen.getByRole("button", { name: "Criar e desbloquear" }));

    expect(screen.getByRole("alert")).toHaveTextContent("pelo menos 12 caracteres");
    expect(onUnlock).not.toHaveBeenCalled();
  });

  it("submits a valid master password for an existing vault", async () => {
    const user = userEvent.setup();
    const onUnlock = vi.fn().mockResolvedValue(undefined);
    render(<UnlockScreen firstUse={false} onUnlock={onUnlock} onSignOut={vi.fn()} />);

    await user.type(
      screen.getByLabelText("Senha-mestra"),
      "senha-mestra-valida",
    );
    await user.click(screen.getByRole("button", { name: "Desbloquear" }));

    expect(onUnlock).toHaveBeenCalledWith("senha-mestra-valida");
  });
});
