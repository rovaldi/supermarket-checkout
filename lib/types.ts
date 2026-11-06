export const paymentMethods = ['efectivo', 'tarjeta', 'ticket-restaurante'] as const

export type PaymentMethod = (typeof paymentMethods)[number]

export type ProductCategory =
  | 'Bebidas'
  | 'Lácteos'
  | 'Frutas y verduras'
  | 'Panadería'
  | 'Conservas'
  | 'Alimentación general'
  | 'Limpieza y hogar'
  | 'Otros'

export type Product = {
  id: string
  name: string
  code: string
  category: ProductCategory
  priceCents: number
  unit: string
}

export type ProductSummary = {
  id: string
  name: string
  code: string
  priceCents: number
  unit: string
}

export type SaleLineInput = {
  code: string
  quantity: number
}

export type SaleRequest = {
  lines: SaleLineInput[]
  paymentMethod: PaymentMethod
}

export type SaleLineResult = {
  code: string
  name: string
  unit: string
  quantity: number
  unitPriceCents: number
  lineTotalCents: number
}

export type SaleResponse = {
  ticket: string
  totalCents: number
  itemCount: number
  paymentMethod: PaymentMethod
  lines: SaleLineResult[]
}

export type ApiErrorCode =
  | 'invalid_code'
  | 'invalid_check'
  | 'invalid_query'
  | 'not_found'
  | 'invalid_sale'
  | 'unknown_product'

export type ApiErrorBody = {
  error: ApiErrorCode
}
