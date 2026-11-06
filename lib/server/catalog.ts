import type { Product, ProductSummary } from '../types.js'

/**
 * Fictional in-store catalog. Barcodes use prefix 200 and a valid EAN-13
 * check digit. They are not GS1-registered commercial codes.
 * Prices are integer euro cents.
 */
export const catalog: readonly Product[] = [
  {
    id: 'leche',
    name: 'Leche entera 1 L',
    code: '2000000750019',
    category: 'Lácteos',
    priceCents: 95,
    unit: '1 L',
  },
  {
    id: 'pan',
    name: 'Pan de barra',
    code: '2000000750026',
    category: 'Panadería',
    priceCents: 60,
    unit: '1 ud',
  },
  {
    id: 'huevos',
    name: 'Huevos (12)',
    code: '2000000750033',
    category: 'Alimentación general',
    priceCents: 235,
    unit: '12 uds',
  },
  {
    id: 'aceite',
    name: 'Aceite de oliva 1 L',
    code: '2000000750040',
    category: 'Alimentación general',
    priceCents: 890,
    unit: '1 L',
  },
  {
    id: 'arroz',
    name: 'Arroz 1 kg',
    code: '2000000750057',
    category: 'Alimentación general',
    priceCents: 125,
    unit: '1 kg',
  },
  {
    id: 'tomate',
    name: 'Tomate triturado',
    code: '2000000750064',
    category: 'Conservas',
    priceCents: 85,
    unit: '1 lata',
  },
  {
    id: 'agua',
    name: 'Agua 1,5 L',
    code: '2000000750071',
    category: 'Bebidas',
    priceCents: 40,
    unit: '1,5 L',
  },
  {
    id: 'yogur',
    name: 'Yogur natural (4)',
    code: '2000000750088',
    category: 'Lácteos',
    priceCents: 110,
    unit: '4 uds',
  },
  {
    id: 'cafe',
    name: 'Café molido 250 g',
    code: '2000000750095',
    category: 'Alimentación general',
    priceCents: 345,
    unit: '250 g',
  },
  {
    id: 'platanos',
    name: 'Plátanos 1 kg',
    code: '2000000750101',
    category: 'Frutas y verduras',
    priceCents: 199,
    unit: '1 kg',
  },
  {
    id: 'zumo',
    name: 'Zumo de naranja 1 L',
    code: '2000000750118',
    category: 'Bebidas',
    priceCents: 145,
    unit: '1 L',
  },
  {
    id: 'queso',
    name: 'Queso fresco 250 g',
    code: '2000000750125',
    category: 'Lácteos',
    priceCents: 275,
    unit: '250 g',
  },
  {
    id: 'manzanas',
    name: 'Manzanas 1 kg',
    code: '2000000750132',
    category: 'Frutas y verduras',
    priceCents: 189,
    unit: '1 kg',
  },
  {
    id: 'pan-integral',
    name: 'Pan integral',
    code: '2000000750149',
    category: 'Panadería',
    priceCents: 115,
    unit: '1 ud',
  },
  {
    id: 'atun',
    name: 'Atún en aceite',
    code: '2000000750156',
    category: 'Conservas',
    priceCents: 165,
    unit: 'pack 3',
  },
  {
    id: 'pasta',
    name: 'Espaguetis 500 g',
    code: '2000000750163',
    category: 'Alimentación general',
    priceCents: 89,
    unit: '500 g',
  },
  {
    id: 'detergente',
    name: 'Detergente ropa 1,5 L',
    code: '2000000750170',
    category: 'Limpieza y hogar',
    priceCents: 399,
    unit: '1,5 L',
  },
  {
    id: 'papel',
    name: 'Papel de cocina',
    code: '2000000750187',
    category: 'Limpieza y hogar',
    priceCents: 159,
    unit: '2 rollos',
  },
  {
    id: 'galletas',
    name: 'Galletas María 800 g',
    code: '2000000750194',
    category: 'Otros',
    priceCents: 135,
    unit: '800 g',
  },
  {
    id: 'leche-semi',
    name: 'Leche semidesnatada 1 L',
    code: '2000000750200',
    category: 'Lácteos',
    priceCents: 92,
    unit: '1 L',
  },
]

export function toSummary(product: Product): ProductSummary {
  return {
    id: product.id,
    name: product.name,
    code: product.code,
    priceCents: product.priceCents,
    unit: product.unit,
  }
}

export function findProductByCode(code: string): Product | undefined {
  return catalog.find((product) => product.code === code)
}

export function searchProductsByPrefix(prefix: string): ProductSummary[] {
  return catalog.filter((product) => product.code.startsWith(prefix)).map(toSummary)
}
