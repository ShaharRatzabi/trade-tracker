const express = require('express');
const cors    = require('cors');
const { load, save } = require('./database');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── Helpers ────────────────────────────────────────────────────────────────

function matchesFilters(trade, { symbol, start_date, end_date }) {
  if (symbol     && !trade.symbol.toUpperCase().includes(symbol.toUpperCase())) return false;
  if (start_date && trade.date < start_date) return false;
  if (end_date   && trade.date > end_date)   return false;
  return true;
}

// ─── GET /api/trades ─────────────────────────────────────────────────────────

app.get('/api/trades', (req, res) => {
  const db     = load();
  const result = db.trades
    .filter(t => matchesFilters(t, req.query))
    .sort((a, b) => (b.date + String(b.id)) > (a.date + String(a.id)) ? 1 : -1);
  res.json(result);
});

// ─── POST /api/trades ────────────────────────────────────────────────────────

app.post('/api/trades', (req, res) => {
  const { symbol, quantity, entry_price, stop_loss, exit_price, date, notes } = req.body;

  if (!symbol || !entry_price || !stop_loss || !quantity || !date) {
    return res.status(400).json({ error: 'symbol, entry_price, stop_loss, quantity, and date are required' });
  }
  if (Number(stop_loss) >= Number(entry_price)) {
    return res.status(400).json({ error: 'Stop loss must be below entry price' });
  }
  if (exit_price && Number(exit_price) <= 0) {
    return res.status(400).json({ error: 'Exit price must be > 0' });
  }

  const db    = load();
  const trade = {
    id:          db.nextId++,
    symbol:      symbol.toUpperCase(),
    quantity:    Number(quantity),
    entry_price: Number(entry_price),
    stop_loss:   Number(stop_loss),
    exit_price:  exit_price ? Number(exit_price) : null,
    date,
    notes:       notes || null,
    created_at:  new Date().toISOString(),
  };

  db.trades.push(trade);
  save(db);
  res.status(201).json(trade);
});

// ─── PUT /api/trades/:id ─────────────────────────────────────────────────────

app.put('/api/trades/:id', (req, res) => {
  const id  = Number(req.params.id);
  const db  = load();
  const idx = db.trades.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Trade not found' });

  const prev = db.trades[idx];
  const body = req.body;

  const entry = body.entry_price != null ? Number(body.entry_price) : prev.entry_price;
  const stop  = body.stop_loss   != null ? Number(body.stop_loss)   : prev.stop_loss;
  if (stop >= entry) {
    return res.status(400).json({ error: 'Stop loss must be below entry price' });
  }

  db.trades[idx] = {
    ...prev,
    symbol:      body.symbol      != null ? body.symbol.toUpperCase()  : prev.symbol,
    quantity:    body.quantity    != null ? Number(body.quantity)       : prev.quantity,
    entry_price: entry,
    stop_loss:   stop,
    exit_price:  'exit_price' in body ? (body.exit_price ? Number(body.exit_price) : null) : prev.exit_price,
    date:        body.date        != null ? body.date                   : prev.date,
    notes:       'notes'       in body ? (body.notes || null)           : prev.notes,
  };

  save(db);
  res.json(db.trades[idx]);
});

// ─── DELETE /api/trades/:id ──────────────────────────────────────────────────

app.delete('/api/trades/:id', (req, res) => {
  const id  = Number(req.params.id);
  const db  = load();
  const idx = db.trades.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Trade not found' });

  db.trades.splice(idx, 1);
  save(db);
  res.json({ success: true });
});

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  Trade Tracker API  →  http://localhost:${PORT}\n`);
});
