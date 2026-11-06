import { forwardRef, type MouseEvent } from "react";
import clsx from "clsx";
import type { ButtonProps } from "./types";
import styles from "./Button.module.scss";

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      kind = "primary",
      fullWidth = false,
      type = "button",
      disabled = false,
      busy = false,
      onClick,
    },
    ref,
  ) => {
    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      if (busy) {
        return;
      }

      onClick?.(event);
    };

    return (
      <button
        ref={ref}
        className={clsx(
          styles.button,
          kind === "primary" ? styles["button--primary"] : styles["button--secondary"],
          fullWidth && styles["button--full"],
          busy && styles["button--busy"],
        )}
        type={type}
        disabled={disabled}
        aria-busy={busy || undefined}
        onClick={handleClick}
      >
        {children}
      </button>
    );
  },
);

export default Button;
