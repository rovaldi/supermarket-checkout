export type IconName =
  | "barcode"
  | "basket"
  | "check"
  | "close"
  | "minus"
  | "pay-card"
  | "pay-cash"
  | "pay-meal"
  | "plus"
  | "trash";

export type IconProps = {
  name: IconName;
  width: number;
  height: number;
  className?: string;
};
