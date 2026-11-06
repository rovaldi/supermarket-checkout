import Button from "@/components/Button";
import Icon from "@/components/Icon";
import InlineNotice from "@/components/InlineNotice";
import NoticeSlot from "@/components/NoticeSlot";
import { formatCents } from "../../../lib/money.ts";
import clsx from "clsx";
import { PAY_PANEL_COPY } from "./constants";
import type { PayPanelProps } from "./types";
import styles from "./PayPanel.module.scss";

const PayPanel = ({
  totalCents,
  itemCount,
  methods,
  method,
  submitting,
  chargeError,
  onMethod,
  onCharge,
  onClear,
}: PayPanelProps) => {
  const saleOpen = itemCount > 0;

  return (
    <aside className={styles.stack}>
      <section className={styles.panel} aria-labelledby="total-label">
        <h2 className={styles.panel__label} id="total-label">
          {PAY_PANEL_COPY.TOTAL}
        </h2>
        <p className={styles.panel__amount}>{formatCents(totalCents)}</p>
        <p className={styles.panel__meta}>{PAY_PANEL_COPY.ITEM_COUNT(itemCount)}</p>
        <p className={styles.panel__meta}>{PAY_PANEL_COPY.VAT_INCLUDED}</p>
      </section>
      <section className={styles.panel} aria-labelledby="payment-method-label">
        <h2 className={styles.panel__label} id="payment-method-label">
          {PAY_PANEL_COPY.PAYMENT_METHOD}
        </h2>
        <p className={styles.panel__hint} id="payment-method-hint">
          {PAY_PANEL_COPY.PAYMENT_HINT}
        </p>
        <div
          className={styles.methods}
          role="radiogroup"
          aria-labelledby="payment-method-label"
          aria-describedby="payment-method-hint"
        >
          {methods.map((item) => (
            <button
              key={item.id}
              className={clsx(styles.method, method === item.id && styles["method--selected"])}
              type="button"
              role="radio"
              aria-checked={method === item.id}
              disabled={!saleOpen || submitting}
              onClick={() => onMethod(item.id)}
            >
              <Icon className={styles.method__icon} name={item.icon} width={20} height={20} />
              {item.label}
            </button>
          ))}
        </div>
        <NoticeSlot noticeId={chargeError ? "charge" : null}>
          {chargeError ? (
            <InlineNotice variant="error">{PAY_PANEL_COPY.CHARGE_ERROR}</InlineNotice>
          ) : null}
        </NoticeSlot>
        <div className={styles.panel__actions}>
          <Button
            fullWidth
            busy={submitting}
            disabled={!saleOpen || method === null}
            onClick={onCharge}
          >
            {submitting ? PAY_PANEL_COPY.CHARGING : PAY_PANEL_COPY.CHARGE}
          </Button>
          <Button kind="secondary" fullWidth disabled={!saleOpen || submitting} onClick={onClear}>
            {PAY_PANEL_COPY.CLEAR_SALE}
          </Button>
        </div>
      </section>
    </aside>
  );
};

export default PayPanel;
