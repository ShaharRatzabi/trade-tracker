const { MongoClient, ObjectId } = require('mongodb');

let client;
let db;

async function connect() {
  if (db) return db;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI environment variable is not set');
  client = new MongoClient(uri);
  await client.connect();
  db = client.db('trade-tracker');
  return db;
}

async function getCollection() {
  const database = await connect();
  return database.collection('trades');
}

module.exports = { getCollection, ObjectId };
