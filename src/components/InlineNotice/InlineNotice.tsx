import { useEffect, useRef, type FocusEvent } from "react";
import Icon from "@/components/Icon";
import styles from "./InlineNotice.module.scss";
import type { InlineNoticeProps } from "./types";

const DISMISS_MS = 6000;

type Hold = {
  pointer: boolean;
  focus: boolean;
  paused: boolean;
  remaining: number;
  started: number;
  timeout: number;
};

const InlineNotice = ({ id, variant, children, action, onExpire }: InlineNoticeProps) => {
  const onExpireRef = useRef(onExpire);
  const hold = useRef<Hold>({
    pointer: false,
    focus: false,
    paused: false,
    remaining: DISMISS_MS,
    started: 0,
    timeout: 0,
  });

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!onExpire) {
      return undefined;
    }

    const state = hold.current;
    state.pointer = false;
    state.focus = false;
    state.paused = false;
    state.remaining = DISMISS_MS;
    state.started = Date.now();
    state.timeout = window.setTimeout(() => {
      onExpireRef.current?.();
    }, DISMISS_MS);

    return () => {
      window.clearTimeout(state.timeout);
    };
  }, [onExpire]);

  const pause = () => {
    const state = hold.current;

    if (!onExpire || state.paused) {
      return;
    }

    state.paused = true;
    state.remaining -= Date.now() - state.started;
    window.clearTimeout(state.timeout);
  };

  const resume = () => {
    const state = hold.current;

    if (!onExpire || state.pointer || state.focus || !state.paused) {
      return;
    }

    state.paused = false;
    state.started = Date.now();
    state.timeout = window.setTimeout(
      () => {
        onExpireRef.current?.();
      },
      Math.max(state.remaining, 0),
    );
  };

  const onPointerEnter = () => {
    hold.current.pointer = true;
    pause();
  };

  const onPointerLeave = () => {
    hold.current.pointer = false;
    resume();
  };

  const onFocus = () => {
    hold.current.focus = true;
    pause();
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;

    if (next instanceof Node && event.currentTarget.contains(next)) {
      return;
    }

    hold.current.focus = false;
    resume();
  };

  return (
    <div
      id={id}
      className={variant === "error" ? styles.notice__error : styles.notice__removed}
      role={variant === "error" ? "alert" : "status"}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <span className={variant === "error" ? styles.notice__markError : styles.notice__markRemoved}>
        <Icon
          className={styles.notice__icon}
          name={variant === "error" ? "close" : "trash"}
          width={20}
          height={20}
        />
      </span>
      <p className={styles.notice__copy}>{children}</p>
      {action}
    </div>
  );
};

export default InlineNotice;
