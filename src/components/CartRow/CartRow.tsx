import type { MouseEvent } from "react";
import { formatCents, lineTotalCents } from "../../../lib/money.ts";
import clsx from "clsx";
import Icon from "@/components/Icon";
import QuantityStepper from "@/components/QuantityStepper";
import { CART_ROW_COPY } from "./constants";
import type { CartRowProps } from "./types";
import styles from "./CartRow.module.scss";

const CartRow = ({
  code,
  name,
  quantity,
  unitPriceCents,
  state,
  onSelect,
  onHold,
  onRelease,
  onQuantity,
  onRemove,
}: CartRowProps) => {
  const remove = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRemove();
  };

  return (
    <tr
      className={clsx(
        styles.row,
        state === "added" && styles["row--added"],
        state === "selected" && styles["row--selected"],
      )}
      onClick={onSelect}
    >
      <td className={clsx(styles.row__cell, styles["row__cell--product"])}>
        <div className={styles.row__product}>
          <p className={styles.row__name}>{name}</p>
          <p className={styles.row__code}>{code}</p>
        </div>
      </td>
      <td className={clsx(styles.row__cell, styles.row__price)}>{formatCents(unitPriceCents)}</td>
      <td className={clsx(styles.row__cell, styles.row__qty)}>
        <QuantityStepper
          value={quantity}
          label={CART_ROW_COPY.QUANTITY(name)}
          onHold={onHold}
          onRelease={onRelease}
          onCommit={onQuantity}
        />
      </td>
      <td className={clsx(styles.row__cell, styles.row__amount)}>
        {formatCents(lineTotalCents(unitPriceCents, quantity))}
      </td>
      <td className={clsx(styles.row__cell, styles.row__action)}>
        <button
          className={styles.row__remove}
          type="button"
          aria-label={CART_ROW_COPY.REMOVE(name)}
          onClick={remove}
        >
          <Icon className={styles.row__trash} name="trash" width={20} height={20} />
        </button>
      </td>
    </tr>
  );
};

export default CartRow;
