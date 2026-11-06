import {
  paymentMethods,
  type ApiErrorBody,
  type ApiErrorCode,
  type PaymentMethod,
  type ProductSummary,
  type SaleLineResult,
  type SaleRequest,
  type SaleResponse,
} from "../../lib/types.ts";

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: ApiErrorBody["error"] | "network";

  constructor(status: number, code: ApiErrorBody["error"] | "network") {
    super(code);
    this.status = status;
    this.code = code;
  }
}

const errorCodes: readonly ApiErrorCode[] = [
  "invalid_code",
  "invalid_check",
  "invalid_query",
  "not_found",
  "invalid_sale",
  "unknown_product",
];

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const isInteger = (value: unknown): value is number => {
  return typeof value === "number" && Number.isInteger(value);
};

const isApiErrorCode = (value: unknown): value is ApiErrorCode => {
  return typeof value === "string" && errorCodes.some((code) => code === value);
};

const isPaymentMethod = (value: unknown): value is PaymentMethod => {
  return typeof value === "string" && paymentMethods.some((method) => method === value);
};

const isProductSummary = (value: unknown): value is ProductSummary => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.code === "string" &&
    isInteger(value.priceCents) &&
    typeof value.unit === "string"
  );
};

const isSaleLine = (value: unknown): value is SaleLineResult => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.code === "string" &&
    typeof value.name === "string" &&
    typeof value.unit === "string" &&
    isInteger(value.quantity) &&
    value.quantity >= 1 &&
    isInteger(value.unitPriceCents) &&
    isInteger(value.lineTotalCents)
  );
};

const isSaleResponse = (value: unknown): value is SaleResponse => {
  if (!isRecord(value) || !Array.isArray(value.lines)) {
    return false;
  }

  return (
    typeof value.ticket === "string" &&
    isInteger(value.totalCents) &&
    isInteger(value.itemCount) &&
    isPaymentMethod(value.paymentMethod) &&
    value.lines.every(isSaleLine)
  );
};

const readJson = async (response: Response): Promise<unknown> => {
  return response.json();
};

const readError = async (response: Response): Promise<ApiRequestError> => {
  try {
    const body = await readJson(response);
    if (isRecord(body) && isApiErrorCode(body.error)) {
      return new ApiRequestError(response.status, body.error);
    }
  } catch {
    return new ApiRequestError(response.status, "network");
  }

  return new ApiRequestError(response.status, "network");
};

export const fetchProductByCode = async (
  code: string,
  signal?: AbortSignal,
): Promise<ProductSummary | null> => {
  const response = await fetch(`/api/products?code=${encodeURIComponent(code)}`, { signal });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw await readError(response);
  }

  const body = await readJson(response);

  if (!isProductSummary(body)) {
    throw new ApiRequestError(response.status, "network");
  }

  return body;
};

export const searchProducts = async (
  prefix: string,
  signal?: AbortSignal,
): Promise<ProductSummary[]> => {
  const response = await fetch(`/api/products?q=${encodeURIComponent(prefix)}`, { signal });

  if (!response.ok) {
    throw await readError(response);
  }

  const body = await readJson(response);

  if (!isRecord(body) || !Array.isArray(body.products) || !body.products.every(isProductSummary)) {
    throw new ApiRequestError(response.status, "network");
  }

  return body.products;
};

export const submitSale = async (request: SaleRequest): Promise<SaleResponse> => {
  let response: Response;

  try {
    response = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch {
    throw new ApiRequestError(0, "network");
  }

  if (!response.ok) {
    throw await readError(response);
  }

  const body = await readJson(response);

  if (!isSaleResponse(body)) {
    throw new ApiRequestError(response.status, "network");
  }

  return body;
};

export type { PaymentMethod, ProductSummary, SaleResponse };
