import { describe, expect, it } from 'vitest'
import { ean13Failure, eanCheckDigit, isDigitString, isValidEan13 } from './ean.ts'

describe('ean', () => {
  it('accepts 13 digits with a good check digit', () => {
    expect(isDigitString('2000000750019')).toBe(true)
    expect(isValidEan13('2000000750019')).toBe(true)
    expect(ean13Failure('2000000750019')).toBeNull()
  })

  it('rejects a bad check digit', () => {
    expect(isValidEan13('2000000750010')).toBe(false)
    expect(ean13Failure('2000000750010')).toBe('check')
  })

  it('rejects letters', () => {
    expect(isDigitString('200000075001a')).toBe(false)
    expect(isValidEan13('200000075001a')).toBe(false)
    expect(ean13Failure('200000075001a')).toBe('format')
  })

  it('keeps leading zeros', () => {
    expect(isDigitString('0000000000000')).toBe(true)
    expect(eanCheckDigit('000000000000')).toBe(0)
    expect(isValidEan13('0000000000000')).toBe(true)
    expect(ean13Failure('0000000000001')).toBe('check')
  })
})
