import { cookies } from 'next/headers'

const COCKTAIL_BASE =
  process.env.COCKTAIL_SERVICE_URL ||
  process.env.NEXT_PUBLIC_COCKTAIL_SERVICE_URL ||
  'http://localhost:3001/cocktail'

/**
 * Recherche cocktails via le cocktail-service.
 * Supporte type=name|category|letter avec param value, sinon fallback name.
 */
export async function GET(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) {
    return Response.json({ detail: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'name'
  const value = searchParams.get('value') || ''

  if (!value) {
    return Response.json({ detail: 'value query param requis' }, { status: 400 })
  }

  const target =
    type === 'category'
      ? `${COCKTAIL_BASE}/cocktails/by-category?category=${encodeURIComponent(value)}`
      : type === 'glass'
        ? `${COCKTAIL_BASE}/cocktails/by-glass?glass=${encodeURIComponent(value)}`
        : type === 'alcoholic'
          ? `${COCKTAIL_BASE}/cocktails/by-alcoholic?alcoholic=${encodeURIComponent(value)}`
          : type === 'letter'
            ? `${COCKTAIL_BASE}/cocktails/by-letter?letter=${encodeURIComponent(value)}`
            : `${COCKTAIL_BASE}/cocktails/search?q=${encodeURIComponent(value)}`

  try {
    const r = await fetch(target, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    const json = await r.json().catch(() => ({}))
    return Response.json(json, { status: r.status })
  } catch {
    return Response.json({ detail: 'cocktail search unreachable' }, { status: 503 })
  }
}
