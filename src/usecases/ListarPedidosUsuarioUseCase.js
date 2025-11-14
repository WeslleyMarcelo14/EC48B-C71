const ValidationError = require('../errors/ValidationError');
const RepositoryError = require('../errors/RepositoryError');
const logger = require('../log/logger');
class ListarPedidosUsuarioUseCase {
  constructor({ pedidoRepo }) { this.pedidoRepo = pedidoRepo; }
  async execute({ usuarioId }) {
    if (!usuarioId) throw new ValidationError('usuarioId obrigatório');
    try {
      return this.pedidoRepo.find({ usuarioId });
    } catch (err) {
      logger.captureError(err, { usecase: 'ListarPedidosUsuario' });
      if (err.name === 'ValidationError') throw err;
      throw new RepositoryError('Falha ao listar pedidos do usuário', err);
    }
  }
}
module.exports = ListarPedidosUsuarioUseCase;