const express = require('express');
const { ObjectId } = require('mongodb');
const { requireAuth, requireRole } = require('../middleware/auth');
const router = express.Router();
const pendingProductKeys = new Set();
function productKey(nome, preco) {
  return `${String(nome).trim().toLowerCase()}:${Number(preco)}`;
}
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
    const { Products } = req.app.locals.db;
    const produtos = await Products.find().toArray();
    res.json(produtos);
  } catch (error) {
    console.error('Erro em GET /api/produtos:', error);
    res.status(500).json({ erro: 'Erro ao listar produtos' });
  }
});
router.post('/', requireAuth, async (req, res) => {
  try {
    const { nome, preco } = req.body || {};
    if (!nome || preco == null) {
      return res.status(400).json({ erro: 'Nome e preço obrigatórios' });
    }
    const { Products } = req.app.locals.db;
    const nomeLower = String(nome).trim().toLowerCase();
    const precoNum = Number(preco);
    const key = productKey(nomeLower, precoNum);
    const existing = await Products.findOne({ nomeLower, preco: precoNum });
    if (existing) {
      return res.status(200).json({
        mensagem: 'Produto já existe',
        produto: existing
      });
    }
    if (pendingProductKeys.has(key)) {
      return res.status(429).json({
        erro: 'Criação em andamento, tente novamente'
      });
    }
    pendingProductKeys.add(key);
    try {
      const doc = {
        nome: String(nome).trim(),
        nomeLower,
        preco: precoNum,
        vendedorId: ObjectId.isValid(req.user._id) ?
          req.user._id : new ObjectId(req.user._id),
        criadoEm: new Date()
      };
      try {
        const result = await Products.insertOne(doc);
        doc._id = result.insertedId;
        return res.status(201).json(doc);
      } catch (error) {
        if (error && error.code === 11000) {
          const found = await Products.findOne({ nomeLower, preco: precoNum });
          if (found) {
            return res.status(200).json({
              mensagem: 'Produto já existe',
              produto: found
            });
          }
        }
        console.error('Erro criando produto:', error);
        return res.status(500).json({ erro: 'Erro ao criar produto' });
      }
    } finally {
      pendingProductKeys.delete(key);
    }
  } catch (error) {
    console.error('Erro em POST /api/produtos:', error);
    res.status(500).json({ erro: 'Erro ao criar produto' });
  }
});
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const oid = toObjectId(req.params.id);
    if (!oid) {
      return res.status(400).json({ erro: 'ID inválido' });
    }
    const { Products } = req.app.locals.db;
    const doc = await Products.findOneAndDelete({ _id: oid });
    if (!doc) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    res.json(doc);
  } catch (error) {
    console.error('Erro em DELETE /api/produtos/:id:', error);
    res.status(500).json({ erro: 'Erro ao deletar produto' });
  }
});
module.exports = router;