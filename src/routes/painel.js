const express = require('express');
const path = require('path');
const fs = require('fs');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
const availablePanels = ['produtos', 'pedidos', 'entregas', 'lojas', 'usuarios'];
router.get('/:name', requireAuth, (req, res) => {
  const panelName = req.params.name;
  if (!availablePanels.includes(panelName)) {
    return res.status(404).json({ erro: 'Painel não encontrado' });
  }
  const htmlPath = path.join(__dirname, '../../static/panels', `${panelName}.html`);
  if (!fs.existsSync(htmlPath)) {
    return res.status(404).json({ erro: 'Arquivo do painel não encontrado' });
  }
  console.log(`Servindo painel ${panelName} de: ${htmlPath}`);
  res.sendFile(htmlPath, (err) => {
    if (err) {
      console.error(`Erro ao servir painel ${panelName}:`, err);
      res.status(500).json({ erro: 'Erro interno ao carregar painel' });
    } else {
      console.log(`Painel ${panelName} servido com sucesso`);
    }
  });
});
module.exports = router;