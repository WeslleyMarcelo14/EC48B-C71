const ValidationError = require('../errors/ValidationError');
class Entrega {
  constructor({ id = null, pedidoId, endereco, status = 'PENDENTE' }) {
    if (!pedidoId) throw new ValidationError('pedidoId é obrigatório', { field: 'pedidoId' });
    if (!endereco) throw new ValidationError('endereco é obrigatório', { field: 'endereco' });
    this.id = id;
    this.pedidoId = pedidoId;
    this.endereco = endereco;
    this.status = status;
    this.criadoEm = new Date();
    this.atualizadoEm = new Date();
  }
  atualizarStatus(novo) {
    const validos = ['PENDENTE', 'A_CAMINHO', 'ENTREGUE'];
    if (!validos.includes(novo)) throw new ValidationError('Status de entrega inválido', { novo });
    this.status = novo;
    this.atualizadoEm = new Date();
  }
  toDocument() {
    return { pedidoId: this.pedidoId, endereco: this.endereco, status: this.status, criadoEm: this.criadoEm, atualizadoEm: this.atualizadoEm };
  }
}
module.exports = Entrega;