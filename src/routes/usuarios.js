const express = require('express');
const bcrypt = require('bcryptjs');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
router.post('/', async (req, res) => {
  try {
    const { nome, email, senha, role } = req.body || {};
    const allowedRoles = ['cliente', 'vendedor'];
    const chosenRole = role && allowedRoles.includes(role) ? role : 'cliente';
    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: 'Nome, email e senha obrigatórios',
        recebido: { nome: !!nome, email: !!email, senha: !!senha }
      });
    }
    const { Users } = req.app.locals.db;
    const senhaHash = await bcrypt.hash(senha, 10);
    const doc = {
      nome,
      email,
      role: chosenRole,
      senhaHash,
      criadoEm: new Date()
    };
    try {
      const result = await Users.insertOne(doc);
      req.session.userId = result.insertedId.toString();
      req.session.save(err => {
        const usuario = {
          _id: result.insertedId.toString(),
          nome: doc.nome,
          email: doc.email,
          role: doc.role,
          criadoEm: doc.criadoEm
        };
        if (err) {
          console.error('Sessão: erro ao salvar após registro', err);
          return res.status(201).json({
            usuario,
            aviso: 'Usuário criado, mas falha ao iniciar sessão'
          });
        }
        console.log('Registro bem-sucedido, sessão iniciada para userId=', usuario._id);
        return res.status(201).json({
          usuario,
          mensagem: 'Usuário criado e autenticado'
        });
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ erro: 'Email já cadastrado' });
      }
      console.error('Erro ao inserir usuário:', error);
      return res.status(500).json({ erro: 'Erro ao criar usuário' });
    }
  } catch (error) {
    console.error('Erro em POST /api/usuarios:', error);
    res.status(500).json({ erro: 'Erro ao criar usuário' });
  }
});
router.get('/', requireAuth, async (req, res) => {
  try {
    const { Users } = req.app.locals.db;
    const list = await Users.find({}, { projection: { senhaHash: 0 } }).toArray();
    res.json(list);
  } catch (error) {
    console.error('Erro em GET /api/usuarios:', error);
    res.status(500).json({ erro: 'Erro ao listar usuários' });
  }
});
module.exports = router;