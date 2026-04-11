function usd(n, signed = false) {
  const abs = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (!signed) return `$${abs}`
  return (n >= 0 ? '+$' : '-$') + abs
}

function StatCard({ label, value, sub, valueClass, icon }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800
                    rounded-xl p-5 flex flex-col gap-1.5 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-gray-500 dark:text-slate-500 text-[11px] uppercase tracking-widest font-medium truncate">
          {label}
        </p>
        {icon && <span className="text-gray-300 dark:text-slate-700 shrink-0">{icon}</span>}
      </div>
      <p className={`text-2xl font-bold tabular-nums truncate ${valueClass ?? 'text-gray-900 dark:text-white'}`}>
        {value}
      </p>
      {sub && <p className="text-gray-400 dark:text-slate-600 text-xs">{sub}</p>}
    </div>
  )
}

const BarChartIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)
const DollarIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)
const WarnIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
)
const TrendIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)
const FeeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

export default function Stats({ stats }) {
  const { openTrades, closedTrades, totalInvested, totalRisk, closedPnL, totalFees } = stats

  const pnlClass = closedPnL > 0
    ? 'text-emerald-600 dark:text-emerald-400'
    : closedPnL < 0
    ? 'text-red-600 dark:text-red-400'
    : 'text-gray-400 dark:text-slate-500'

  const riskClass = totalRisk > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-slate-500'

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
      <StatCard
        label="Open Positions"
        value={openTrades}
        sub={closedTrades > 0 ? `${closedTrades} closed` : 'no closed trades'}
        valueClass="text-indigo-600 dark:text-indigo-400"
        icon={<BarChartIcon />}
      />
      <StatCard
        label="Invested Capital"
        value={openTrades > 0 ? usd(totalInvested) : '—'}
        sub="open trades only"
        icon={<DollarIcon />}
      />
      <StatCard
        label="Total Risk"
        value={openTrades > 0 ? usd(totalRisk) : '—'}
        sub="if all stops are hit"
        valueClass={riskClass}
        icon={<WarnIcon />}
      />
      <StatCard
        label="Realized P&L"
        value={closedTrades > 0 ? usd(closedPnL, true) : '—'}
        sub="closed trades only"
        valueClass={pnlClass}
        icon={<TrendIcon />}
      />
      <StatCard
        label="Total Fees"
        value={usd(totalFees)}
        sub="$2 open · $4 closed"
        valueClass="text-gray-500 dark:text-slate-400"
        icon={<FeeIcon />}
      />
    </div>
  )
}
