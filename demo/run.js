const db = require('../src/db/Database');
const Usuario = require('../src/entities/Usuario');
const Loja = require('../src/entities/Loja');
const Produto = require('../src/entities/Produto');
const UsuarioRepository = require('../src/repositories/UsuarioRepository');
const LojaRepository = require('../src/repositories/LojaRepository');
const ProdutoRepository = require('../src/repositories/ProdutoRepository');
const PedidoRepository = require('../src/repositories/PedidoRepository');
const EntregaRepository = require('../src/repositories/EntregaRepository');

const CriarPedidoUseCase = require('../src/usecases/CriarPedidoUseCase');
const AprovarPedidoLojaUseCase = require('../src/usecases/AprovarPedidoLojaUseCase');
const RegistrarEntregaUseCase = require('../src/usecases/RegistrarEntregaUseCase');
const AtualizarStatusEntregaUseCase = require('../src/usecases/AtualizarStatusEntregaUseCase');
const ListarPedidosUsuarioUseCase = require('../src/usecases/ListarPedidosUsuarioUseCase');

(async () => {
  try {
    await db.connect();
    console.log('Conectado ao MongoDB');

    const usuarioRepo = new UsuarioRepository();
    const lojaRepo = new LojaRepository();
    const produtoRepo = new ProdutoRepository();
    const pedidoRepo = new PedidoRepository();
    const entregaRepo = new EntregaRepository();

    // Criar usuário
    const usuario = new Usuario({ nome: 'João', email: 'joao@example.com' });
    const usuarioSaved = await usuarioRepo.insertOne(usuario.toDocument());
    console.log('Usuario criado:', usuarioSaved);

    // Criar loja
    const loja = new Loja({ nome: 'Lanchonete Boa', cnpj: '12345678000100' });
    const lojaSaved = await lojaRepo.insertOne(loja.toDocument());
    console.log('Loja criada:', lojaSaved);

    // Criar produtos
    const prod1 = new Produto({ lojaId: lojaSaved.id, nome: 'Hamburguer', preco: 25.5 });
    const prod2 = new Produto({ lojaId: lojaSaved.id, nome: 'Refrigerante', preco: 6.0 });
    const p1 = await produtoRepo.insertOne(prod1.toDocument());
    const p2 = await produtoRepo.insertOne(prod2.toDocument());
    console.log('Produtos criados:', p1.id, p2.id);

    // Criar pedido
    const criarPedido = new CriarPedidoUseCase({ pedidoRepo, produtoRepo });
    const pedido = await criarPedido.execute({ usuarioId: usuarioSaved.id, lojaId: lojaSaved.id, itens: [ { produtoId: p1.id, quantidade: 2 }, { produtoId: p2.id, quantidade: 1 } ] });
    console.log('Pedido criado:', pedido);

    // Aprovar pedido
    const aprovarPedido = new AprovarPedidoLojaUseCase({ pedidoRepo });
    const pedidoAprovado = await aprovarPedido.execute({ pedidoId: pedido.id, lojaId: lojaSaved.id });
    console.log('Pedido aprovado:', pedidoAprovado.status);

    // Registrar entrega 
    const registrarEntrega = new RegistrarEntregaUseCase({ pedidoRepo, entregaRepo });
    const entrega = await registrarEntrega.execute({ pedidoId: pedido.id, endereco: 'Rua A, 123' });
    console.log('Entrega registrada:', entrega);

    // Atualizar status entrega
    const atualizarEntrega = new AtualizarStatusEntregaUseCase({ entregaRepo });
    const entregaAndamento = await atualizarEntrega.execute({ entregaId: entrega.id, status: 'A_CAMINHO' });
    console.log('Entrega a caminho:', entregaAndamento.status);
    const entregaFinal = await atualizarEntrega.execute({ entregaId: entrega.id, status: 'ENTREGUE' });
    console.log('Entrega finalizada:', entregaFinal.status);

    // Listar pedidos do usuário
    const listarPedidos = new ListarPedidosUsuarioUseCase({ pedidoRepo });
    const pedidosUsuario = await listarPedidos.execute({ usuarioId: usuarioSaved.id });
    console.log('Pedidos do usuário:', pedidosUsuario.map(p => ({ id: p.id, status: p.status, total: p.total })));

  } catch (err) {
    console.error('Erro durante demo:', err);
  } finally {
    await db.close();
    process.exit(0);
  }
})();
