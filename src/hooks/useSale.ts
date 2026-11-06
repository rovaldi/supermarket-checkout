import { useCallback, useEffect, useState } from "react";
import { lineTotalCents, sumCents } from "../../lib/money.ts";
import type { ProductSummary } from "../../lib/types.ts";
import type { CartLine, RemovedSnapshot } from "@/types";

const FLASH_MS = 1500;
const SELECT_MS = 2000;

export const useSale = () => {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectionTick, setSelectionTick] = useState(0);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [removed, setRemoved] = useState<RemovedSnapshot | null>(null);

  useEffect(() => {
    if (!flashId) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setFlashId((current) => (current === flashId ? null : current));
    }, FLASH_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [flashId]);

  useEffect(() => {
    if (!selectedId || editingId === selectedId) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setSelectedId((current) => (current === selectedId ? null : current));
    }, SELECT_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [selectedId, editingId, selectionTick]);

  const totalCents = sumCents(
    lines.map((line) => lineTotalCents(line.unitPriceCents, line.quantity)),
  );
  const itemCount = sumCents(lines.map((line) => line.quantity));

  const addProduct = (product: ProductSummary): "created" | "incremented" => {
    const applied: { outcome: "created" | "incremented"; lineId: string } = {
      outcome: "created",
      lineId: product.id,
    };

    setLines((current) => {
      const existing = current.find((line) => line.code === product.code);

      if (existing) {
        applied.outcome = "incremented";
        applied.lineId = existing.id;
        return current.map((line) =>
          line.code === product.code ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }

      applied.outcome = "created";
      applied.lineId = product.id;
      const line: CartLine = {
        id: product.id,
        code: product.code,
        name: product.name,
        unit: product.unit,
        unitPriceCents: product.priceCents,
        quantity: 1,
      };

      return [...current, line];
    });
    setRemoved(null);

    if (applied.outcome === "incremented") {
      selectLine(applied.lineId);
      return "incremented";
    }

    setFlashId(applied.lineId);
    return "created";
  };

  const selectLine = (id: string) => {
    setSelectedId(id);
    setEditingId((current) => (current === id ? current : null));
    setSelectionTick((tick) => tick + 1);
    setFlashId((current) => (current === id ? null : current));
  };

  const holdEdit = (id: string) => {
    setSelectedId(id);
    setEditingId(id);
    setFlashId((current) => (current === id ? null : current));
  };

  const releaseEdit = (id: string) => {
    setEditingId((current) => (current === id ? null : current));
    setSelectionTick((tick) => tick + 1);
  };

  const setQuantity = (id: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1) {
      return;
    }

    setLines((current) => current.map((line) => (line.id === id ? { ...line, quantity } : line)));
    selectLine(id);
  };

  const removeLine = (id: string): CartLine | null => {
    const index = lines.findIndex((line) => line.id === id);
    const line = lines[index];

    if (!line) {
      return null;
    }

    setRemoved({ line, index });
    setLines((current) => current.filter((item) => item.id !== id));
    setSelectedId((current) => (current === id ? null : current));
    setEditingId((current) => (current === id ? null : current));
    setFlashId((current) => (current === id ? null : current));
    return line;
  };

  const undoRemove = () => {
    if (!removed) {
      return;
    }

    setLines((current) => {
      if (current.some((line) => line.id === removed.line.id)) {
        return current;
      }

      const next = [...current];
      next.splice(Math.min(removed.index, next.length), 0, removed.line);
      return next;
    });
    setRemoved(null);
  };

  const dismissRemove = useCallback(() => {
    setRemoved(null);
  }, []);

  const clearSale = () => {
    setLines([]);
    setSelectedId(null);
    setEditingId(null);
    setFlashId(null);
    setRemoved(null);
  };

  return {
    lines,
    selectedId,
    flashId,
    removed,
    totalCents,
    itemCount,
    addProduct,
    selectLine,
    holdEdit,
    releaseEdit,
    setQuantity,
    removeLine,
    undoRemove,
    dismissRemove,
    clearSale,
  };
};
