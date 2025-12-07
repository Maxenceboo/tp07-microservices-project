import { cookies } from 'next/headers'

const COCKTAIL_BASE =
  process.env.COCKTAIL_SERVICE_URL ||
  process.env.NEXT_PUBLIC_COCKTAIL_SERVICE_URL ||
  'http://localhost:3001/cocktail'

/**
 * Récupère l'historique des actions cocktails.
 * Proxy vers le cocktail-service pour conserver le token côté backend.
 */
export async function GET(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) {
    return Response.json({ detail: 'unauthorized' }, { status: 401 })
  }

  const search = new URL(request.url).searchParams.toString()
  const target = search
    ? `${COCKTAIL_BASE}/history?${search}`
    : `${COCKTAIL_BASE}/history`

  try {
    const r = await fetch(target, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })

    const json = await r.json().catch(() => ({}))
    return Response.json(json, { status: r.status })
  } catch {
    return Response.json(
      { detail: 'cocktail history unreachable' },
      { status: 503 }
    )
  }
}
