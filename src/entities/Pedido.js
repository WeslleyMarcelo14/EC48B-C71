const ValidationError = require('../errors/ValidationError');
class PedidoItem {
  constructor({ produtoId, quantidade, precoUnitario }) {
    if (!produtoId) throw new ValidationError('produtoId obrigatório', { field: 'produtoId' });
    if (!quantidade || quantidade <= 0) throw new ValidationError('quantidade inválida', { field: 'quantidade' });
    if (precoUnitario == null || precoUnitario < 0) throw new ValidationError('precoUnitario inválido', { field: 'precoUnitario' });
    this.produtoId = produtoId;
    this.quantidade = quantidade;
    this.precoUnitario = precoUnitario;
    this.subtotal = quantidade * precoUnitario;
  }
}
class Pedido {
  constructor({ id = null, usuarioId, lojaId, itens = [] }) {
    if (!usuarioId) throw new ValidationError('usuarioId é obrigatório', { field: 'usuarioId' });
    if (!lojaId) throw new ValidationError('lojaId é obrigatório', { field: 'lojaId' });
    if (!Array.isArray(itens) || itens.length === 0) throw new ValidationError('itens obrigatórios', { field: 'itens' });
    this.id = id;
    this.usuarioId = usuarioId;
    this.lojaId = lojaId;
    this.status = 'CRIADO';
    this.itens = itens.map(i => new PedidoItem(i));
    this.total = this.itens.reduce((s, i) => s + i.subtotal, 0);
    this.criadoEm = new Date();
    this.atualizadoEm = new Date();
  }
  aprovar() {
    if (this.status !== 'CRIADO') throw new ValidationError('Pedido não pode ser aprovado', { status: this.status });
    this.status = 'APROVADO';
    this.atualizadoEm = new Date();
  }
  enviar() {
    if (this.status !== 'APROVADO') throw new ValidationError('Pedido não pode ser enviado', { status: this.status });
    this.status = 'ENVIADO';
    this.atualizadoEm = new Date();
  }
  entregar() {
    if (this.status !== 'ENVIADO') throw new ValidationError('Pedido não pode ser entregue', { status: this.status });
    this.status = 'ENTREGUE';
    this.atualizadoEm = new Date();
  }
  cancelar() {
    if (['ENTREGUE', 'CANCELADO'].includes(this.status)) throw new ValidationError('Pedido não pode ser cancelado', { status: this.status });
    this.status = 'CANCELADO';
    this.atualizadoEm = new Date();
  }
  toDocument() {
    return {
      usuarioId: this.usuarioId,
      lojaId: this.lojaId,
      status: this.status,
      itens: this.itens.map(i => ({ produtoId: i.produtoId, quantidade: i.quantidade, precoUnitario: i.precoUnitario, subtotal: i.subtotal })),
      total: this.total,
      criadoEm: this.criadoEm,
      atualizadoEm: this.atualizadoEm
    };
  }
}
module.exports = { Pedido, PedidoItem };