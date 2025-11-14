const express = require('express');
const { ObjectId } = require('mongodb');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
function toObjectId(val) {
  if (!val && val !== 0) return null;
  if (val instanceof ObjectId) return val;
  if (typeof val === 'string') {
    const s = val.trim();
    if (ObjectId.isValid(s)) return new ObjectId(s);
    try {
      if ((s.startsWith('{') && s.endsWith('}')) || s.startsWith('"')) {
        const parsed = JSON.parse(s);
        return toObjectId(parsed);
      }
    } catch (e) {
    }
    return null;
  }
  if (typeof val === 'object') {
    if (val.$oid && typeof val.$oid === 'string' && ObjectId.isValid(val.$oid)) {
      return new ObjectId(val.$oid);
    }
    if (val.$id && typeof val.$id === 'string' && ObjectId.isValid(val.$id)) {
      return new ObjectId(val.$id);
    }
    if (val._id) return toObjectId(val._id);
    if (val.toString && typeof val.toString === 'function') {
      const maybe = String(val.toString());
      if (ObjectId.isValid(maybe)) return new ObjectId(maybe);
    }
  }
  return null;
}
router.get('/', requireAuth, async (req, res) => {
  try {
    const { Entregas } = req.app.locals.db;
    const list = await Entregas.find().toArray();
    res.json(list);
  } catch (error) {
    console.error('Erro em GET /api/entregas:', error);
    res.status(500).json({ erro: 'Erro ao listar entregas' });
  }
});
router.post('/', requireAuth, async (req, res) => {
  try {
    const { destinatario, status } = req.body || {};
    if (!destinatario || !status) {
      return res.status(400).json({ erro: 'Destinatário e status obrigatórios' });
    }
    const { Entregas } = req.app.locals.db;
    const doc = {
      destinatario,
      status,
      criadoEm: new Date(),
      criadoPor: new ObjectId(req.user._id)
    };
    const result = await Entregas.insertOne(doc);
    doc._id = result.insertedId;
    res.status(201).json(doc);
  } catch (error) {
    console.error('Erro em POST /api/entregas:', error);
    res.status(500).json({ erro: 'Erro ao registrar entrega' });
  }
});
router.put('/:id/status', requireAuth, async (req, res) => {
  try {
    const oid = toObjectId(req.params.id);
    const { status } = req.body || {};
    if (!oid) {
      return res.status(400).json({ erro: 'ID inválido' });
    }
    if (!status) {
      return res.status(400).json({ erro: 'Status obrigatório' });
    }
    const { Entregas } = req.app.locals.db;
    const entrega = await Entregas.findOne({ _id: oid });
    if (!entrega) {
      return res.status(404).json({ erro: 'Entrega não encontrada' });
    }
    const update = {
      $set: {
        status,
        atualizadoEm: new Date(),
        atualizadoPor: new ObjectId(req.user._id)
      }
    };
    await Entregas.updateOne({ _id: oid }, update);
    const updated = await Entregas.findOne({ _id: oid });
    res.json(updated);
  } catch (error) {
    console.error('Erro em PUT /api/entregas/:id/status:', error);
    res.status(500).json({ erro: 'Erro ao atualizar status da entrega' });
  }
});
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const oid = toObjectId(req.params.id);
    if (!oid) {
      return res.status(400).json({ erro: 'ID inválido' });
    }
    const { Entregas } = req.app.locals.db;
    const doc = await Entregas.findOneAndDelete({ _id: oid });
    if (!doc) {
      return res.status(404).json({ erro: 'Entrega não encontrada' });
    }
    res.json(doc);
  } catch (error) {
    console.error('Erro em DELETE /api/entregas/:id:', error);
    res.status(500).json({ erro: 'Erro ao deletar entrega' });
  }
});
module.exports = router;