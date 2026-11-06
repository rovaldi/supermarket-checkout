import { useCallback, useEffect, useRef, useState, type AnimationEvent } from "react";
import clsx from "clsx";
import type { NoticeSlotProps } from "./types";
import styles from "./NoticeSlot.module.scss";

const EXIT_MS = 180;

type ShownNotice = {
  id: string;
  node: NoticeSlotProps["children"];
  phase: "in" | "out";
};

const NoticeSlot = ({ noticeId, children }: NoticeSlotProps) => {
  const [view, setView] = useState<ShownNotice | null>(null);
  const viewRef = useRef<ShownNotice | null>(null);
  const childrenRef = useRef(children);
  const noticeIdRef = useRef(noticeId);
  const leaveTimer = useRef(0);
  const finishLeaveRef = useRef(() => {});

  const finishLeave = useCallback(() => {
    window.clearTimeout(leaveTimer.current);

    if (!viewRef.current || viewRef.current.phase !== "out") {
      return;
    }

    const target = noticeIdRef.current;

    if (!target) {
      viewRef.current = null;
      setView(null);
      return;
    }

    const next: ShownNotice = { id: target, node: childrenRef.current, phase: "in" };
    viewRef.current = next;
    setView(next);
  }, []);

  useEffect(() => {
    childrenRef.current = children;
    noticeIdRef.current = noticeId;
    finishLeaveRef.current = finishLeave;
  }, [children, noticeId, finishLeave]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) {
        return;
      }

      const current = viewRef.current;
      const target = noticeIdRef.current;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduce) {
        if (!target) {
          viewRef.current = null;
          setView(null);
          return;
        }

        const next: ShownNotice = { id: target, node: childrenRef.current, phase: "in" };
        viewRef.current = next;
        setView(next);
        return;
      }

      if (!current && target) {
        const next: ShownNotice = { id: target, node: childrenRef.current, phase: "in" };
        viewRef.current = next;
        setView(next);
        return;
      }

      if (
        !current ||
        (current.id === target && current.phase === "in") ||
        current.phase === "out"
      ) {
        return;
      }

      const leaving: ShownNotice = { ...current, phase: "out" };
      viewRef.current = leaving;
      setView(leaving);
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = window.setTimeout(() => {
        finishLeaveRef.current();
      }, EXIT_MS);
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [noticeId]);

  useEffect(() => {
    return () => {
      window.clearTimeout(leaveTimer.current);
    };
  }, []);

  const onAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    finishLeave();
  };

  if (!view) {
    return null;
  }

  return (
    <div
      className={clsx(styles.slot, view.phase === "out" ? styles["slot--out"] : styles["slot--in"])}
      onAnimationEnd={onAnimationEnd}
    >
      {view.node}
    </div>
  );
};

export default NoticeSlot;
