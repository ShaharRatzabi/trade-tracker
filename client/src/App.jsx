import { useState, useEffect, useCallback, useMemo } from 'react'
import api from './api'
import Stats from './components/Stats'
import Filters from './components/Filters'
import TradeTable from './components/TradeTable'
import TradeForm from './components/TradeForm'

export default function App() {
  const [trades, setTrades]             = useState([])
  const [filters, setFilters]           = useState({ symbol: '', startDate: '', endDate: '' })
  const [showForm, setShowForm]         = useState(false)
  const [editingTrade, setEditingTrade] = useState(null)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)
  const [dark, setDark]                 = useState(true)

  // Sync dark class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  // ── Fetch trades ──────────────────────────────────────────────────────────
  const fetchTrades = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.symbol)    params.symbol     = filters.symbol
      if (filters.startDate) params.start_date = filters.startDate
      if (filters.endDate)   params.end_date   = filters.endDate
      const res = await api.get('/api/trades', { params })
      setTrades(res.data)
      setError(null)
    } catch {
      setError('Could not reach backend — make sure the server is running (cd server && node server.js)')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchTrades() }, [fetchTrades])

  // ── Dashboard stats (closed P&L only, no live prices) ────────────────────
  const stats = useMemo(() => {
    const open   = trades.filter(t => !t.exit_price)
    const closed = trades.filter(t =>  t.exit_price)
    return {
      openTrades:    open.length,
      closedTrades:  closed.length,
      totalInvested: open.reduce((s, t) => s + t.entry_price * t.quantity, 0),
      totalRisk:     open.reduce((s, t) => s + (t.entry_price - t.stop_loss) * t.quantity, 0),
      closedPnL:     closed.reduce((s, t) => s + (t.exit_price - t.entry_price) * t.quantity, 0),
    }
  }, [trades])

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleSave = async (data) => {
    try {
      if (editingTrade) {
        await api.put(`/api/trades/${editingTrade.id}`, data)
      } else {
        await api.post('/api/trades', data)
      }
      setShowForm(false)
      setEditingTrade(null)
      fetchTrades()
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to save trade')
    }
  }

  const handleEdit   = (t) => { setEditingTrade(t); setShowForm(true) }
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this trade?')) return
    try {
      await api.delete(`/api/trades/${id}`)
      fetchTrades()
    } catch { setError('Failed to delete trade') }
  }
  const handleCloseForm = () => { setShowForm(false); setEditingTrade(null) }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-200">

      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight">Trade Tracker</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDark(d => !d)}
              title={dark ? 'Light mode' : 'Dark mode'}
              className="p-2 rounded-lg text-gray-500 dark:text-slate-400
                         hover:bg-gray-100 dark:hover:bg-slate-800
                         border border-gray-200 dark:border-slate-700 transition-colors"
            >
              {dark ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707
                       M6.343 17.657l-.707.707m12.728 0l-.707-.707
                       M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500
                         text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Trade
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-screen-xl mx-auto px-6 py-8 space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700
                          text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Stats stats={stats} />
        <Filters filters={filters} onChange={setFilters} />
        <TradeTable trades={trades} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
      </main>

      {showForm && (
        <TradeForm trade={editingTrade} onSave={handleSave} onClose={handleCloseForm} />
      )}
    </div>
  )
}
