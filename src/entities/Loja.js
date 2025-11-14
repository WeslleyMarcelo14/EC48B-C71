const ValidationError = require('../errors/ValidationError');
class Loja {
  constructor({ id = null, nome, cnpj }) {
    if (!nome) throw new ValidationError('Campo nome é obrigatório', { field: 'nome' });
    if (!cnpj) throw new ValidationError('Campo cnpj é obrigatório', { field: 'cnpj' });
    this.id = id;
    this.nome = nome;
    this.cnpj = cnpj;
    this.ativa = true;
    this.criadoEm = new Date();
  }
  toDocument() {
    return { nome: this.nome, cnpj: this.cnpj, ativa: this.ativa, criadoEm: this.criadoEm };
  }
}
module.exports = Loja;