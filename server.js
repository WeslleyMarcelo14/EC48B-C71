const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

let usuarios = [];
let usuarioId = 1;
let produtos = [];
let produtoId = 1;
let pedidos = [];
let pedidoId = 1;
let entregas = [];
let entregaId = 1;
let lojas = [];
let lojaId = 1;

const server = http.createServer((req, res) => {

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (pathname === '/api/lojas') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(lojas));
      return;
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const { nome, cidade } = JSON.parse(body);
          if (!nome || !cidade) throw new Error('Nome e cidade obrigatórios');
          const novaLoja = {
            id: lojaId++,
            nome,
            cidade,
            criadoEm: new Date().toISOString()
          };
          lojas.push(novaLoja);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(novaLoja));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ erro: e.message }));
        }
      });
      return;
    }
    res.writeHead(405);
    res.end();
    return;
  }

  if (pathname === '/api/entregas') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(entregas));
      return;
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const { destinatario, status } = JSON.parse(body);
          if (!destinatario || !status) throw new Error('Destinatário e status obrigatórios');
          const novaEntrega = {
            id: entregaId++,
            destinatario,
            status,
            criadoEm: new Date().toISOString()
          };
          entregas.push(novaEntrega);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(novaEntrega));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ erro: e.message }));
        }
      });
      return;
    }
    res.writeHead(405);
    res.end();
    return;
  }

  if (pathname === '/api/pedidos') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(pedidos));
      return;
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const { descricao, valor } = JSON.parse(body);
          if (!descricao || valor == null) throw new Error('Descrição e valor obrigatórios');
          const novoPedido = {
            id: pedidoId++,
            descricao,
            valor: Number(valor),
            criadoEm: new Date().toISOString()
          };
          pedidos.push(novoPedido);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(novoPedido));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ erro: e.message }));
        }
      });
      return;
    }
    res.writeHead(405);
    res.end();
    return;
  }

  if (pathname === '/api/produtos') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(produtos));
      return;
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const { nome, preco } = JSON.parse(body);
          if (!nome || preco == null) throw new Error('Nome e preço obrigatórios');
          const novoProduto = {
            id: produtoId++,
            nome,
            preco: Number(preco),
            criadoEm: new Date().toISOString()
          };
          produtos.push(novoProduto);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(novoProduto));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ erro: e.message }));
        }
      });
      return;
    }
    res.writeHead(405);
    res.end();
    return;
  }

  if (pathname === '/api/usuarios') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(usuarios));
      return;
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const { nome, email } = JSON.parse(body);
          if (!nome || !email) throw new Error('Nome e email obrigatórios');
          const novoUsuario = {
            id: usuarioId++,
            nome,
            email,
            criadoEm: new Date().toISOString()
          };
          usuarios.push(novoUsuario);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(novoUsuario));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ erro: e.message }));
        }
      });
      return;
    }
    res.writeHead(405);
    res.end();
    return;
  }


  if (pathname === '/api/usuarios') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(usuarios));
      return;
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const { nome, email } = JSON.parse(body);
          if (!nome || !email) throw new Error('Nome e email obrigatórios');
          const novoUsuario = {
            id: usuarioId++,
            nome,
            email,
            criadoEm: new Date().toISOString()
          };
          usuarios.push(novoUsuario);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(novoUsuario));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ erro: e.message }));
        }
      });
      return;
    }
    res.writeHead(405);
    res.end();
    return;
  }

  if (pathname.startsWith('/static/')) {
    const filePath = path.join(__dirname, 'static', pathname.replace('/static/', ''));
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Arquivo não encontrado');
      } else {
        res.writeHead(200);
        res.end(data);
      }
    });
    return;
  }

  // Conteúdo dinâmico: saudação personalizada
  if (pathname === '/saudacao') {
    const nome = url.searchParams.get('nome') || 'Visitante';
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Olá, ${nome}! Bem-vindo ao servidor Node.js!`);
    return;
  }

  if (pathname === '/' || pathname === '/index.html') {
    const filePath = path.join(__dirname, 'static', 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Erro ao carregar a página inicial');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
    return;
  }

  // Rota não encontrada
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Rota não encontrada');
});

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
