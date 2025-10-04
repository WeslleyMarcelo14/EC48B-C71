const ValidationError = require('../errors/ValidationError');
const RepositoryError = require('../errors/RepositoryError');
const Entrega = require('../entities/Entrega');
const logger = require('../log/logger');

class RegistrarEntregaUseCase {
  constructor({ pedidoRepo, entregaRepo }) {
    this.pedidoRepo = pedidoRepo;
    this.entregaRepo = entregaRepo;
  }
  async execute({ pedidoId, endereco }) {
    if (!pedidoId) throw new ValidationError('pedidoId obrigatório');
    if (!endereco) throw new ValidationError('endereco obrigatório');
    try {
      const pedido = await this.pedidoRepo.findById(pedidoId);
      if (!['APROVADO', 'ENVIADO'].includes(pedido.status)) throw new ValidationError('Status do pedido não permite gerar entrega', { status: pedido.status });
      if (pedido.status === 'APROVADO') await this.pedidoRepo.atualizarStatus(pedidoId, 'ENVIADO');
      const entregaEntity = new Entrega({ pedidoId, endereco });
      const saved = await this.entregaRepo.insertOne(entregaEntity.toDocument());
      return saved;
    } catch (err) {
      logger.captureError(err, { usecase: 'RegistrarEntrega' });
      if (err.name === 'ValidationError' || err.name === 'NotFoundError') throw err;
      throw new RepositoryError('Falha ao registrar entrega', err);
    }
  }
}
module.exports = RegistrarEntregaUseCase;
