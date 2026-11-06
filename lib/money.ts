export function lineTotalCents(unitPriceCents: number, quantity: number): number {
  return unitPriceCents * quantity
}

export function sumCents(amounts: readonly number[]): number {
  return amounts.reduce((total, amount) => total + amount, 0)
}

export function formatCents(cents: number): string {
  const negative = cents < 0
  const absolute = Math.abs(cents)
  const euros = Math.floor(absolute / 100)
  const remainder = absolute % 100
  const grouped = euros.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const text = `${grouped},${remainder.toString().padStart(2, '0')} \u20ac`

  return negative ? `-${text}` : text
}
