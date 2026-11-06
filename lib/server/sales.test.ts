import { describe, expect, it } from 'vitest'
import { createSale } from './sales.ts'

const leche = { code: '2000000750019', quantity: 1 }

describe('sales', () => {
  it('creates a valid sale', () => {
    const result = createSale({ paymentMethod: 'efectivo', lines: [leche] })

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    expect(result.sale.ticket).toBe('1042')
    expect(result.sale.paymentMethod).toBe('efectivo')
    expect(result.sale.itemCount).toBe(1)
    expect(result.sale.totalCents).toBe(95)
    expect(result.sale.lines).toEqual([
      {
        code: '2000000750019',
        name: 'Leche entera 1 L',
        unit: '1 L',
        quantity: 1,
        unitPriceCents: 95,
        lineTotalCents: 95,
      },
    ])
  })

  it('recalculates the price on the server', () => {
    const result = createSale({
      paymentMethod: 'tarjeta',
      lines: [{ code: '2000000750019', quantity: 2, unitPriceCents: 1 }],
    })

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    expect(result.sale.lines[0]?.unitPriceCents).toBe(95)
    expect(result.sale.lines[0]?.lineTotalCents).toBe(190)
    expect(result.sale.totalCents).toBe(190)
  })

  it('rejects a bad code', () => {
    expect(createSale({ paymentMethod: 'efectivo', lines: [{ code: 'abc', quantity: 1 }] })).toEqual({
      ok: false,
      status: 400,
      error: 'invalid_code',
    })
  })

  it('rejects an unknown product', () => {
    expect(
      createSale({ paymentMethod: 'efectivo', lines: [{ code: '2000000750996', quantity: 1 }] }),
    ).toEqual({
      ok: false,
      status: 400,
      error: 'unknown_product',
    })
  })

  it('rejects an invalid quantity', () => {
    expect(createSale({ paymentMethod: 'efectivo', lines: [{ code: '2000000750019', quantity: 0 }] })).toEqual(
      {
        ok: false,
        status: 400,
        error: 'invalid_sale',
      },
    )
  })

  it('sums duplicate lines', () => {
    const result = createSale({
      paymentMethod: 'efectivo',
      lines: [leche, { code: '2000000750019', quantity: 2 }],
    })

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    expect(result.sale.lines).toHaveLength(1)
    expect(result.sale.lines[0]?.quantity).toBe(3)
    expect(result.sale.lines[0]?.lineTotalCents).toBe(285)
    expect(result.sale.itemCount).toBe(3)
    expect(result.sale.totalCents).toBe(285)
  })
})
