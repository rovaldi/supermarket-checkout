import { describe, expect, it } from 'vitest'
import { formatCents, lineTotalCents, sumCents } from './money.ts'

describe('money', () => {
  it('keeps line totals in cents', () => {
    expect(lineTotalCents(95, 2)).toBe(190)
  })

  it('sums cents', () => {
    expect(sumCents([95, 60, 40])).toBe(195)
    expect(sumCents([])).toBe(0)
  })

  it('formats cents in euros', () => {
    expect(formatCents(95)).toBe('0,95 \u20ac')
    expect(formatCents(155)).toBe('1,55 \u20ac')
    expect(formatCents(123456)).toBe('1.234,56 \u20ac')
    expect(formatCents(0)).toBe('0,00 \u20ac')
  })
})
