export type CartRowState = "default" | "added" | "selected";

export type CartRowProps = {
  code: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  state: CartRowState;
  onSelect: () => void;
  onHold: () => void;
  onRelease: () => void;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
};
