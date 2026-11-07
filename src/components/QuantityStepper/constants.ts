export const QUANTITY_STEPPER_COPY = {
  DECREASE: (label: string) => `Reducir ${label}`,
  INCREASE: (label: string) => `Aumentar ${label}`,
  INVALID: "Escribe un número entero igual o mayor que 1.",
} as const;
