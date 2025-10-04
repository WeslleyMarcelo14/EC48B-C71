const ValidationError = require('../errors/ValidationError');
const RepositoryError = require('../errors/RepositoryError');
const logger = require('../log/logger');

class AtualizarStatusEntregaUseCase {
  constructor({ entregaRepo }) { this.entregaRepo = entregaRepo; }
  async execute({ entregaId, status }) {
    if (!entregaId) throw new ValidationError('entregaId obrigatório');
    if (!status) throw new ValidationError('status obrigatório');
    try {
      const atualizada = await this.entregaRepo.atualizarStatus(entregaId, status);
      return atualizada;
    } catch (err) {
      logger.captureError(err, { usecase: 'AtualizarStatusEntrega' });
      if (err.name === 'ValidationError' || err.name === 'NotFoundError') throw err;
      throw new RepositoryError('Falha ao atualizar status entrega', err);
    }
  }
}
module.exports = AtualizarStatusEntregaUseCase;
