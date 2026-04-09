require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { getCollection, ObjectId } = require('./database');

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

function toClient(doc) {
  const { _id, ...rest } = doc;
  return { id: _id.toHexString(), ...rest };
}

// ─── GET /api/trades ─────────────────────────────────────────────────────────

app.get('/api/trades', async (req, res) => {
  try {
    const col    = await getCollection();
    const docs   = await col.find({}).sort({ date: -1, _id: -1 }).toArray();
    const result = docs
      .map(toClient)
      .filter(t => matchesFilters(t, req.query));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/trades ────────────────────────────────────────────────────────

app.post('/api/trades', async (req, res) => {
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

  const doc = {
    symbol:      symbol.toUpperCase(),
    quantity:    Number(quantity),
    entry_price: Number(entry_price),
    stop_loss:   Number(stop_loss),
    exit_price:  exit_price ? Number(exit_price) : null,
    date,
    notes:       notes || null,
    created_at:  new Date().toISOString(),
  };

  try {
    const col    = await getCollection();
    const result = await col.insertOne(doc);
    res.status(201).json(toClient({ _id: result.insertedId, ...doc }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/trades/:id ─────────────────────────────────────────────────────

app.put('/api/trades/:id', async (req, res) => {
  let oid;
  try { oid = new ObjectId(req.params.id); }
  catch { return res.status(400).json({ error: 'Invalid trade id' }); }

  try {
    const col  = await getCollection();
    const prev = await col.findOne({ _id: oid });
    if (!prev) return res.status(404).json({ error: 'Trade not found' });

    const body  = req.body;
    const entry = body.entry_price != null ? Number(body.entry_price) : prev.entry_price;
    const stop  = body.stop_loss   != null ? Number(body.stop_loss)   : prev.stop_loss;
    if (stop >= entry) {
      return res.status(400).json({ error: 'Stop loss must be below entry price' });
    }

    const update = {
      symbol:      body.symbol      != null ? body.symbol.toUpperCase()  : prev.symbol,
      quantity:    body.quantity    != null ? Number(body.quantity)       : prev.quantity,
      entry_price: entry,
      stop_loss:   stop,
      exit_price:  'exit_price' in body ? (body.exit_price ? Number(body.exit_price) : null) : prev.exit_price,
      date:        body.date        != null ? body.date                   : prev.date,
      notes:       'notes'       in body ? (body.notes || null)           : prev.notes,
    };

    await col.updateOne({ _id: oid }, { $set: update });
    res.json(toClient({ _id: oid, ...prev, ...update }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/trades/:id ──────────────────────────────────────────────────

app.delete('/api/trades/:id', async (req, res) => {
  let oid;
  try { oid = new ObjectId(req.params.id); }
  catch { return res.status(400).json({ error: 'Invalid trade id' }); }

  try {
    const col    = await getCollection();
    const result = await col.deleteOne({ _id: oid });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Trade not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  Trade Tracker API  →  http://localhost:${PORT}\n`);
});
