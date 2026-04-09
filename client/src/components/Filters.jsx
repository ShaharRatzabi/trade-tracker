export default function Filters({ filters, onChange }) {
  const set   = (field) => (e) => onChange((prev) => ({ ...prev, [field]: e.target.value }))
  const clear = () => onChange({ symbol: '', startDate: '', endDate: '' })
  const dirty = filters.symbol || filters.startDate || filters.endDate

  const inputCls =
    'w-full bg-white dark:bg-slate-800 ' +
    'border border-gray-300 dark:border-slate-700 ' +
    'text-gray-900 dark:text-slate-100 ' +
    'placeholder-gray-400 dark:placeholder-slate-500 ' +
    'rounded-lg px-3 py-2 text-sm ' +
    'focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 ' +
    'transition-colors'

  const labelCls = 'block text-gray-500 dark:text-slate-500 text-[11px] uppercase tracking-wider font-medium mb-1.5'

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-5 py-4">
      <div className="flex flex-wrap gap-3 items-end">

        <div className="flex-1 min-w-[130px]">
          <label className={labelCls}>Symbol</label>
          <input
            type="text" placeholder="e.g. AAPL"
            value={filters.symbol} onChange={set('symbol')}
            className={inputCls}
          />
        </div>

        <div className="flex-1 min-w-[140px]">
          <label className={labelCls}>From</label>
          <input
            type="date"
            value={filters.startDate} onChange={set('startDate')}
            className={inputCls}
          />
        </div>

        <div className="flex-1 min-w-[140px]">
          <label className={labelCls}>To</label>
          <input
            type="date"
            value={filters.endDate} onChange={set('endDate')}
            className={inputCls}
          />
        </div>

        {dirty && (
          <button
            onClick={clear}
            className="text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200
                       text-sm px-4 py-2
                       border border-gray-200 dark:border-slate-700
                       rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800
                       transition-colors whitespace-nowrap"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
