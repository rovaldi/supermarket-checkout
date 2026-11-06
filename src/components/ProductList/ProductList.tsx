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
      <div className={styles.list__header}>
        <p className={styles.list__product}>{PRODUCT_LIST_COPY.PRODUCT}</p>
        <p className={styles.list__price}>{PRODUCT_LIST_COPY.PRICE}</p>
        <p className={styles.list__qty}>{PRODUCT_LIST_COPY.QUANTITY}</p>
        <p className={styles.list__amount}>{PRODUCT_LIST_COPY.AMOUNT}</p>
        <span className={styles.list__spacer} />
      </div>
      {lines.length === 0 ? (
        <div className={styles.list__empty}>
          <Icon className={styles.list__basket} name="basket" width={64} height={64} />
          <p>{PRODUCT_LIST_COPY.EMPTY}</p>
        </div>
      ) : (
        <div className={styles.list__rows}>
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
        </div>
      )}
    </div>
  );
};

export default ProductList;
