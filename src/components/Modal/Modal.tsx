import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import Button from "@/components/Button";
import Icon from "@/components/Icon";
import { MODAL_COPY } from "./constants";
import type { ModalProps } from "./types";
import styles from "./Modal.module.scss";

const EXIT_MS = 180;

let openModals = 0;

const Modal = ({
  open,
  title,
  align = "left",
  children,
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  secondaryLabel,
  onSecondary,
  onClose,
  onExited,
}: ModalProps) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const onExitedRef = useRef(onExited);
  const openRef = useRef(open);
  const shownRef = useRef(false);
  const leaveTimer = useRef(0);
  const [shown, setShown] = useState(false);
  const [phase, setPhase] = useState<"in" | "out">("in");

  const hide = useCallback(() => {
    window.clearTimeout(leaveTimer.current);

    if (openRef.current || !shownRef.current) {
      return;
    }

    shownRef.current = false;
    setShown(false);
    onExitedRef.current?.();
  }, []);

  useEffect(() => {
    onCloseRef.current = onClose;
    onExitedRef.current = onExited;
  }, [onClose, onExited]);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) {
        return;
      }

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (open) {
        window.clearTimeout(leaveTimer.current);
        shownRef.current = true;
        setPhase("in");
        setShown(true);
        return;
      }

      if (!shownRef.current) {
        return;
      }

      if (reduce) {
        hide();
        return;
      }

      setPhase("out");
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = window.setTimeout(hide, EXIT_MS);
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, hide]);

  useEffect(() => {
    return () => {
      window.clearTimeout(leaveTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!shown || phase === "out") {
      return undefined;
    }

    const dialog = dialogRef.current;
    const previous = document.activeElement;

    dialog?.focus();
    openModals += 1;
    document.body.classList.add("checkout-modal");

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onCloseRef.current) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !dialog) {
        return;
      }

      const items = Array.from(
        dialog.querySelectorAll<HTMLElement>("button:not(:disabled), [href], input"),
      );
      const first = items[0];
      const last = items[items.length - 1];

      if (!first || !last) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      openModals -= 1;

      if (openModals === 0) {
        document.body.classList.remove("checkout-modal");
      }

      if (previous instanceof HTMLElement && previous.isConnected) {
        previous.focus();
      }
    };
  }, [shown, phase]);

  if (!shown) {
    return null;
  }

  const leaving = phase === "out";

  return createPortal(
    <div className={clsx(styles.scrim, leaving && styles["scrim--out"])}>
      <div className={styles.scrim__shade} />
      <div
        className={clsx(styles.modal, leaving && styles["modal--out"])}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
        tabIndex={-1}
      >
        <div className={styles.modal__header}>
          <h2
            className={align === "center" ? styles["modal__title--center"] : styles.modal__title}
            id={titleId}
          >
            {title}
          </h2>
          {onClose ? (
            <button
              className={styles.modal__close}
              type="button"
              aria-label={MODAL_COPY.CLOSE}
              onClick={onClose}
            >
              <Icon name="close" width={20} height={20} />
            </button>
          ) : null}
        </div>
        {children}
        <div className={secondaryLabel ? styles.modal__actions : styles.modal__actionsSingle}>
          {secondaryLabel && onSecondary ? (
            <Button kind="secondary" fullWidth onClick={onSecondary}>
              {secondaryLabel}
            </Button>
          ) : null}
          <Button fullWidth disabled={primaryDisabled} onClick={onPrimary}>
            {primaryLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
