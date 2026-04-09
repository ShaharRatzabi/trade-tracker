const fs   = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'trades.json');

function load() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return { trades: [], nextId: 1 };
  }
}

function save(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

module.exports = { load, save };
