const BaseRepository = require('./BaseRepository');
const NotFoundError = require('../errors/NotFoundError');

class PedidoRepository extends BaseRepository {
  constructor() { super('pedidos'); }
  async atualizarStatus(id, status) {
    return this.updateById(id, { status });
  }
  async adicionarItem(id, item) {
    const pedido = await this.findById(id);
    if (!pedido) throw new NotFoundError('Pedido não encontrado');
    const novosItens = pedido.itens.concat([item]);
    const total = novosItens.reduce((s, it) => s + (it.subtotal || (it.quantidade * it.precoUnitario)), 0);
    return this.updateById(id, { itens: novosItens, total });
  }
}
module.exports = PedidoRepository;
