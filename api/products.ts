import { handleProductsRequest } from '../lib/server/products.ts'

export function GET(request: Request): Response {
  return handleProductsRequest(new URL(request.url))
}
