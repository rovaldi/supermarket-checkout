import type { ButtonHTMLAttributes } from "react";

export type ButtonProps = {
  children: string;
  kind?: "primary" | "secondary";
  fullWidth?: boolean;
  busy?: boolean;
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "disabled" | "onClick">;
