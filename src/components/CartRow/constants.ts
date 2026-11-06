export const CART_ROW_COPY = {
  QUANTITY: (name: string) => `Cantidad de ${name}`,
  REMOVE: (name: string) => `Eliminar ${name}`,
} as const;
