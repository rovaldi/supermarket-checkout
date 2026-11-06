import type { ReactNode } from "react";

export type InlineNoticeProps = {
  id?: string;
  variant: "error" | "removed";
  children: ReactNode;
  action?: ReactNode;
  onExpire?: () => void;
};
