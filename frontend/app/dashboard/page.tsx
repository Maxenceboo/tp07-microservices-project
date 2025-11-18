import { serverApi } from '@/lib/api'
import { getAccessToken } from '@/lib/auth'

export default async function Dashboard() {
    const api = serverApi()
    const token = await getAccessToken()

    const hasToken = Boolean(token)
    let tokenSent = false
    let orders: any[] = []

    try {
        const headers: Record<string, string> = { 'x-ssr': '1' }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`
            tokenSent = true
        }

        orders = await api.get('/orders', {
            headers,
            cache: 'no-store',
        })
    } catch {
        orders = []
    }

    return (
        <main style={{ maxWidth: 800, margin: '2rem auto', fontFamily: 'system-ui' }}>
            <h1>Dashboard</h1>

            <div style={{ margin: '1rem 0', padding: '1rem', border: '1px solid #ddd' }}>
                <p><strong>Access Token présent :</strong> {hasToken ? 'Oui' : 'Non'}</p>
                <p><strong>Token envoyé :</strong> {tokenSent ? 'Oui' : 'Non'}</p>
            </div>

            <pre>{JSON.stringify(orders, null, 2)}</pre>
        </main>
    )
}
