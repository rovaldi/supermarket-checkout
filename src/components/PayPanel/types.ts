import type { IconName } from "@/components/Icon/types";
import type { PaymentMethod } from "../../../lib/types.ts";

export type PayMethodOption = {
  id: PaymentMethod;
  label: string;
  icon: IconName;
};

export type PayPanelProps = {
  totalCents: number;
  itemCount: number;
  methods: PayMethodOption[];
  method: PaymentMethod | null;
  submitting: boolean;
  chargeError: boolean;
  onMethod: (method: PaymentMethod) => void;
  onCharge: () => void;
  onClear: () => void;
};
