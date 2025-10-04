const ValidationError = require('../errors/ValidationError');

class Usuario {
  constructor({ id = null, nome, email }) {
    if (!nome) throw new ValidationError('Campo nome é obrigatório', { field: 'nome' });
    if (!email) throw new ValidationError('Campo email é obrigatório', { field: 'email' });
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.tipo = 'USUARIO';
    this.criadoEm = new Date();
  }
  toDocument() {
    return { nome: this.nome, email: this.email, tipo: this.tipo, criadoEm: this.criadoEm };
  }
}
module.exports = Usuario;
