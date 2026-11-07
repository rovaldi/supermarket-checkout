import clsx from "clsx";
import CartRow from "@/components/CartRow";
import type { CartRowState } from "@/components/CartRow/types";
import Icon from "@/components/Icon";
import { PRODUCT_LIST_COPY } from "./constants";
import type { ProductListProps } from "./types";
import styles from "./ProductList.module.scss";

const rowState = (id: string, selectedId: string | null, flashId: string | null): CartRowState => {
  if (id === selectedId) {
    return "selected";
  }

  if (id === flashId) {
    return "added";
  }

  return "default";
};

const ProductList = ({
  lines,
  selectedId,
  flashId,
  onSelect,
  onHold,
  onRelease,
  onQuantity,
  onRemove,
}: ProductListProps) => {
  return (
    <div className={styles.list}>
      <table className={styles.list__table}>
        <thead>
          <tr>
            <th className={clsx(styles.list__heading, styles.list__product)} scope="col">
              {PRODUCT_LIST_COPY.PRODUCT}
            </th>
            <th className={clsx(styles.list__heading, styles.list__price)} scope="col">
              {PRODUCT_LIST_COPY.PRICE}
            </th>
            <th className={clsx(styles.list__heading, styles.list__qty)} scope="col">
              {PRODUCT_LIST_COPY.QUANTITY}
            </th>
            <th className={clsx(styles.list__heading, styles.list__amount)} scope="col">
              {PRODUCT_LIST_COPY.AMOUNT}
            </th>
            <th className={clsx(styles.list__heading, styles.list__remove)} scope="col">
              <span className="visually-hidden">{PRODUCT_LIST_COPY.REMOVE}</span>
            </th>
          </tr>
        </thead>
        {lines.length > 0 ? (
          <tbody>
            {lines.map((line) => (
              <CartRow
                key={line.id}
                code={line.code}
                name={line.name}
                quantity={line.quantity}
                unitPriceCents={line.unitPriceCents}
                state={rowState(line.id, selectedId, flashId)}
                onSelect={() => onSelect(line.id)}
                onHold={() => onHold(line.id)}
                onRelease={() => onRelease(line.id)}
                onQuantity={(quantity) => onQuantity(line.id, quantity)}
                onRemove={() => onRemove(line.id)}
              />
            ))}
          </tbody>
        ) : null}
      </table>
      {lines.length === 0 ? (
        <div className={styles.list__empty}>
          <Icon className={styles.list__basket} name="basket" width={64} height={64} />
          <p>{PRODUCT_LIST_COPY.EMPTY}</p>
        </div>
      ) : null}
    </div>
  );
};

export default ProductList;
