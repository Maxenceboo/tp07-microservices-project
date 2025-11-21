'use client'

import { useEffect, useMemo, useState } from 'react'

type HistoryRecord = {
  id: number
  cocktailId: string
  action: 'like' | 'dislike'
  source: 'tinder' | 'search'
  createdAt: string
}

type CocktailDetails = {
  idDrink: string
  strDrink: string
  strCategory?: string
  strDrinkThumb?: string
  strAlcoholic?: string
  strGlass?: string
  strInstructions?: string
}

const fetchCocktailDetails = async (id: string): Promise<CocktailDetails | null> => {
  const res = await fetch(
    `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`
  )
  const json = await res.json().catch(() => null)
  return json?.drinks?.[0] || null
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [details, setDetails] = useState<Record<string, CocktailDetails>>({})
  const [openId, setOpenId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [authError, setAuthError] = useState('')
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({})
  const [categories, setCategories] = useState<string[]>([])
  const [glasses, setGlasses] = useState<string[]>([])
  const [alcoholicOpts, setAlcoholic] = useState<string[]>([])
  const [actionFilter, setActionFilter] = useState<'all' | 'like' | 'dislike'>(
    'all'
  )
  const [sourceFilter, setSourceFilter] = useState<'all' | 'tinder' | 'search'>(
    'all'
  )
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [glassFilter, setGlassFilter] = useState<string>('all')
  const [alcoholicFilter, setAlcoholicFilter] = useState<string>('all')

  const sortedHistory = useMemo(
    () =>
      [...history].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [history]
  )

  useEffect(() => {
    // Charge la liste des catégories (mêmes options que la page recherche)
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/cocktails/categories', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json().catch(() => ({}))
        if (Array.isArray(data?.categories)) setCategories(data.categories)
        if (Array.isArray(data?.glasses)) setGlasses(data.glasses)
        if (Array.isArray(data?.alcoholic)) setAlcoholic(data.alcoholic)
      } catch {
        /* ignore */
      }
    }
    const loadHistory = async () => {
      setLoading(true)
      setError('')
      setAuthError('')

      try {
        const params = new URLSearchParams()
        if (actionFilter !== 'all') params.set('filter', actionFilter)
        if (sourceFilter !== 'all') params.set('source', sourceFilter)

        const qs = params.toString()
        const res = await fetch(
          qs ? `/api/cocktails/history?${qs}` : '/api/cocktails/history',
          { cache: 'no-store' }
        )

        if (res.status === 401) {
          setAuthError('Connecte-toi pour voir ton historique de cocktails.')
          setHistory([])
          return
        }

        const data = await res.json()
        if (!Array.isArray(data)) {
          throw new Error('Réponse inattendue du service cocktail')
        }

        setHistory(data)
        // Précharge une première fois les détails pour afficher nom/image
        prefetchDetails(data)
      } catch (e: any) {
        setError(e?.message || 'Impossible de charger l’historique')
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
    loadHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionFilter, sourceFilter])

  const prefetchDetails = async (items: HistoryRecord[]) => {
    const idsToFetch = Array.from(
      new Set(items.map((i) => i.cocktailId).filter((id) => id && !details[id]))
    )
    if (idsToFetch.length === 0) return

    // Marque en cours pour éviter les doubles requêtes
    setLoadingDetails((prev) => {
      const next = { ...prev }
      idsToFetch.forEach((id) => (next[id] = true))
      return next
    })

    const results = await Promise.allSettled(idsToFetch.map((id) => fetchCocktailDetails(id)))

    setDetails((prev) => {
      const next = { ...prev }
      results.forEach((res, idx) => {
        const id = idsToFetch[idx]
        if (res.status === 'fulfilled' && res.value) {
          next[id] = res.value
        }
      })
      return next
    })

    setLoadingDetails((prev) => {
      const next = { ...prev }
      idsToFetch.forEach((id) => delete next[id])
      return next
    })
  }

  const toggleOpen = async (item: HistoryRecord) => {
    const nextOpen = openId === item.id ? null : item.id
    setOpenId(nextOpen)
    if (!details[item.cocktailId]) {
      await prefetchDetails([item])
    }
  }

  const formatDate = (value: string) =>
    new Date(value).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const categoryOptions = useMemo(
    () => (categories.length ? categories : []),
    [categories]
  )

  const filteredHistory = useMemo(
    () =>
      sortedHistory.filter((item) => {
        if (categoryFilter !== 'all') {
          const cat = details[item.cocktailId]?.strCategory
          if (cat && cat !== categoryFilter) return false
        }
        if (glassFilter !== 'all') {
          const g = details[item.cocktailId]?.strGlass
          if (g && g !== glassFilter) return false
        }
        if (alcoholicFilter !== 'all') {
          const a = details[item.cocktailId]?.strAlcoholic
          if (a && a !== alcoholicFilter) return false
        }
        return true
      }),
    [sortedHistory, categoryFilter, glassFilter, alcoholicFilter, details]
  )

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white px-6 py-12">
        <div className="max-w-4xl mx-auto text-center text-slate-200">
          Chargement de l’historique...
        </div>
      </main>
    )
  }

  if (authError) {
    return (
      <main className="min-h-screen bg-slate-950 text-white px-6 py-12">
        <div className="max-w-md mx-auto bg-red-900/30 border border-red-700 rounded-2xl p-6 text-center">
          <p className="mb-3">{authError}</p>
          <a href="/" className="underline text-red-200">
            Se connecter
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-6">
        <nav className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center justify-between text-sm text-slate-200">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="hover:text-white">
              Dashboard
            </a>
            <a href="/mix" className="hover:text-white">
              Mix
            </a>
            <a href="/search" className="hover:text-white">
              Recherche
            </a>
            <span className="text-white font-semibold">Historique</span>
          </div>
          <a href="/" className="text-xs underline text-indigo-200 hover:text-white">
            Déconnexion
          </a>
        </nav>
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">
              Historique
            </p>
            <h1 className="text-3xl font-bold">Tes dégustations</h1>
            <p className="text-slate-400">
              Un aperçu rapide. Clique pour voir plus de détails.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-sm">
            <a
              href="/mix"
              className="text-indigo-200 hover:text-white underline underline-offset-4"
            >
              Retour aux cocktails
            </a>
            <a
              href="/search"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600/80 border border-white/20 text-white hover:bg-indigo-500 transition"
            >
              Rechercher un cocktail
            </a>
          </div>
        </header>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <label className="flex flex-col gap-1 text-slate-200">
            <span className="text-xs uppercase tracking-wide text-slate-400">
              Action
            </span>
            <select
              value={actionFilter}
              onChange={(e) =>
                setActionFilter(e.target.value as 'all' | 'like' | 'dislike')
              }
              className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">Toutes</option>
              <option value="like">Like</option>
              <option value="dislike">Dislike</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-slate-200">
            <span className="text-xs uppercase tracking-wide text-slate-400">
              Source
            </span>
            <select
              value={sourceFilter}
              onChange={(e) =>
                setSourceFilter(e.target.value as 'all' | 'tinder' | 'search')
              }
              className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">Toutes</option>
              <option value="tinder">Tinder</option>
              <option value="search">Search</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-slate-200">
            <span className="text-xs uppercase tracking-wide text-slate-400">
              Catégorie
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">Toutes</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-slate-200">
            <span className="text-xs uppercase tracking-wide text-slate-400">
              Verre / Alcool
            </span>
            <select
              value={glassFilter}
              onChange={(e) => setGlassFilter(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">Tous les verres</option>
              {glasses.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <select
              value={alcoholicFilter}
              onChange={(e) => setAlcoholicFilter(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">Tous</option>
              {alcoholicOpts.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 text-yellow-100">
            {error}
          </div>
        )}

        {filteredHistory.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-slate-300">
            Aucun historique pour l’instant. Va liker ou disliker quelques cocktails !
          </div>
        ) : (
          <ul className="space-y-3">
            {filteredHistory.map((item) => {
              const detail = details[item.cocktailId]
              const isOpen = openId === item.id
              const busy = loadingDetails[item.cocktailId]

              return (
                <li
                  key={item.id}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl"
                >
                  <button
                    onClick={() => toggleOpen(item)}
                    className="w-full text-left px-4 py-4 flex items-center gap-4 hover:bg-white/5 transition"
                  >
                    <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 border border-white/10">
                      {detail?.strDrinkThumb ? (
                        <img
                          src={detail.strDrinkThumb}
                          alt={detail.strDrink}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-500 text-xs">
                          {busy ? '...' : 'Image'}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-white truncate">
                          {detail?.strDrink || `Cocktail ${item.cocktailId}`}
                        </p>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            item.action === 'like'
                              ? 'bg-emerald-600/30 text-emerald-200'
                              : 'bg-rose-600/30 text-rose-100'
                          }`}
                        >
                          {item.action === 'like' ? 'Like' : 'Dislike'}
                        </span>
                        <span className="text-[10px] uppercase tracking-wide text-slate-400">
                          {item.source}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                        <span className="px-2 py-1 bg-slate-800/80 rounded-full border border-white/5">
                          {detail?.strCategory || 'Catégorie ?'}
                        </span>
                        {detail?.strAlcoholic && (
                          <span className="px-2 py-1 bg-slate-800/80 rounded-full border border-white/5">
                            {detail.strAlcoholic}
                          </span>
                        )}
                        {detail?.strGlass && (
                          <span className="px-2 py-1 bg-slate-800/80 rounded-full border border-white/5">
                            {detail.strGlass}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 text-right">
                      <div>{formatDate(item.createdAt)}</div>
                      <div className="mt-1">{isOpen ? '▲' : '▼'}</div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 text-sm text-slate-200 space-y-3">
                      <div className="flex flex-wrap gap-3">
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
                          ID: {item.cocktailId}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
                          Source: {item.source}
                        </span>
                      </div>
                      {detail?.strInstructions ? (
                        <p className="leading-relaxed text-slate-300">
                          {detail.strInstructions}
                        </p>
                      ) : (
                        <p className="text-slate-400">
                          {busy
                            ? 'Chargement des détails...'
                            : 'Pas encore de description pour ce cocktail.'}
                        </p>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </main>
  )
}
