import { ean13Failure, isDigitString } from '../ean.ts'
import { findProductByCode, searchProductsByPrefix, toSummary } from './catalog.ts'

const MIN_PREFIX = 3

export function handleProductsRequest(url: URL): Response {
  const code = url.searchParams.get('code')
  const query = url.searchParams.get('q')

  if (code !== null) {
    const failure = ean13Failure(code)

    if (failure === 'format') {
      return Response.json({ error: 'invalid_code' }, { status: 400 })
    }

    if (failure === 'check') {
      return Response.json({ error: 'invalid_check' }, { status: 400 })
    }

    const product = findProductByCode(code)

    if (!product) {
      return Response.json({ error: 'not_found' }, { status: 404 })
    }

    return Response.json(toSummary(product))
  }

  if (query !== null) {
    if (query.length < MIN_PREFIX || query.length > 13 || !isDigitString(query)) {
      return Response.json({ products: [] })
    }

    return Response.json({ products: searchProductsByPrefix(query) })
  }

  return Response.json({ error: 'invalid_query' }, { status: 400 })
}
