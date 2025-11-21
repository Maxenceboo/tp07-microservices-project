'use client'

import { useEffect, useMemo, useState } from 'react'

type Cocktail = {
  idDrink: string
  strDrink: string
  strDrinkThumb?: string
  strCategory?: string
}

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function SearchPage() {
  const [categories, setCategories] = useState<string[]>([])
  const [glasses, setGlasses] = useState<string[]>([])
  const [alcoholicOpts, setAlcoholic] = useState<string[]>([])

  const [results, setResults] = useState<Cocktail[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [categoryValue, setCategoryValue] = useState('all')
  const [glassValue, setGlassValue] = useState('all')
  const [alcoholicValue, setAlcoholicValue] = useState('all')
  const [activeLetter, setActiveLetter] = useState<string | null>(null)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/cocktails/categories', { cache: 'no-store' })
        if (!res.ok) throw new Error('load categories failed')
        const data = await res.json()
        if (data?.categories) setCategories(data.categories)
        if (data?.glasses) setGlasses(data.glasses)
        if (data?.alcoholic) setAlcoholic(data.alcoholic)
      } catch {
        // on ignore silencieusement pour ne pas bloquer la page
      }
    }
    loadCategories()
  }, [])

  const runSearch = async (
    type: 'name' | 'category' | 'letter' | 'glass' | 'alcoholic',
    value: string
  ) => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ type, value })
      const res = await fetch(`/api/cocktails/search?${params.toString()}`, {
        cache: 'no-store',
      })
      const data = await res.json().catch(() => [])

      if (!res.ok) {
        throw new Error(data?.detail || 'Recherche impossible')
      }

      setResults(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setError(e?.message || 'Erreur de recherche')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const onSubmitName = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      setActiveLetter(null)
      setCategoryValue('all')
      runSearch('name', searchValue.trim())
    }
  }

  const onSelectCategory = (value: string) => {
    setCategoryValue(value)
    setActiveLetter(null)
    setGlassValue('all')
    setAlcoholicValue('all')
    if (value !== 'all') {
      runSearch('category', value)
    } else {
      setResults([])
    }
  }

  const onSelectLetter = (letter: string) => {
    setActiveLetter(letter)
    setCategoryValue('all')
    setGlassValue('all')
    setAlcoholicValue('all')
    setSearchValue('')
    runSearch('letter', letter)
  }

  const onSelectGlass = (value: string) => {
    setGlassValue(value)
    setCategoryValue('all')
    setAlcoholicValue('all')
    setActiveLetter(null)
    setSearchValue('')
    if (value !== 'all') runSearch('glass', value)
    else setResults([])
  }

  const onSelectAlcoholic = (value: string) => {
    setAlcoholicValue(value)
    setCategoryValue('all')
    setGlassValue('all')
    setActiveLetter(null)
    setSearchValue('')
    if (value !== 'all') runSearch('alcoholic', value)
    else setResults([])
  }

  const summary = useMemo(() => {
    if (loading) return 'Recherche en cours...'
    if (results.length === 0) return 'Aucun résultat pour le moment.'
    return `${results.length} résultat(s)`
  }, [loading, results])

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">
              Recherche
            </p>
            <h1 className="text-3xl font-bold">Trouve ton cocktail</h1>
            <p className="text-slate-400">
              Par nom, par catégorie, par verre, par alcool ou par première lettre.
            </p>
          </div>
          <div className="flex gap-3 text-sm">
            <a href="/mix" className="underline text-indigo-200 hover:text-white">
              Retour au mix
            </a>
            <a
              href="/history"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition"
            >
              Historique
            </a>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-4">
          <form
            onSubmit={onSubmitName}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2"
          >
            <p className="text-sm text-slate-200">Par nom</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Margarita..."
                className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Go
              </button>
            </div>
          </form>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
            <p className="text-sm text-slate-200">Par catégorie / verre / alcool</p>
            <div className="space-y-2">
              <select
                value={categoryValue}
                onChange={(e) => onSelectCategory(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">Choisir une catégorie...</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <select
                value={glassValue}
                onChange={(e) => onSelectGlass(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">Choisir un verre...</option>
                {glasses.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <select
                value={alcoholicValue}
                onChange={(e) => onSelectAlcoholic(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">Alcoolisé / non...</option>
                {alcoholicOpts.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
            <p className="text-sm text-slate-200">Par alphabet</p>
            <div className="grid grid-cols-9 gap-1 text-xs">
              {letters.map((letter) => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => onSelectLetter(letter)}
                  className={`px-2 py-1 rounded-md border border-white/10 ${
                    activeLetter === letter
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-300">
          <span>{summary}</span>
          {error && <span className="text-red-400">{error}</span>}
        </div>

        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-4">
          {results.map((c) => (
            <div
              key={c.idDrink}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-lg flex flex-col"
            >
              {c.strDrinkThumb ? (
                <img
                  src={c.strDrinkThumb}
                  alt={c.strDrink}
                  className="w-full h-36 object-cover"
                />
              ) : (
                <div className="w-full h-36 bg-slate-800 flex items-center justify-center text-slate-500 text-sm">
                  Pas d’image
                </div>
              )}
              <div className="p-4 space-y-2">
                <p className="font-semibold text-white">{c.strDrink}</p>
                <p className="text-xs text-slate-400">
                  {c.strCategory || 'Catégorie inconnue'}
                </p>
                <a
                  href={`/mix?prefill=${c.idDrink}`}
                  className="inline-block text-sm text-indigo-200 hover:text-white underline underline-offset-4"
                >
                  Voir dans Mix
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
