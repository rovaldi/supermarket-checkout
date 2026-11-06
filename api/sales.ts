import { createSale } from '../lib/server/sales.ts'

export async function POST(request: Request): Promise<Response> {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'invalid_sale' }, { status: 400 })
  }

  const result = createSale(body)

  if (result.ok === false) {
    return Response.json({ error: result.error }, { status: result.status })
  }

  return Response.json(result.sale)
}
