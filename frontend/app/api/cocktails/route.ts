import { cookies } from 'next/headers'

const COCKTAIL_BASE =
  process.env.COCKTAIL_SERVICE_URL ||
  process.env.NEXT_PUBLIC_COCKTAIL_SERVICE_URL ||
  'http://localhost:3001/cocktail'

/**
 * API proxy pour le Cocktail Service.
 * GET  -> /cocktails/random
 * POST -> /history (enregistre like/dislike)
 */
export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) {
    return Response.json({ detail: 'unauthorized' }, { status: 401 })
  }

  try {
    const r = await fetch(`${COCKTAIL_BASE}/cocktails/random`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })

    const json = await r.json().catch(() => ({}))
    return Response.json(json, { status: r.status })
  } catch {
    return Response.json(
      { detail: 'cocktail service unreachable' },
      { status: 503 }
    )
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) {
    return Response.json({ detail: 'unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const { cocktailId, action, source = 'tinder' } = body || {}

    if (!cocktailId || !['like', 'dislike'].includes(action)) {
      return Response.json(
        { detail: 'cocktailId + action (like|dislike) requis' },
        { status: 400 }
      )
    }

    // History endpoints sit at /cocktail/history (global prefix + controller)
    const r = await fetch(`${COCKTAIL_BASE}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cocktailId, action, source }),
    })

    const json = await r.json().catch(() => ({}))
    return Response.json(json, { status: r.status })
  } catch {
    return Response.json(
      { detail: 'recording failed' },
      { status: 500 }
    )
  }
}
