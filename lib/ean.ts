const EAN_LENGTH = 13

export function isDigitString(value: string): boolean {
  return /^\d+$/.test(value)
}

export function eanCheckDigit(code12: string): number {
  let sum = 0

  for (let index = 0; index < code12.length; index += 1) {
    const digit = Number(code12[index])
    sum += digit * (index % 2 === 0 ? 1 : 3)
  }

  return (10 - (sum % 10)) % 10
}

export function isValidEan13(value: string): boolean {
  if (value.length !== EAN_LENGTH || !isDigitString(value)) {
    return false
  }

  const expected = eanCheckDigit(value.slice(0, 12))
  return expected === Number(value[12])
}

export type Ean13Failure = 'format' | 'check'

export function ean13Failure(value: string): Ean13Failure | null {
  if (value.length !== EAN_LENGTH || !isDigitString(value)) {
    return 'format'
  }

  if (!isValidEan13(value)) {
    return 'check'
  }

  return null
}
