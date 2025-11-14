const express = require('express');
const { ObjectId } = require('mongodb');
const { requireAuth, requireRole } = require('../middleware/auth');
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
    const { Pedidos } = req.app.locals.db;
    const list = await Pedidos.find().toArray();
    res.json(list);
  } catch (error) {
    console.error('Erro em GET /api/pedidos:', error);
    res.status(500).json({ erro: 'Erro ao listar pedidos' });
  }
});
router.post('/', requireAuth, async (req, res) => {
  try {
    const { descricao, valor } = req.body || {};
    if (!descricao || valor == null) {
      return res.status(400).json({ erro: 'Descrição e valor obrigatórios' });
    }
    const { Pedidos } = req.app.locals.db;
    const doc = {
      descricao,
      valor: Number(valor),
      clienteId: new ObjectId(req.user._id),
      status: 'pending',
      criadoEm: new Date()
    };
    const result = await Pedidos.insertOne(doc);
    doc._id = result.insertedId;
    res.status(201).json(doc);
  } catch (error) {
    console.error('Erro em POST /api/pedidos:', error);
    res.status(500).json({ erro: 'Erro ao criar pedido' });
  }
});
router.post('/:id/aprovar', requireAuth, requireRole('vendedor'), async (req, res) => {
  try {
    const oid = toObjectId(req.params.id);
    if (!oid) {
      return res.status(400).json({ erro: 'ID inválido' });
    }
    const { Pedidos } = req.app.locals.db;
    const pedido = await Pedidos.findOne({ _id: oid });
    if (!pedido) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }
    if (pedido.status === 'approved') {
      return res.status(400).json({ erro: 'Pedido já aprovado' });
    }
    const update = {
      $set: {
        status: 'approved',
        aprovadoPor: new ObjectId(req.user._id),
        aprovadoEm: new Date()
      }
    };
    await Pedidos.updateOne({ _id: oid }, update);
    const updated = await Pedidos.findOne({ _id: oid });
    res.json(updated);
  } catch (error) {
    console.error('Erro em POST /api/pedidos/:id/aprovar:', error);
    res.status(500).json({ erro: 'Erro ao aprovar pedido' });
  }
});
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const oid = toObjectId(req.params.id);
    if (!oid) {
      return res.status(400).json({ erro: 'ID inválido' });
    }
    const { Pedidos } = req.app.locals.db;
    const doc = await Pedidos.findOneAndDelete({ _id: oid });
    if (!doc) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }
    res.json(doc);
  } catch (error) {
    console.error('Erro em DELETE /api/pedidos/:id:', error);
    res.status(500).json({ erro: 'Erro ao deletar pedido' });
  }
});
module.exports = router;