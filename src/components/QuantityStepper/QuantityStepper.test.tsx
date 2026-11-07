import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QUANTITY_STEPPER_COPY } from "./constants";
import QuantityStepper from "./QuantityStepper";

const label = "Cantidad de Leche";

const renderStepper = (value = 1) => {
  const onCommit = vi.fn();
  const onHold = vi.fn();
  const onRelease = vi.fn();

  render(
    <QuantityStepper
      value={value}
      label={label}
      onHold={onHold}
      onRelease={onRelease}
      onCommit={onCommit}
    />,
  );

  return {
    onCommit,
    input: screen.getByRole("spinbutton", { name: label }),
    user: userEvent.setup(),
  };
};

const ControlledStepper = () => {
  const [value, setValue] = useState(1);

  return (
    <QuantityStepper
      value={value}
      label={label}
      onHold={() => undefined}
      onRelease={() => undefined}
      onCommit={setValue}
    />
  );
};

describe("QuantityStepper", () => {
  it("increases the quantity", async () => {
    const { user, onCommit } = renderStepper();

    await user.click(screen.getByRole("button", { name: QUANTITY_STEPPER_COPY.INCREASE(label) }));

    expect(onCommit).toHaveBeenCalledWith(2);
  });

  it("does not go below 1", async () => {
    const { user, onCommit } = renderStepper();
    const minus = screen.getByRole("button", { name: QUANTITY_STEPPER_COPY.DECREASE(label) });

    expect(minus).toBeDisabled();
    await user.click(minus);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("rejects an empty quantity", async () => {
    const { user, input, onCommit } = renderStepper();

    await user.clear(input);
    expect(input).not.toHaveAttribute("aria-valuenow");
    await user.tab();

    expect(onCommit).not.toHaveBeenCalled();
    expect(input).toHaveValue("1");
    expect(input).toHaveAttribute("aria-valuenow", "1");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText(QUANTITY_STEPPER_COPY.INVALID)).toBeInTheDocument();
  });

  it("rejects zero", async () => {
    const { user, input, onCommit } = renderStepper();

    await user.clear(input);
    await user.type(input, "0");
    await user.tab();

    expect(onCommit).not.toHaveBeenCalled();
    expect(input).toHaveValue("1");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("does not keep a decimal quantity", async () => {
    const { user, input, onCommit } = renderStepper();

    await user.clear(input);
    await user.type(input, "1.5");

    expect(input).toHaveValue("15");
    await user.tab();
    expect(onCommit).toHaveBeenCalledWith(15);
    expect(onCommit).not.toHaveBeenCalledWith(1.5);
  });

  it("does not keep a negative quantity", async () => {
    const { user, input, onCommit } = renderStepper();

    await user.clear(input);
    await user.type(input, "-2");

    expect(input).toHaveValue("2");
    await user.tab();
    expect(onCommit).toHaveBeenCalledWith(2);
  });

  it("restores the quantity on Escape", async () => {
    const user = userEvent.setup();

    render(<ControlledStepper />);
    const input = screen.getByRole("spinbutton", { name: label });

    await user.click(screen.getByRole("button", { name: QUANTITY_STEPPER_COPY.INCREASE(label) }));
    expect(input).toHaveValue("2");

    await user.click(input);
    await user.clear(input);
    await user.type(input, "9");
    await user.keyboard("{Escape}");

    expect(input).not.toHaveFocus();
    expect(input).toHaveValue("2");
    expect(input).toHaveAttribute("aria-invalid", "false");
  });
});
