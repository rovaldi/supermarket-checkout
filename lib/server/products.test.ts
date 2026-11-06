import { describe, expect, it } from 'vitest'
import { handleProductsRequest } from './products.ts'

const request = (search: string) => {
  return handleProductsRequest(new URL(`http://127.0.0.1/api/products${search}`))
}

describe('products', () => {
  it('returns an existing product', async () => {
    const response = request('?code=2000000750019')

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      id: 'leche',
      name: 'Leche entera 1 L',
      code: '2000000750019',
      priceCents: 95,
      unit: '1 L',
    })
  })

  it('returns not found for a missing product', async () => {
    const response = request('?code=2000000750996')

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ error: 'not_found' })
  })

  it('rejects a bad format', async () => {
    const response = request('?code=abc')

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'invalid_code' })
  })

  it('rejects a bad check digit', async () => {
    const response = request('?code=2000000750010')

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'invalid_check' })
  })

  it('searches by prefix', async () => {
    const response = request('?q=200000075001')
    const body = (await response.json()) as { products: { code: string }[] }

    expect(response.status).toBe(200)
    expect(body.products.map((product) => product.code)).toEqual(['2000000750019'])
  })

  it('returns no products for an empty search', async () => {
    const response = request('?q=')

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ products: [] })
  })
})
