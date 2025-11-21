import { cookies } from 'next/headers'

const COCKTAIL_BASE =
  process.env.COCKTAIL_SERVICE_URL ||
  process.env.NEXT_PUBLIC_COCKTAIL_SERVICE_URL ||
  'http://localhost:3001/cocktail'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) {
    return Response.json({ detail: 'unauthorized' }, { status: 401 })
  }

  try {
    const endpoints = [
      `${COCKTAIL_BASE}/cocktails/categories`,
      `${COCKTAIL_BASE}/cocktails/glasses`,
      `${COCKTAIL_BASE}/cocktails/alcoholic`,
    ]

    const results = await Promise.all(
      endpoints.map((url) =>
        fetch(url, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        }).then((r) => r.json().catch(() => []))
      )
    )

    const [categories, glasses, alcoholic] = results
    return Response.json({ categories, glasses, alcoholic }, { status: 200 })
  } catch {
    return Response.json({ detail: 'cocktail service unreachable' }, { status: 503 })
  }
}
