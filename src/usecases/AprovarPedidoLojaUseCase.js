const ValidationError = require('../errors/ValidationError');
const RepositoryError = require('../errors/RepositoryError');
const logger = require('../log/logger');
class AprovarPedidoLojaUseCase {
  constructor({ pedidoRepo }) {
    this.pedidoRepo = pedidoRepo;
  }
  async execute({ pedidoId, lojaId }) {
    if (!pedidoId) throw new ValidationError('pedidoId obrigatório');
    if (!lojaId) throw new ValidationError('lojaId obrigatório');
    try {
      const pedido = await this.pedidoRepo.findById(pedidoId);
      if (pedido.lojaId !== lojaId) throw new ValidationError('Pedido não pertence à loja');
      if (pedido.status !== 'CRIADO') throw new ValidationError('Status não permite aprovação', { status: pedido.status });
      return this.pedidoRepo.atualizarStatus(pedidoId, 'APROVADO');
    } catch (err) {
      logger.captureError(err, { usecase: 'AprovarPedidoLoja' });
      if (err.name === 'ValidationError' || err.name === 'NotFoundError') throw err;
      throw new RepositoryError('Falha ao aprovar pedido', err);
    }
  }
}
module.exports = AprovarPedidoLojaUseCase;