const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient } = require('mongodb');
const apiRoutes = require('./src/routes');
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'EC48B';
const app = express();
app.disable('etag');
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((err, req, res, next) => {
  if (!err) return next();
  console.error('Erro de parse no body:', err && err.stack ? err.stack : err);
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({ erro: 'Corpo JSON inválido' });
  }
  next(err);
});
app.use(session({
  name: 'sessao_projeto',
  secret: process.env.SESSION_SECRET || 'ec48b-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60 * 60 * 1000,
    sameSite: 'lax',
    httpOnly: true,
    secure: false
  }
}));
app.set('views', path.join(__dirname, 'static'));
app.set('view engine', 'ejs');
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use((req, res, next) => {
  if (req.path && req.path.startsWith('/.well-known')) {
    return res.status(204).end();
  }
  return next();
});
async function initializeDatabase() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('Conectado ao MongoDB em', MONGO_URI);
    const db = client.db(DB_NAME);
    app.locals.db = {
      Usuarios: db.collection('usuarios'),
      Produtos: db.collection('produtos'),
      Pedidos: db.collection('pedidos'),
      Entregas: db.collection('entregas'),
      Lojas: db.collection('lojas')
    };
    await app.locals.db.Usuarios.createIndex({ email: 1 }, { unique: true });
    await app.locals.db.Produtos.createIndex({ nomeLower: 1, preco: 1 }, { unique: true });
    await app.locals.db.Pedidos.createIndex({ clienteId: 1 });
    await app.locals.db.Lojas.createIndex({ vendedorId: 1 });
    console.log('Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao conectar MongoDB:', error);
    process.exit(1);
  }
}
async function startServer() {
  try {
    await initializeDatabase();
    app.use('/api', apiRoutes);
    app.get(['/', '/index.html'], (req, res) => {
      const indexPath = path.join(__dirname, 'static', 'index.html');
      res.sendFile(indexPath, err => {
        if (err) res.status(500).send('Erro ao carregar a página inicial');
      });
    });
    app.use((req, res) => {
      console.warn(`404 - Rota não encontrada: ${req.method} ${req.originalUrl}`);
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({ erro: 'Rota não encontrada' });
      }
      const indexPath = path.join(__dirname, 'static', 'index.html');
      res.sendFile(indexPath, err => {
        if (err) {
          console.error('Erro ao enviar index.html para rota desconhecida:', err);
          return res.status(500).send('Erro interno');
        }
      });
    });
    app.listen(PORT, () => {
      console.log(`Servidor Express rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}
startServer();
