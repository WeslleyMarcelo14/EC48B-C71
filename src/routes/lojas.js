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
    const { Lojas } = req.app.locals.db;
    const list = await Lojas.find().toArray();
    res.json(list);
  } catch (error) {
    console.error('Erro em GET /api/lojas:', error);
    res.status(500).json({ erro: 'Erro ao listar lojas' });
  }
});
router.post('/', requireAuth, async (req, res) => {
  try {
    const { nome, cidade } = req.body || {};
    if (!nome || !cidade) {
      return res.status(400).json({ erro: 'Nome e cidade obrigatórios' });
    }
    const { Lojas } = req.app.locals.db;
    const doc = {
      nome,
      cidade,
      vendedorId: new ObjectId(req.user._id),
      criadoEm: new Date()
    };
    const result = await Lojas.insertOne(doc);
    doc._id = result.insertedId;
    res.status(201).json(doc);
  } catch (error) {
    console.error('Erro em POST /api/lojas:', error);
    res.status(500).json({ erro: 'Erro ao criar loja' });
  }
});
router.put('/:id', requireAuth, requireRole('vendedor'), async (req, res) => {
  try {
    const oid = toObjectId(req.params.id);
    const { nome, cidade } = req.body || {};
    if (!oid) {
      return res.status(400).json({ erro: 'ID inválido' });
    }
    if (!nome || !cidade) {
      return res.status(400).json({ erro: 'Nome e cidade obrigatórios' });
    }
    const { Lojas } = req.app.locals.db;
    const loja = await Lojas.findOne({ _id: oid });
    if (!loja) {
      return res.status(404).json({ erro: 'Loja não encontrada' });
    }
    if (loja.vendedorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ erro: 'Você só pode editar suas próprias lojas' });
    }
    const update = {
      $set: {
        nome,
        cidade,
        atualizadoEm: new Date(),
        atualizadoPor: new ObjectId(req.user._id)
      }
    };
    await Lojas.updateOne({ _id: oid }, update);
    const updated = await Lojas.findOne({ _id: oid });
    res.json(updated);
  } catch (error) {
    console.error('Erro em PUT /api/lojas/:id:', error);
    res.status(500).json({ erro: 'Erro ao atualizar loja' });
  }
});
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const oid = toObjectId(req.params.id);
    if (!oid) {
      return res.status(400).json({ erro: 'ID inválido' });
    }
    const { Lojas } = req.app.locals.db;
    const doc = await Lojas.findOneAndDelete({ _id: oid });
    if (!doc) {
      return res.status(404).json({ erro: 'Loja não encontrada' });
    }
    res.json(doc);
  } catch (error) {
    console.error('Erro em DELETE /api/lojas/:id:', error);
    res.status(500).json({ erro: 'Erro ao deletar loja' });
  }
});
module.exports = router;