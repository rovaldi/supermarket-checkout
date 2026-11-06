import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchProducts } from "@/api/client";
import type { ProductSummary } from "../../../lib/types.ts";
import CodeEntry from "./CodeEntry";
import { CODE_ENTRY_COPY } from "./constants";

vi.mock("@/api/client", () => ({
  searchProducts: vi.fn(),
}));

const leche: ProductSummary = {
  id: "leche",
  name: "Leche entera 1 L",
  code: "2000000750019",
  priceCents: 95,
  unit: "1 L",
};

const pan: ProductSummary = {
  id: "pan",
  name: "Pan de barra",
  code: "2000000750026",
  priceCents: 60,
  unit: "1 ud",
};

const renderEntry = () => {
  const onLookup = vi.fn();
  const onValueChange = vi.fn();

  render(
    <CodeEntry
      autoFocus={false}
      invalid={false}
      onLookup={onLookup}
      onValueChange={onValueChange}
    />,
  );

  return {
    onLookup,
    user: userEvent.setup(),
    input: screen.getByRole("combobox", { name: CODE_ENTRY_COPY.LABEL }),
    add: screen.getByRole("button", { name: CODE_ENTRY_COPY.ADD }),
  };
};

describe("CodeEntry", () => {
  beforeEach(() => {
    vi.mocked(searchProducts).mockReset();
    vi.mocked(searchProducts).mockResolvedValue([]);
  });

  it("keeps Añadir disabled with fewer than 13 digits", async () => {
    const { user, input, add } = renderEntry();

    await user.type(input, "200000075001");

    expect(add).toBeDisabled();
  });

  it("enables Añadir at 13 digits even when the check digit fails", async () => {
    const { user, input, add } = renderEntry();

    await user.type(input, "2000000750010");

    expect(add).toBeEnabled();
  });

  it("does not add when Enter confirms an active suggestion", async () => {
    vi.mocked(searchProducts).mockResolvedValue([leche, pan]);
    const { user, input, onLookup } = renderEntry();

    await user.type(input, "200");
    await screen.findByRole("listbox");
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onLookup).not.toHaveBeenCalled();
    expect(input).toHaveValue(leche.code);
  });

  it("closes the list with Escape", async () => {
    vi.mocked(searchProducts).mockResolvedValue([leche, pan]);
    const { user, input } = renderEntry();

    await user.type(input, "200");
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("moves the active suggestion with the arrows", async () => {
    vi.mocked(searchProducts).mockResolvedValue([leche, pan]);
    const { user, input } = renderEntry();

    await user.type(input, "200");
    await screen.findByRole("listbox");

    const milk = screen.getByRole("option", { name: /Leche entera 1 L/ });
    const bread = screen.getByRole("option", { name: /Pan de barra/ });

    expect(milk).toHaveAttribute("aria-selected", "false");
    await user.keyboard("{ArrowDown}");
    expect(milk).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowDown}");
    expect(bread).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowUp}");
    expect(milk).toHaveAttribute("aria-selected", "true");
  });
});
