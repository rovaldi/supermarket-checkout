import { useId, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import Icon from "@/components/Icon";
import { QUANTITY_STEPPER_COPY } from "./constants";
import type { QuantityStepperProps } from "./types";
import styles from "./QuantityStepper.module.scss";

const QuantityStepper = ({ value, label, onHold, onRelease, onCommit }: QuantityStepperProps) => {
  const [draft, setDraft] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const canceling = useRef(false);
  const errorId = useId();
  const text = draft ?? String(value);
  const shown = /^\d+$/.test(text) ? Number(text) : value;
  const announced = /^\d+$/.test(text) && Number(text) >= 1 ? Number(text) : undefined;
  const atMin = shown <= 1;

  const commit = (nextText: string) => {
    if (!/^\d+$/.test(nextText)) {
      setDraft(null);
      setInvalid(true);
      return;
    }

    const parsed = Number(nextText);

    if (!Number.isSafeInteger(parsed) || parsed < 1) {
      setDraft(null);
      setInvalid(true);
      return;
    }

    setInvalid(false);

    if (parsed !== value) {
      onCommit(parsed);
    }
  };

  const step = (delta: number) => {
    const base = /^\d+$/.test(text) && Number(text) >= 1 ? Number(text) : value;
    const next = base + delta;

    if (next < 1) {
      return;
    }

    if (draft !== null) {
      setDraft(String(next));
    }

    setInvalid(false);
    onCommit(next);
  };

  const onFocus = (event: FocusEvent<HTMLInputElement>) => {
    setDraft(String(value));
    onHold();
    event.currentTarget.select();
  };

  const onBlur = () => {
    if (canceling.current) {
      canceling.current = false;
      setDraft(null);
      setInvalid(false);
      onRelease();
      return;
    }

    commit(text);
    setDraft(null);
    onRelease();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      step(1);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      step(-1);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      commit(text);
      setDraft(null);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      canceling.current = true;
      setDraft(null);
      setInvalid(false);
      event.currentTarget.blur();
    }
  };

  return (
    <div className={styles.stepper}>
      <button
        className={styles.stepper__button}
        type="button"
        aria-label={QUANTITY_STEPPER_COPY.DECREASE(label)}
        disabled={atMin}
        onClick={() => step(-1)}
      >
        <Icon name="minus" width={20} height={20} />
      </button>
      <input
        ref={inputRef}
        className={styles.stepper__value}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        role="spinbutton"
        aria-label={label}
        aria-valuemin={1}
        aria-valuenow={announced}
        aria-invalid={invalid}
        aria-describedby={invalid ? errorId : undefined}
        value={text}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(event) => {
          setDraft(event.target.value.replace(/\D/g, ""));
          setInvalid(false);
        }}
        onKeyDown={onKeyDown}
      />
      <button
        className={styles.stepper__button}
        type="button"
        aria-label={QUANTITY_STEPPER_COPY.INCREASE(label)}
        onClick={() => step(1)}
      >
        <Icon name="plus" width={20} height={20} />
      </button>
      <p className="visually-hidden" id={errorId} aria-live="polite">
        {invalid ? QUANTITY_STEPPER_COPY.INVALID : ""}
      </p>
    </div>
  );
};

export default QuantityStepper;
