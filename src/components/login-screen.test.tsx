import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LoginScreen } from "@/components/login-screen";

describe("LoginScreen", () => {
  it("submits the existing account credentials without offering registration", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<LoginScreen onSubmit={onSubmit} />);

    expect(
      screen.getByRole("heading", { name: "Entrar no Nexus Vault" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/criar conta/i)).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("E-mail"), "eu@exemplo.com");
    await user.type(screen.getByLabelText("Senha"), "minha-senha");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(onSubmit).toHaveBeenCalledWith("eu@exemplo.com", "minha-senha");
  });

  it("shows an authentication error", () => {
    render(
      <LoginScreen
        onSubmit={vi.fn()}
        error="E-mail ou senha inválidos."
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "E-mail ou senha inválidos.",
    );
  });
});
