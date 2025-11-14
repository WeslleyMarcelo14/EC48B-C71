const express = require('express');
const bcrypt = require('bcryptjs');
const { getSessionUser } = require('../middleware/auth');
const router = express.Router();
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body || {};
    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha obrigatórios' });
    }
    const { Usuarios } = req.app.locals.db;
    const user = await Usuarios.findOne({ email });
    if (!user) {
      return res.status(400).json({ erro: 'Usuário não encontrado' });
    }
    const isValidPassword = await bcrypt.compare(senha, user.senhaHash);
    if (!isValidPassword) {
      return res.status(400).json({ erro: 'Credenciais inválidas' });
    }
    req.session.userId = user._id.toString();
    req.session.save(err => {
      if (err) {
        console.error('Erro ao salvar sessão:', err);
        return res.status(500).json({ erro: 'Erro ao iniciar sessão' });
      }
      const usuario = {
        _id: user._id.toString(),
        nome: user.nome,
        email: user.email,
        role: user.role,
        criadoEm: user.criadoEm
      };
      return res.json({ mensagem: 'Autenticado', usuario });
    });
  } catch (error) {
    console.error('Erro em /api/login:', error);
    res.status(500).json({ erro: 'Erro no login' });
  }
});
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao encerrar sessão' });
    }
    res.json({ mensagem: 'Logout efetuado' });
  });
});
router.get('/me', async (req, res) => {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return res.status(401).json({ erro: 'Não autenticado' });
    }
    res.json({ usuario: user });
  } catch (error) {
    console.error('Erro em /api/me:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});
module.exports = router;
