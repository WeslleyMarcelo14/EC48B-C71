const ValidationError = require('../errors/ValidationError');
class Produto {
  constructor({ id = null, lojaId, nome, preco }) {
    if (!lojaId) throw new ValidationError('Campo lojaId é obrigatório', { field: 'lojaId' });
    if (!nome) throw new ValidationError('Campo nome é obrigatório', { field: 'nome' });
    if (preco == null || isNaN(preco) || preco < 0) throw new ValidationError('Campo preco inválido', { field: 'preco' });
    this.id = id;
    this.lojaId = lojaId;
    this.nome = nome;
    this.preco = preco;
    this.ativo = true;
    this.criadoEm = new Date();
  }
  toDocument() {
    return { lojaId: this.lojaId, nome: this.nome, preco: this.preco, ativo: this.ativo, criadoEm: this.criadoEm };
  }
}
module.exports = Produto;