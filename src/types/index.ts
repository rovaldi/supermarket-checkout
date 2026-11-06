export type CartLine = {
  id: string;
  code: string;
  name: string;
  unit: string;
  unitPriceCents: number;
  quantity: number;
};

export type RemovedSnapshot = {
  line: CartLine;
  index: number;
};
