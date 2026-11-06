import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { isDigitString } from "../../../lib/ean.ts";
import { formatCents } from "../../../lib/money.ts";
import type { ProductSummary } from "../../../lib/types.ts";
import { searchProducts } from "@/api/client";
import Button from "@/components/Button";
import Icon from "@/components/Icon";
import clsx from "clsx";
import { CODE_ENTRY_COPY } from "./constants";
import type { CodeEntryProps } from "./types";
import styles from "./CodeEntry.module.scss";

const CodeEntry = ({ autoFocus, invalid, onValueChange, onLookup }: CodeEntryProps) => {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSummary[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const suppressed = useRef<string | null>(null);
  const busy = useRef(false);
  const listId = useId();
  const inputId = useId();
  const hintId = useId();
  const canAdd = value.length === 13 && isDigitString(value) && !pending;
  const listOpen = open && suggestions.length > 0;

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (suppressed.current === value || value.length < 3 || !isDigitString(value)) {
      setSuggestions([]);
      setOpen(false);
      setActiveIndex(null);
      return undefined;
    }

    const controller = new AbortController();
    const query = value;

    searchProducts(query, controller.signal)
      .then((products) => {
        if (suppressed.current === query) {
          return;
        }

        setSuggestions(products);
        setOpen(products.length > 0);
        setActiveIndex(null);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setSuggestions([]);
        setOpen(false);
      });

    return () => {
      controller.abort();
    };
  }, [value]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(null);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  useEffect(() => {
    const list = listRef.current;

    if (!list || activeIndex === null) {
      return;
    }

    const option = document.getElementById(`${listId}-${activeIndex}`);

    if (!option) {
      return;
    }

    const top = option.offsetTop;
    const bottom = top + option.offsetHeight;

    if (top < list.scrollTop) {
      list.scrollTop = top;
    } else if (bottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = bottom - list.clientHeight;
    }
  }, [activeIndex, listId]);

  const accept = (index: number) => {
    const product = suggestions[index];

    if (!product) {
      return;
    }

    suppressed.current = product.code;
    setValue(product.code);
    setSuggestions([]);
    setOpen(false);
    setActiveIndex(null);
    onValueChange();
    inputRef.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && suggestions.length > 0) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) =>
        current === null ? 0 : Math.min(current + 1, suggestions.length - 1),
      );
      return;
    }

    if (event.key === "ArrowUp" && listOpen) {
      event.preventDefault();
      setActiveIndex((current) => (current === null || current <= 0 ? null : current - 1));
      return;
    }

    if (event.key === "Escape" && listOpen) {
      event.preventDefault();
      suppressed.current = value;
      setOpen(false);
      setActiveIndex(null);
      return;
    }

    if (event.key === "Enter" && listOpen && activeIndex !== null) {
      event.preventDefault();
      accept(activeIndex);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (listOpen && activeIndex !== null) {
      accept(activeIndex);
      return;
    }

    if (busy.current || !canAdd) {
      return;
    }

    const code = value;
    const active = document.activeElement;
    busy.current = true;
    setPending(true);

    try {
      const result = await onLookup(code);

      if (result !== "added") {
        return;
      }

      suppressed.current = null;
      setValue("");
      setSuggestions([]);
      setOpen(false);
      setActiveIndex(null);

      if (active === inputRef.current || active === buttonRef.current) {
        inputRef.current?.focus();
      }
    } finally {
      busy.current = false;
      setPending(false);
    }
  };

  return (
    <div ref={rootRef}>
      <form className={styles.entry} onSubmit={onSubmit}>
        <label className={styles.entry__label} htmlFor={inputId}>
          {CODE_ENTRY_COPY.LABEL}
        </label>
        <div className={styles.entry__row}>
          <div className={styles.entry__control}>
            <div className={clsx(styles.entry__field, invalid && styles["entry__field--invalid"])}>
              <Icon className={styles.entry__barcode} name="barcode" width={18} height={16} />
              <input
                ref={inputRef}
                id={inputId}
                className={styles.entry__input}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                aria-autocomplete="list"
                aria-controls={listId}
                aria-expanded={listOpen}
                aria-activedescendant={
                  activeIndex !== null ? `${listId}-${activeIndex}` : undefined
                }
                aria-invalid={invalid}
                aria-describedby={hintId}
                role="combobox"
                maxLength={13}
                value={value}
                onChange={(event) => {
                  const next = event.target.value.replace(/\D/g, "").slice(0, 13);
                  if (suppressed.current !== next) {
                    suppressed.current = null;
                  }
                  setValue(next);
                  onValueChange();
                }}
                onKeyDown={onKeyDown}
              />
            </div>
            {listOpen ? (
              <ul ref={listRef} className={styles.entry__list} id={listId} role="listbox">
                {suggestions.map((product, index) => (
                  <li
                    key={product.code}
                    id={`${listId}-${index}`}
                    className={clsx(
                      styles.entry__option,
                      index === activeIndex && styles["entry__option--active"],
                    )}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseDown={(event) => {
                      event.preventDefault();
                    }}
                    onClick={() => accept(index)}
                  >
                    <span className={styles.entry__optionText}>
                      <span className={styles.entry__optionName}>{product.name}</span>
                      <span className={styles.entry__optionCode}>{product.code}</span>
                    </span>
                    <span className={styles.entry__optionPrice}>
                      {formatCents(product.priceCents)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <Button ref={buttonRef} type="submit" kind="secondary" disabled={!canAdd}>
            {CODE_ENTRY_COPY.ADD}
          </Button>
        </div>
        <p className={styles.entry__hint} id={hintId}>
          {CODE_ENTRY_COPY.HINT}
        </p>
      </form>
    </div>
  );
};

export default CodeEntry;
