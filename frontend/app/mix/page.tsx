'use client'

import { useEffect, useMemo, useState } from 'react'

type Cocktail = {
  idDrink: string
  strDrink: string
  strDrinkThumb?: string
  strInstructions?: string
  strCategory?: string
  strAlcoholic?: string
  strGlass?: string
  [key: string]: any
}

const extractIngredients = (c: Cocktail | null) => {
  if (!c) return []
  const items: string[] = []
  for (let i = 1; i <= 15; i++) {
    const ing = c[`strIngredient${i}`]
    const measure = c[`strMeasure${i}`]
    if (ing) {
      const label = measure ? `${ing} – ${measure.trim()}` : ing
      items.push(label)
    }
  }
  return items
}

export default function CocktailsPage() {
  const [cocktail, setCocktail] = useState<Cocktail | null>(null)
  const [ratedIds, setRatedIds] = useState<string[]>([])
  const ratedSet = useMemo(() => new Set(ratedIds), [ratedIds])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authError, setAuthError] = useState('')
  const [actionLoading, setActionLoading] = useState<'like' | 'dislike' | ''>('')

  const loadRandom = async (attempt = 0) => {
    setLoading(true)
    setError('')
    setAuthError('')

    try {
      const res = await fetch('/api/cocktails', { cache: 'no-store' })

      if (res.status === 401) {
        setCocktail(null)
        setAuthError('Connecte-toi pour voir les cocktails.')
        return
      }

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || 'Chargement impossible')
      }
      if (!data?.idDrink) {
        throw new Error('Réponse du service cocktail invalide')
      }

      if (ratedSet.has(data.idDrink)) {
        // On évite de proposer un cocktail déjà noté. On réessaie quelques fois.
        if (attempt < 5) return loadRandom(attempt + 1)
        setCocktail(null)
        setError('Plus de nouveaux cocktails disponibles pour le moment.')
        return
      }

      setCocktail(data)
    } catch (e: any) {
      setCocktail(null)
      setError(e?.message || 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRandom()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAction = async (action: 'like' | 'dislike') => {
    if (!cocktail) return

    setActionLoading(action)
    setError('')
    setAuthError('')

    try {
      const res = await fetch('/api/cocktails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cocktailId: cocktail.idDrink,
          action,
          source: 'tinder',
        }),
      })

      if (res.status === 401) {
        setAuthError('Session expirée, reconnecte-toi.')
        return
      }

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.detail || 'Impossible d’enregistrer')
      }

      setRatedIds((prev) => [...prev, cocktail.idDrink])
      loadRandom()
    } catch (e: any) {
      setError(e?.message || 'Erreur lors de l’action')
    } finally {
      setActionLoading('')
    }
  }

  const ingredients = extractIngredients(cocktail)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-indigo-300">Mix & Match</p>
            <h1 className="text-3xl font-bold">Découvre des cocktails</h1>
            <p className="text-slate-300">
              Like/Dislike pour créer ta liste. On évite de te reproposer ceux déjà notés.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-sm">
            <a
              href="/dashboard"
              className="text-indigo-200 hover:text-white underline underline-offset-4"
            >
              Retour au dashboard
            </a>
            <a
              href="/history"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition"
            >
              Voir l’historique
            </a>
          </div>
        </header>

        {authError && (
          <div className="bg-red-900/40 border border-red-600 text-red-100 px-4 py-3 rounded-xl">
            {authError} <a href="/" className="underline">Se connecter</a>
          </div>
        )}

        {error && !authError && (
          <div className="bg-yellow-900/40 border border-yellow-600 text-yellow-100 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-10 text-center text-slate-200">Chargement...</div>
          ) : cocktail ? (
            <div className="grid md:grid-cols-2 gap-0">
              {cocktail.strDrinkThumb ? (
                <div className="relative h-full">
                  <img
                    src={cocktail.strDrinkThumb}
                    alt={cocktail.strDrink}
                    className="object-cover w-full h-full min-h-[320px]"
                  />
                </div>
              ) : null}
              <div className="p-8 space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-200 rounded-full text-xs">
                    {cocktail.strCategory || 'Catégorie ?'}
                  </span>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-200 rounded-full text-xs">
                    {cocktail.strAlcoholic || 'Type ?'}
                  </span>
                  {cocktail.strGlass && (
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-100 rounded-full text-xs">
                      {cocktail.strGlass}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-white">{cocktail.strDrink}</h2>
                {cocktail.strInstructions && (
                  <p className="text-slate-200 leading-relaxed">
                    {cocktail.strInstructions}
                  </p>
                )}

                {ingredients.length > 0 && (
                  <div>
                    <h3 className="text-sm uppercase tracking-wide text-slate-300 mb-2">
                      Ingrédients
                    </h3>
                    <ul className="space-y-1 text-sm text-slate-100">
                      {ingredients.map((ing, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-300"></span>
                          <span>{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => handleAction('dislike')}
                    disabled={!!actionLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-3 font-semibold transition disabled:opacity-60"
                  >
                    {actionLoading === 'dislike' ? 'On passe...' : 'Je dislike'}
                  </button>
                  <button
                    onClick={() => handleAction('like')}
                    disabled={!!actionLoading}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-4 py-3 font-semibold transition disabled:opacity-60"
                  >
                    {actionLoading === 'like' ? 'On ajoute...' : 'Je like'}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Déjà notés : {ratedIds.length}</span>
                  <button
                    onClick={() => {
                      setRatedIds([])
                      loadRandom()
                    }}
                    className="underline hover:text-slate-200"
                  >
                    Réinitialiser la sélection
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-slate-200">
              Aucun cocktail à afficher pour le moment.
              <div className="mt-3">
                <button
                  onClick={() => loadRandom()}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg px-4 py-2"
                >
                  Recharger
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
