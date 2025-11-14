const { MongoClient, ObjectId } = require('mongodb');
const config = require('../config/env');
const RepositoryError = require('../errors/RepositoryError');
class Database {
  constructor() {
    this._client = null;
    this._db = null;
  }
  async connect() {
    if (this._db) return this._db;
    try {
      this._client = new MongoClient(config.mongo.uri, { useUnifiedTopology: true });
      await this._client.connect();
      this._db = this._client.db(config.mongo.dbName);
      return this._db;
    } catch (err) {
      throw new RepositoryError('Falha ao conectar no MongoDB', err);
    }
  }
  collection(name) {
    if (!this._db) throw new Error('Database não conectado');
    return this._db.collection(name);
  }
  objectId(id) { return new ObjectId(id); }
  async close() {
    if (this._client) await this._client.close();
    this._client = null; this._db = null;
  }
}
module.exports = new Database();