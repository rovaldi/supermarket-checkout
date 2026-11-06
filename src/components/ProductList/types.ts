import type { CartLine } from "@/types";

export type ProductListProps = {
  lines: CartLine[];
  selectedId: string | null;
  flashId: string | null;
  onSelect: (id: string) => void;
  onHold: (id: string) => void;
  onRelease: (id: string) => void;
  onQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
};
