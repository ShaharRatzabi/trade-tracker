// ─── Helpers ─────────────────────────────────────────────────────────────────

function usd(n) {
  return '$' + Number(n).toFixed(2)
}
function signedUsd(n) {
  return (n >= 0 ? '+$' : '-$') + Math.abs(n).toFixed(2)
}
function signedPct(n) {
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%'
}

function tvUrl(symbol) {
  return `https://www.tradingview.com/chart/?symbol=NASDAQ:${encodeURIComponent(symbol)}`
}

function riskOf(t) {
  return (t.entry_price - t.stop_loss) * t.quantity
}
function riskPctOf(t) {
  return ((t.entry_price - t.stop_loss) / t.entry_price) * 100
}
function pnlOf(t) {
  if (!t.exit_price) return null
  return (t.exit_price - t.entry_price) * t.quantity
}
function pnlPctOf(t) {
  if (!t.exit_price) return null
  return ((t.exit_price - t.entry_price) / t.entry_price) * 100
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TvLink({ symbol }) {
  return (
    <a
      href={tvUrl(symbol)}
      target="_blank"
      rel="noopener noreferrer"
      title={`Open ${symbol} on TradingView`}
      className="group inline-flex items-center gap-1.5 font-bold
                 text-gray-900 dark:text-white
                 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
    >
      {symbol}
      <svg className="w-3 h-3 text-gray-300 dark:text-slate-600
                      group-hover:text-indigo-400 transition-colors shrink-0"
        fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  )
}

function ActionButtons({ onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-center gap-1">
      <button onClick={onEdit} title="Edit"
        className="p-1.5 rounded text-indigo-500 dark:text-indigo-400
                   hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
               m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button onClick={onDelete} title="Delete"
        className="p-1.5 rounded text-red-400 dark:text-red-500
                   hover:bg-red-50 dark:hover:bg-slate-700 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7
               m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  )
}

// ─── Mobile card ──────────────────────────────────────────────────────────────

function TradeCard({ trade, onEdit, onDelete }) {
  const isClosed = !!trade.exit_price
  const risk     = riskOf(trade)
  const riskPct  = riskPctOf(trade)
  const pnl      = pnlOf(trade)
  const pnlPct   = pnlPctOf(trade)

  const cardBg = isClosed && pnl !== null
    ? pnl >= 0
      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
      : 'bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
    : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800'

  const pnlClass = pnl !== null && pnl >= 0
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-red-600 dark:text-red-400'

  return (
    <div className={`border rounded-xl p-4 space-y-3 ${cardBg}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <TvLink symbol={trade.symbol} />
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{trade.date}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
            isClosed
              ? 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'
              : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
          }`}>
            {isClosed ? 'Closed' : 'Open'}
          </span>
          <ActionButtons onEdit={() => onEdit(trade)} onDelete={() => onDelete(trade.id)} />
        </div>
      </div>

      {/* Price grid */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-gray-400 dark:text-slate-600 uppercase tracking-wide text-[10px]">Entry</p>
          <p className="font-medium tabular-nums text-gray-700 dark:text-slate-300">{usd(trade.entry_price)}</p>
        </div>
        <div>
          <p className="text-gray-400 dark:text-slate-600 uppercase tracking-wide text-[10px]">Stop</p>
          <p className="font-medium tabular-nums text-gray-500 dark:text-slate-500">{usd(trade.stop_loss)}</p>
        </div>
        <div>
          <p className="text-gray-400 dark:text-slate-600 uppercase tracking-wide text-[10px]">Exit</p>
          <p className="font-medium tabular-nums text-gray-700 dark:text-slate-300">
            {isClosed ? usd(trade.exit_price) : <span className="text-gray-300 dark:text-slate-700">—</span>}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-50 dark:bg-slate-800/60 rounded-lg px-3 py-2">
          <p className="text-gray-400 dark:text-slate-600 uppercase tracking-wide text-[10px]">Entry Value</p>
          <p className="font-semibold tabular-nums text-gray-700 dark:text-slate-300">
            {(trade.entry_price * trade.quantity).toLocaleString('en-US', {
              style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-2">
          <p className="text-amber-500 dark:text-amber-600 uppercase tracking-wide text-[10px]">Risk</p>
          <p className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">
            {usd(risk)}
            <span className="font-normal opacity-70 ml-1">{riskPct.toFixed(1)}%</span>
          </p>
        </div>
      </div>

      {/* P&L (closed only) */}
      {isClosed && pnl !== null && (
        <div className={`rounded-lg px-3 py-2 text-xs ${
          pnl >= 0
            ? 'bg-emerald-50 dark:bg-emerald-950/40'
            : 'bg-red-50 dark:bg-red-950/40'
        }`}>
          <p className={`uppercase tracking-wide text-[10px] ${pnlClass}`}>P&amp;L</p>
          <p className={`font-bold tabular-nums ${pnlClass}`}>
            {signedUsd(pnl)}
            {pnlPct !== null && (
              <span className="font-normal opacity-80 ml-1">{signedPct(pnlPct)}</span>
            )}
          </p>
        </div>
      )}

      {/* Notes */}
      {trade.notes && (
        <p className="text-xs text-gray-400 dark:text-slate-500 truncate" title={trade.notes}>
          {trade.notes}
        </p>
      )}
    </div>
  )
}

// ─── Section header row ───────────────────────────────────────────────────────

function SectionRow({ label, count, colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan}
        className="px-4 py-2 bg-gray-50 dark:bg-slate-800/60
                   border-y border-gray-200 dark:border-slate-700
                   text-[11px] font-semibold uppercase tracking-widest
                   text-gray-500 dark:text-slate-400">
        {label}
        <span className="ml-2 font-normal text-gray-400 dark:text-slate-600">({count})</span>
      </td>
    </tr>
  )
}

// ─── Desktop trade row ────────────────────────────────────────────────────────

function TradeRow({ trade, onEdit, onDelete }) {
  const isClosed = !!trade.exit_price
  const risk     = riskOf(trade)
  const riskPct  = riskPctOf(trade)
  const pnl      = pnlOf(trade)
  const pnlPct   = pnlPctOf(trade)

  const rowBg = isClosed && pnl !== null
    ? pnl >= 0
      ? 'bg-emerald-50/40 dark:bg-emerald-950/10'
      : 'bg-red-50/40 dark:bg-red-950/10'
    : ''

  const pnlClass = pnl !== null && pnl >= 0
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-red-600 dark:text-red-400'

  return (
    <tr className={`hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors ${rowBg}`}>

      <td className="px-4 py-3 text-gray-500 dark:text-slate-400 text-xs whitespace-nowrap">
        {trade.date}
      </td>

      <td className="px-4 py-3">
        <TvLink symbol={trade.symbol} />
      </td>

      <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-slate-300">
        {usd(trade.entry_price)}
      </td>

      <td className="px-4 py-3 text-right tabular-nums text-gray-500 dark:text-slate-500">
        {usd(trade.stop_loss)}
      </td>

      {/* Exit — only shown for closed trades */}
      <td className="px-4 py-3 text-right tabular-nums">
        {isClosed
          ? <span className="text-gray-700 dark:text-slate-300">{usd(trade.exit_price)}</span>
          : <span className="text-gray-300 dark:text-slate-700">—</span>
        }
      </td>

      <td className="px-4 py-3 text-right tabular-nums text-gray-600 dark:text-slate-400">
        {Number(trade.quantity).toLocaleString('en-US', { maximumFractionDigits: 4 })}
      </td>

      <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-slate-300">
        {(trade.entry_price * trade.quantity).toLocaleString('en-US', {
          style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2,
        })}
      </td>

      {/* Risk — shown for all trades */}
      <td className="px-4 py-3 text-right tabular-nums font-medium text-amber-600 dark:text-amber-400">
        {usd(risk)}
      </td>
      <td className="px-4 py-3 text-right tabular-nums font-medium text-amber-600 dark:text-amber-400">
        {riskPct.toFixed(2)}%
      </td>

      {/* P&L — only for closed trades */}
      <td className="px-4 py-3 text-right">
        {isClosed && pnl !== null ? (
          <div className={`${pnlClass} font-semibold tabular-nums`}>
            <div>{signedUsd(pnl)}</div>
            {pnlPct !== null && (
              <div className="text-xs opacity-80">{signedPct(pnlPct)}</div>
            )}
          </div>
        ) : (
          <span className="text-gray-300 dark:text-slate-700">—</span>
        )}
      </td>

      <td className="px-4 py-3 max-w-[160px]">
        <span className="block truncate text-xs text-gray-400 dark:text-slate-500"
          title={trade.notes || ''}>
          {trade.notes || <span className="text-gray-300 dark:text-slate-700">—</span>}
        </span>
      </td>

      <td className="px-4 py-3">
        <ActionButtons onEdit={() => onEdit(trade)} onDelete={() => onDelete(trade.id)} />
      </td>
    </tr>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const COL_COUNT = 12

export default function TradeTable({ trades, loading, onEdit, onDelete }) {
  const thCls = 'text-gray-500 dark:text-slate-500 text-[11px] uppercase tracking-wider font-medium px-4 py-3'

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800
                      rounded-xl p-16 text-center text-gray-400 dark:text-slate-500">
        Loading…
      </div>
    )
  }

  if (trades.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800
                      rounded-xl p-16 text-center">
        <p className="text-gray-500 dark:text-slate-400 text-base mb-1">No trades yet</p>
        <p className="text-gray-400 dark:text-slate-600 text-sm">
          Click &ldquo;Add Trade&rdquo; to record your first position
        </p>
      </div>
    )
  }

  const open   = trades.filter(t => !t.exit_price)
  const closed = trades.filter(t =>  t.exit_price)

  return (
    <>
      {/* ── Mobile card list (hidden on sm+) ── */}
      <div className="sm:hidden space-y-3">
        {open.length > 0 && (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-slate-400 px-1">
              Open <span className="font-normal text-gray-400 dark:text-slate-600">({open.length})</span>
            </p>
            {open.map(t => (
              <TradeCard key={t.id} trade={t} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </>
        )}
        {closed.length > 0 && (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-slate-400 px-1 mt-4">
              Closed <span className="font-normal text-gray-400 dark:text-slate-600">({closed.length})</span>
            </p>
            {closed.map(t => (
              <TradeCard key={t.id} trade={t} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </>
        )}
        <p className="text-[11px] text-gray-400 dark:text-slate-600 px-1 pb-1">
          {trades.length} trade{trades.length !== 1 ? 's' : ''} · Symbols open TradingView ↗
        </p>
      </div>

      {/* ── Desktop table (hidden on mobile) ── */}
      <div className="hidden sm:block bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800">
                <th className={`${thCls} text-left`}>Date</th>
                <th className={`${thCls} text-left`}>Symbol</th>
                <th className={`${thCls} text-right`}>Entry</th>
                <th className={`${thCls} text-right`}>Stop</th>
                <th className={`${thCls} text-right`}>Exit</th>
                <th className={`${thCls} text-right`}>Qty</th>
                <th className={`${thCls} text-right`}>Entry Value</th>
                <th className={`${thCls} text-right`}>Risk $</th>
                <th className={`${thCls} text-right`}>Risk %</th>
                <th className={`${thCls} text-right`}>P&amp;L</th>
                <th className={`${thCls} text-left`}>Notes</th>
                <th className={`${thCls} text-center`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">

              {/* ── Open trades ── */}
              {open.length > 0 && (
                <>
                  <SectionRow label="Open" count={open.length} colSpan={COL_COUNT} />
                  {open.map(t => (
                    <TradeRow key={t.id} trade={t} onEdit={onEdit} onDelete={onDelete} />
                  ))}
                </>
              )}

              {/* ── Closed trades ── */}
              {closed.length > 0 && (
                <>
                  <SectionRow label="Closed" count={closed.length} colSpan={COL_COUNT} />
                  {closed.map(t => (
                    <TradeRow key={t.id} trade={t} onEdit={onEdit} onDelete={onDelete} />
                  ))}
                </>
              )}

            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 dark:border-slate-800 px-4 py-2.5
                        text-[11px] text-gray-400 dark:text-slate-600 flex items-center justify-between">
          <span>{trades.length} trade{trades.length !== 1 ? 's' : ''}</span>
          <span>Symbols open TradingView ↗</span>
        </div>
      </div>
    </>
  )
}
