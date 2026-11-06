import type { ReactNode } from "react";

export type ModalProps = {
  open: boolean;
  title: string;
  align?: "left" | "center";
  children: ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
  onClose?: () => void;
  onExited?: () => void;
};
