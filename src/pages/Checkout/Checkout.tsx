import { useId, useRef, useState } from "react";
import { ApiRequestError, fetchProductByCode, submitSale } from "@/api/client";
import CodeEntry from "@/components/CodeEntry";
import Icon from "@/components/Icon";
import InlineNotice from "@/components/InlineNotice";
import NoticeSlot from "@/components/NoticeSlot";
import Modal from "@/components/Modal";
import PayPanel from "@/components/PayPanel";
import { PAY_PANEL_COPY } from "@/components/PayPanel/constants";
import ProductList from "@/components/ProductList";
import StatusHeader from "@/components/StatusHeader";
import { useSale } from "@/hooks/useSale";
import { formatSaleClock } from "@/utils";
import type { LookupResult } from "@/components/CodeEntry/types";
import { ean13Failure } from "../../../lib/ean.ts";
import { formatCents } from "../../../lib/money.ts";
import type { IconName } from "@/components/Icon/types";
import type { PaymentMethod, SaleResponse } from "../../../lib/types.ts";
import { CHECKOUT_COPY } from "./constants";
import styles from "./Checkout.module.scss";

const methods: Array<{ id: PaymentMethod; label: string; icon: IconName }> = [
  { id: "efectivo", label: CHECKOUT_COPY.METHOD_CASH, icon: "pay-cash" },
  { id: "tarjeta", label: CHECKOUT_COPY.METHOD_CARD, icon: "pay-card" },
  { id: "ticket-restaurante", label: CHECKOUT_COPY.METHOD_MEAL, icon: "pay-meal" },
];

type FieldNotice = "invalid" | "unknown" | "lookup";

const CHARGE_BEAT_MS = 180;

const waitChargeBeat = (startedAt: number) => {
  const remaining = CHARGE_BEAT_MS - (Date.now() - startedAt);

  if (remaining <= 0) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, remaining);
  });
};

const paymentLabel = (method: PaymentMethod): string => {
  return methods.find((item) => item.id === method)?.label ?? CHECKOUT_COPY.METHOD_CASH;
};

const Checkout = () => {
  const saleTitleId = useId();
  const sale = useSale();
  const [fieldNotice, setFieldNotice] = useState<FieldNotice | null>(null);
  const [dialog, setDialog] = useState<"clear" | "completed" | null>(null);
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [chargeError, setChargeError] = useState(false);
  const [completed, setCompleted] = useState<SaleResponse | null>(null);
  const [closedAt, setClosedAt] = useState<Date | null>(null);
  const [entryKey, setEntryKey] = useState(0);
  const [focusEntry, setFocusEntry] = useState(true);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  const lookup = async (code: string): Promise<LookupResult> => {
    const failure = ean13Failure(code);

    if (failure) {
      setFieldNotice("invalid");
      return "invalid";
    }

    try {
      const product = await fetchProductByCode(code);

      if (!product) {
        setFieldNotice("unknown");
        return "unknown";
      }

      const outcome = sale.addProduct(product);
      setAddedNotice(
        outcome === "incremented"
          ? CHECKOUT_COPY.QUANTITY_UPDATED(product.name)
          : CHECKOUT_COPY.ADDED(product.name),
      );
      setFieldNotice(null);
      return "added";
    } catch (error) {
      if (
        error instanceof ApiRequestError &&
        (error.code === "invalid_code" || error.code === "invalid_check")
      ) {
        setFieldNotice("invalid");
        return "invalid";
      }

      setFieldNotice("lookup");
      return "error";
    }
  };

  const openClear = () => {
    if (sale.itemCount === 0) {
      return;
    }

    setDialog("clear");
  };

  const clearOnExit = useRef(false);

  const confirmClear = () => {
    clearOnExit.current = true;
    setDialog(null);
  };

  const finishClear = () => {
    if (!clearOnExit.current) {
      return;
    }

    clearOnExit.current = false;
    sale.clearSale();
    setMethod(null);
    setFieldNotice(null);
    setChargeError(false);
    setAddedNotice(null);
    setFocusEntry(true);
    setEntryKey((key) => key + 1);
  };

  const confirmCharge = async () => {
    if (submitting || method === null || sale.itemCount === 0) {
      return;
    }

    const startedAt = Date.now();
    setSubmitting(true);
    setChargeError(false);

    try {
      const response = await submitSale({
        paymentMethod: method,
        lines: sale.lines.map((line) => ({ code: line.code, quantity: line.quantity })),
      });
      await waitChargeBeat(startedAt);
      const confirmedAt = new Date();
      sale.clearSale();
      setMethod(null);
      setFieldNotice(null);
      setCompleted(response);
      setClosedAt(confirmedAt);
      setFocusEntry(false);
      setEntryKey((key) => key + 1);
      setDialog("completed");
    } catch {
      await waitChargeBeat(startedAt);
      setChargeError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const newSale = () => {
    sale.clearSale();
    setMethod(null);
    setFieldNotice(null);
    setChargeError(false);
    setAddedNotice(null);
    setFocusEntry(true);
    setEntryKey((key) => key + 1);
    setDialog(null);
  };

  const removeLine = (id: string) => {
    const lastLine = sale.lines.length === 1;
    sale.removeLine(id);
    if (lastLine) {
      setMethod(null);
    }
    setFieldNotice(null);
  };

  return (
    <div className={styles.checkout}>
      <StatusHeader />
      <main className={styles.main}>
        <section className={styles.work} aria-labelledby={saleTitleId}>
          <h1 className="visually-hidden" id={saleTitleId}>
            {CHECKOUT_COPY.SALE_TITLE}
          </h1>
          <p className="visually-hidden" role="status">
            {addedNotice}
          </p>
          <CodeEntry
            key={entryKey}
            autoFocus={focusEntry}
            invalid={fieldNotice !== null}
            onValueChange={() => setFieldNotice(null)}
            onLookup={lookup}
          />
          <NoticeSlot noticeId={sale.removed ? `removed-${sale.removed.line.id}` : fieldNotice}>
            {sale.removed ? (
              <InlineNotice
                key={sale.removed.line.id}
                variant="removed"
                onExpire={sale.dismissRemove}
                action={
                  <button className={styles.undo} type="button" onClick={sale.undoRemove}>
                    {CHECKOUT_COPY.UNDO}
                  </button>
                }
              >
                <span>{sale.removed.line.name} </span>
                <span className={styles.undoWord}>{CHECKOUT_COPY.REMOVED}</span>
              </InlineNotice>
            ) : fieldNotice === "invalid" ? (
              <InlineNotice variant="error">{CHECKOUT_COPY.INVALID_CODE}</InlineNotice>
            ) : fieldNotice === "unknown" ? (
              <InlineNotice variant="error">{CHECKOUT_COPY.PRODUCT_NOT_FOUND}</InlineNotice>
            ) : fieldNotice === "lookup" ? (
              <InlineNotice variant="error">{CHECKOUT_COPY.LOOKUP_ERROR}</InlineNotice>
            ) : null}
          </NoticeSlot>
          <ProductList
            lines={sale.lines}
            selectedId={sale.selectedId}
            flashId={sale.flashId}
            onSelect={sale.selectLine}
            onHold={sale.holdEdit}
            onRelease={sale.releaseEdit}
            onQuantity={sale.setQuantity}
            onRemove={removeLine}
          />
        </section>
        <PayPanel
          totalCents={sale.totalCents}
          itemCount={sale.itemCount}
          methods={methods}
          method={method}
          submitting={submitting}
          chargeError={chargeError}
          onMethod={setMethod}
          onCharge={() => {
            void confirmCharge();
          }}
          onClear={openClear}
        />
      </main>
      <Modal
        open={dialog === "clear"}
        title={CHECKOUT_COPY.CLEAR_TITLE}
        secondaryLabel={CHECKOUT_COPY.CANCEL}
        primaryLabel={PAY_PANEL_COPY.CLEAR_SALE}
        onSecondary={() => setDialog(null)}
        onClose={() => setDialog(null)}
        onPrimary={confirmClear}
        onExited={finishClear}
      >
        <div className={styles.charge}>
          <p className={styles.charge__amount}>{formatCents(sale.totalCents)}</p>
          <p className={styles.charge__meta}>{PAY_PANEL_COPY.ITEM_COUNT(sale.itemCount)}</p>
        </div>
      </Modal>
      <Modal
        open={dialog === "completed" && completed !== null && closedAt !== null}
        title={CHECKOUT_COPY.COMPLETED_TITLE}
        align="center"
        primaryLabel={CHECKOUT_COPY.NEW_SALE}
        onPrimary={newSale}
      >
        {completed !== null && closedAt !== null ? (
          <div className={styles.closed}>
            <span className={styles.closed__mark} aria-hidden="true">
              <Icon name="check" width={32} height={32} />
            </span>
            <p className={styles.closed__label}>{PAY_PANEL_COPY.TOTAL}</p>
            <p className={styles.closed__amount}>{formatCents(completed.totalCents)}</p>
            <dl className={styles.closed__meta}>
              <div>
                <dt>{CHECKOUT_COPY.TICKET}</dt>
                <dd>{completed.ticket}</dd>
              </div>
              <div>
                <dt>{CHECKOUT_COPY.PAYMENT}</dt>
                <dd>{paymentLabel(completed.paymentMethod)}</dd>
              </div>
              <div>
                <dt>{CHECKOUT_COPY.DATE}</dt>
                <dd>{formatSaleClock(closedAt)}</dd>
              </div>
              <div>
                <dt>{CHECKOUT_COPY.PRINT}</dt>
                <dd>{CHECKOUT_COPY.PAPERLESS}</dd>
              </div>
            </dl>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default Checkout;
