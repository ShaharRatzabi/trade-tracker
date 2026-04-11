import { useState, useEffect } from 'react'

const today = new Date().toISOString().split('T')[0]

const EMPTY = {
  symbol:       '',
  entryMethod:  'shares',  // 'shares' | 'position'
  quantity:     '',
  positionSize: '',
  entry_price:  '',
  stop_loss:    '',
  exit_price:   '',
  date:         today,
  notes:        '',
}

const labelCls =
  'block text-gray-500 dark:text-slate-500 text-[11px] uppercase tracking-wider font-medium mb-1.5'

const inputCls =
  'w-full bg-white dark:bg-slate-800 ' +
  'border border-gray-300 dark:border-slate-700 ' +
  'text-gray-900 dark:text-white ' +
  'placeholder-gray-400 dark:placeholder-slate-600 ' +
  'rounded-lg px-3 py-2 text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 ' +
  'transition-colors'

const readOnlyCls =
  'w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 ' +
  'text-gray-500 dark:text-slate-400 rounded-lg px-3 py-2 text-sm cursor-not-allowed'

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className={labelCls}>
        {label}
        {required && <span className="text-indigo-500 ml-0.5">*</span>}
        {hint && <span className="normal-case text-gray-400 dark:text-slate-600 ml-1">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

export default function TradeForm({ trade, onSave, onClose }) {
  const [form, setForm]     = useState(EMPTY)
  const [error, setError]   = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (trade) {
      setForm({
        symbol:       trade.symbol       ?? '',
        entryMethod:  'shares',
        quantity:     trade.quantity     ?? '',
        positionSize: trade.entry_price && trade.quantity
          ? (trade.entry_price * trade.quantity).toFixed(2)
          : '',
        entry_price:  trade.entry_price  ?? '',
        stop_loss:    trade.stop_loss    ?? '',
        exit_price:   trade.exit_price   ?? '',
        date:         trade.date         ?? today,
        notes:        trade.notes        ?? '',
      })
    }
  }, [trade])

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  // Compute quantity from position size
  const computedQty = (() => {
    if (form.entryMethod !== 'position') return null
    const pos   = Number(form.positionSize)
    const entry = Number(form.entry_price)
    return pos > 0 && entry > 0 ? (pos / entry).toFixed(4) : null
  })()

  const effectiveQty = form.entryMethod === 'position'
    ? (computedQty ? Number(computedQty) : 0)
    : Number(form.quantity)

  // Live risk preview
  const riskPreview = (() => {
    const entry = Number(form.entry_price)
    const stop  = Number(form.stop_loss)
    if (entry > 0 && stop > 0 && stop < entry && effectiveQty > 0) {
      return {
        riskAmt: (entry - stop) * effectiveQty,
        riskPct: ((entry - stop) / entry) * 100,
      }
    }
    return null
  })()

  // P&L preview (only if exit price entered)
  const pnlPreview = (() => {
    const entry = Number(form.entry_price)
    const exit  = Number(form.exit_price)
    if (entry > 0 && exit > 0 && effectiveQty > 0) {
      const pnl    = (exit - entry) * effectiveQty
      const pnlPct = ((exit - entry) / entry) * 100
      return { pnl, pnlPct }
    }
    return null
  })()

  const validate = () => {
    if (!form.symbol.trim())                                  return 'Symbol is required'
    if (!form.entry_price || Number(form.entry_price) <= 0)  return 'Entry price must be > 0'
    if (!form.stop_loss   || isNaN(Number(form.stop_loss))) return 'Stop loss is required'
    if (form.exit_price && Number(form.exit_price) <= 0)     return 'Exit price must be > 0'
    if (!form.date) return 'Date is required'
    if (form.entryMethod === 'shares') {
      if (!form.quantity || Number(form.quantity) <= 0) return 'Quantity must be > 0'
    } else {
      if (!form.positionSize || Number(form.positionSize) <= 0) return 'Position size must be > 0'
      if (!computedQty) return 'Enter entry price first to compute quantity'
    }
    return null
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setError('')
    const err = validate()
    if (err) return setError(err)
    setSaving(true)
    try {
      const qty = form.entryMethod === 'position' ? Number(computedQty) : Number(form.quantity)
      await onSave({
        symbol:      form.symbol.trim().toUpperCase(),
        quantity:    qty,
        entry_price: Number(form.entry_price),
        stop_loss:   Number(form.stop_loss),
        exit_price:  form.exit_price ? Number(form.exit_price) : null,
        date:        form.date,
        notes:       form.notes.trim() || null,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 dark:bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-slate-900
                      border border-gray-200 dark:border-slate-700
                      rounded-2xl w-full max-w-lg shadow-2xl max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4
                        border-b border-gray-100 dark:border-slate-800
                        sticky top-0 bg-white dark:bg-slate-900 z-10 rounded-t-2xl">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {trade ? 'Edit Trade' : 'New Trade'}
          </h2>
          <button onClick={onClose}
            className="text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-white p-1 rounded transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Symbol + Date */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Symbol" required>
              <input
                type="text" placeholder="AAPL" autoFocus
                value={form.symbol}
                onChange={e => setForm(f => ({ ...f, symbol: e.target.value.toUpperCase() }))}
                className={inputCls}
              />
            </Field>
            <Field label="Date" required>
              <input type="date" value={form.date} onChange={set('date')} className={inputCls} />
            </Field>
          </div>

          {/* Entry method toggle + size */}
          <div>
            <label className={labelCls}>Entry Size *</label>
            <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 mb-2 w-fit">
              {[['shares', 'Shares (qty)'], ['position', 'Position ($)']].map(([val, lbl]) => (
                <button
                  key={val} type="button"
                  onClick={() => setForm(f => ({ ...f, entryMethod: val }))}
                  className={`px-4 py-1.5 text-xs font-semibold transition-colors ${
                    form.entryMethod === val
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>

            {form.entryMethod === 'shares' ? (
              <input type="number" placeholder="100" min="0" step="any"
                value={form.quantity} onChange={set('quantity')} className={inputCls} />
            ) : (
              <div className="space-y-2">
                <input type="number" placeholder="10000.00" min="0" step="any"
                  value={form.positionSize} onChange={set('positionSize')} className={inputCls} />
                <div className={`${readOnlyCls} flex items-center gap-2`}>
                  <span className="text-gray-400 dark:text-slate-500 text-xs shrink-0">Qty:</span>
                  <span className="font-mono font-medium text-gray-700 dark:text-slate-300">
                    {computedQty ?? <span className="text-gray-400 dark:text-slate-600 font-normal">enter entry price first</span>}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Entry + Stop */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Entry Price" required>
              <input type="number" placeholder="0.00" min="0" step="any"
                value={form.entry_price} onChange={set('entry_price')} className={inputCls} />
            </Field>
            <Field label="Stop Loss" required>
              <input type="number" placeholder="0.00" step="any"
                value={form.stop_loss} onChange={set('stop_loss')} className={inputCls} />
            </Field>
          </div>

          {/* Exit Price (optional) */}
          <Field label="Exit Price" hint="(fill when trade is closed)">
            <input type="number" placeholder="0.00" min="0" step="any"
              value={form.exit_price} onChange={set('exit_price')} className={inputCls} />
          </Field>

          {/* Notes */}
          <Field label="Notes" hint="(optional)">
            <textarea placeholder="Setup, thesis, observations…"
              value={form.notes} onChange={set('notes')}
              rows={2} className={`${inputCls} resize-none`} />
          </Field>

          {/* Entry value (read-only computed) */}
          {effectiveQty > 0 && Number(form.entry_price) > 0 && (
            <div className="flex items-center justify-between
                            bg-gray-50 dark:bg-slate-800/60
                            border border-gray-200 dark:border-slate-700
                            rounded-lg px-4 py-2.5 text-sm">
              <span className="text-gray-500 dark:text-slate-400">Entry Value</span>
              <span className="font-semibold tabular-nums text-gray-800 dark:text-slate-200">
                {(Number(form.entry_price) * effectiveQty).toLocaleString('en-US', {
                  style: 'currency', currency: 'USD',
                  minimumFractionDigits: 2, maximumFractionDigits: 2,
                })}
              </span>
            </div>
          )}

          {/* Risk preview */}
          {riskPreview && (
            <div className="rounded-lg border border-amber-200 dark:border-amber-900/60
                            bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-amber-700 dark:text-amber-400">Risk if stopped out</span>
                <span className="font-bold tabular-nums text-amber-700 dark:text-amber-400">
                  ${riskPreview.riskAmt.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-amber-600/70 dark:text-amber-500/60">
                <span>Risk %</span>
                <span className="tabular-nums">{riskPreview.riskPct.toFixed(2)}%</span>
              </div>
            </div>
          )}

          {/* P&L preview (only when exit price is filled) */}
          {pnlPreview && (
            <div className={`rounded-lg border px-4 py-3 text-sm space-y-1 ${
              pnlPreview.pnl >= 0
                ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30'
                : 'border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30'
            }`}>
              <div className="flex justify-between">
                <span className={pnlPreview.pnl >= 0
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-red-700 dark:text-red-400'}>
                  Realized P&amp;L
                </span>
                <span className={`font-bold tabular-nums ${pnlPreview.pnl >= 0
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-red-700 dark:text-red-400'}`}>
                  {pnlPreview.pnl >= 0 ? '+' : '-'}${Math.abs(pnlPreview.pnl).toFixed(2)}
                </span>
              </div>
              <div className={`flex justify-between text-xs opacity-70 ${pnlPreview.pnl >= 0
                ? 'text-emerald-600 dark:text-emerald-500'
                : 'text-red-600 dark:text-red-500'}`}>
                <span>P&amp;L %</span>
                <span className="tabular-nums">
                  {pnlPreview.pnlPct >= 0 ? '+' : ''}{pnlPreview.pnlPct.toFixed(2)}%
                </span>
              </div>
            </div>
          )}

          {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700
                         text-gray-700 dark:text-slate-300 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                         text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
              {saving ? 'Saving…' : trade ? 'Update' : 'Add Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
