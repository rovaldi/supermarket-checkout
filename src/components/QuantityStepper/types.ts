export type QuantityStepperProps = {
  value: number;
  label: string;
  onHold: () => void;
  onRelease: () => void;
  onCommit: (quantity: number) => void;
};
