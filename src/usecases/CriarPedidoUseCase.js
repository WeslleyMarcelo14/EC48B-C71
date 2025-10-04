const { Pedido } = require('../entities/Pedido');
const ValidationError = require('../errors/ValidationError');
const RepositoryError = require('../errors/RepositoryError');
const logger = require('../log/logger');

class CriarPedidoUseCase {
  constructor({ pedidoRepo, produtoRepo }) {
    this.pedidoRepo = pedidoRepo;
    this.produtoRepo = produtoRepo;
  }
  async execute({ usuarioId, lojaId, itens }) {
    if (!usuarioId) throw new ValidationError('usuarioId obrigatório');
    if (!lojaId) throw new ValidationError('lojaId obrigatório');
    if (!Array.isArray(itens) || itens.length === 0) throw new ValidationError('itens obrigatórios');
    try {
      const itensExpandidos = [];
      for (const it of itens) {
        if (!it.produtoId) throw new ValidationError('produtoId obrigatório');
        const produto = await this.produtoRepo.findById(it.produtoId);
        if (produto.lojaId !== lojaId) throw new ValidationError('Produto de loja diferente', { produtoId: it.produtoId });
        const quantidade = it.quantidade || 1;
        itensExpandidos.push({ produtoId: it.produtoId, quantidade, precoUnitario: produto.preco });
      }
      const pedidoEntity = new Pedido({ usuarioId, lojaId, itens: itensExpandidos });
      const saved = await this.pedidoRepo.insertOne(pedidoEntity.toDocument());
      return saved;
    } catch (err) {
      logger.captureError(err, { usecase: 'CriarPedido' });
      if (err.name === 'ValidationError') throw err;
      throw new RepositoryError('Falha ao criar pedido', err);
    }
  }
}
module.exports = CriarPedidoUseCase;
