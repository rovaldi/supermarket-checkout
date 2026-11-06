import { ean13Failure } from '../ean.ts'
import { lineTotalCents, sumCents } from '../money.ts'
import { paymentMethods, type ApiErrorCode, type PaymentMethod, type SaleLineResult, type SaleResponse } from '../types.ts'
import { findProductByCode } from './catalog.ts'

export const SALE_TICKET = '1042'

export type SaleFailure = {
  ok: false
  status: number
  error: ApiErrorCode
}

export type SaleSuccess = {
  ok: true
  sale: SaleResponse
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === 'string' && paymentMethods.some((method) => method === value)
}

export function createSale(body: unknown): SaleSuccess | SaleFailure {
  if (!isRecord(body) || !Array.isArray(body.lines) || body.lines.length === 0) {
    return { ok: false, status: 400, error: 'invalid_sale' }
  }

  if (!isPaymentMethod(body.paymentMethod)) {
    return { ok: false, status: 400, error: 'invalid_sale' }
  }

  const quantities = new Map<string, number>()

  for (const entry of body.lines) {
    if (!isRecord(entry) || typeof entry.code !== 'string') {
      return { ok: false, status: 400, error: 'invalid_sale' }
    }

    const failure = ean13Failure(entry.code)

    if (failure === 'format') {
      return { ok: false, status: 400, error: 'invalid_code' }
    }

    if (failure === 'check') {
      return { ok: false, status: 400, error: 'invalid_check' }
    }

    if (typeof entry.quantity !== 'number' || !Number.isInteger(entry.quantity) || entry.quantity < 1) {
      return { ok: false, status: 400, error: 'invalid_sale' }
    }

    if (!findProductByCode(entry.code)) {
      return { ok: false, status: 400, error: 'unknown_product' }
    }

    quantities.set(entry.code, (quantities.get(entry.code) ?? 0) + entry.quantity)
  }

  const lines: SaleLineResult[] = []

  for (const [code, quantity] of quantities) {
    const product = findProductByCode(code)

    if (!product) {
      return { ok: false, status: 400, error: 'unknown_product' }
    }

    lines.push({
      code: product.code,
      name: product.name,
      unit: product.unit,
      quantity,
      unitPriceCents: product.priceCents,
      lineTotalCents: lineTotalCents(product.priceCents, quantity),
    })
  }

  return {
    ok: true,
    sale: {
      ticket: SALE_TICKET,
      totalCents: sumCents(lines.map((line) => line.lineTotalCents)),
      itemCount: sumCents(lines.map((line) => line.quantity)),
      paymentMethod: body.paymentMethod,
      lines,
    },
  }
}
