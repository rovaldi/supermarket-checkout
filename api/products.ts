import { handleProductsRequest } from '../lib/server/products.js'

export function GET(request: Request): Response {
  return handleProductsRequest(new URL(request.url))
}
