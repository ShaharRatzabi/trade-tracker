const express  = require('express');
const cors     = require('cors');
const supabase = require('./database');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── GET /api/trades ─────────────────────────────────────────────────────────

app.get('/api/trades', async (req, res) => {
  const { symbol, start_date, end_date } = req.query;

  let query = supabase
    .from('trades')
    .select('*')
    .order('date', { ascending: false })
    .order('id',   { ascending: false });

  if (symbol)     query = query.ilike('symbol', `%${symbol}%`);
  if (start_date) query = query.gte('date', start_date);
  if (end_date)   query = query.lte('date', end_date);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ─── POST /api/trades ────────────────────────────────────────────────────────

app.post('/api/trades', async (req, res) => {
  const { symbol, quantity, entry_price, stop_loss, exit_price, date, notes } = req.body;

  if (!symbol || !entry_price || !stop_loss || !quantity || !date) {
    return res.status(400).json({ error: 'symbol, entry_price, stop_loss, quantity, and date are required' });
  }
  if (exit_price && Number(exit_price) <= 0) {
    return res.status(400).json({ error: 'Exit price must be > 0' });
  }

  const { data, error } = await supabase
    .from('trades')
    .insert({
      symbol:      symbol.toUpperCase(),
      quantity:    Number(quantity),
      entry_price: Number(entry_price),
      stop_loss:   Number(stop_loss),
      exit_price:  exit_price ? Number(exit_price) : null,
      date,
      notes:       notes || null,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// ─── PUT /api/trades/:id ─────────────────────────────────────────────────────

app.put('/api/trades/:id', async (req, res) => {
  const id   = req.params.id;
  const body = req.body;

  const { data: prev, error: fetchErr } = await supabase
    .from('trades')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchErr || !prev) return res.status(404).json({ error: 'Trade not found' });

  const entry = body.entry_price != null ? Number(body.entry_price) : prev.entry_price;
  const stop  = body.stop_loss   != null ? Number(body.stop_loss)   : prev.stop_loss;
  const updates = {
    symbol:      body.symbol      != null ? body.symbol.toUpperCase()  : prev.symbol,
    quantity:    body.quantity    != null ? Number(body.quantity)       : prev.quantity,
    entry_price: entry,
    stop_loss:   stop,
    exit_price:  'exit_price' in body ? (body.exit_price ? Number(body.exit_price) : null) : prev.exit_price,
    date:        body.date        != null ? body.date                   : prev.date,
    notes:       'notes'       in body ? (body.notes || null)           : prev.notes,
  };

  const { data, error } = await supabase
    .from('trades')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ─── DELETE /api/trades/:id ──────────────────────────────────────────────────

app.delete('/api/trades/:id', async (req, res) => {
  const id = req.params.id;

  const { data, error } = await supabase
    .from('trades')
    .delete()
    .eq('id', id)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  if (!data || data.length === 0) return res.status(404).json({ error: 'Trade not found' });
  res.json({ success: true });
});

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  Trade Tracker API  →  http://localhost:${PORT}\n`);
});
