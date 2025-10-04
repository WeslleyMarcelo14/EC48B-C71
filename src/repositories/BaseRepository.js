const db = require('../db/Database');
const RepositoryError = require('../errors/RepositoryError');
const NotFoundError = require('../errors/NotFoundError');
const logger = require('../log/logger');

class BaseRepository {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }
  async _col() {
    await db.connect();
    return db.collection(this.collectionName);
  }
  async insertOne(doc) {
    try {
      const col = await this._col();
      const result = await col.insertOne(doc);
      return { id: result.insertedId.toString(), ...doc };
    } catch (err) {
      logger.captureError(err, { op: 'insertOne', collection: this.collectionName });
      throw new RepositoryError('Erro ao inserir documento', err);
    }
  }
  async findById(id) {
    try {
      const col = await this._col();
      const objId = db.objectId(id);
      const doc = await col.findOne({ _id: objId });
      if (!doc) throw new NotFoundError('Documento não encontrado');
      return { id: doc._id.toString(), ...doc };
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      logger.captureError(err, { op: 'findById', collection: this.collectionName });
      throw new RepositoryError('Erro ao buscar documento', err);
    }
  }
  async find(filter = {}, options = {}) {
    try {
      const col = await this._col();
      const cursor = col.find(filter, options);
      const docs = await cursor.toArray();
      return docs.map(d => ({ id: d._id.toString(), ...d }));
    } catch (err) {
      logger.captureError(err, { op: 'find', collection: this.collectionName });
      throw new RepositoryError('Erro ao listar documentos', err);
    }
  }
  async deleteById(id) {
    try {
      const col = await this._col();
      const objId = db.objectId(id);
      const res = await col.deleteOne({ _id: objId });
      if (res.deletedCount === 0) throw new NotFoundError('Documento não encontrado');
      return true;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      logger.captureError(err, { op: 'deleteById', collection: this.collectionName });
      throw new RepositoryError('Erro ao deletar documento', err);
    }
  }
  async updateById(id, patch) {
    try {
      const col = await this._col();
      const objId = db.objectId(id);
      const res = await col.updateOne({ _id: objId }, { $set: { ...patch, atualizadoEm: new Date() } });
      if (res.matchedCount === 0) throw new NotFoundError('Documento não encontrado');
      return this.findById(id);
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      logger.captureError(err, { op: 'updateById', collection: this.collectionName });
      throw new RepositoryError('Erro ao atualizar documento', err);
    }
  }
}
module.exports = BaseRepository;
