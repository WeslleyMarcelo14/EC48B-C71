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
    this.getSaudacao = this.getSaudacao.bind(this);
  }
  getSaudacao() {
    return `Olá, ${this.nome}!`;
  }
  atualizarEmailCallback(novoEmail, callback) {
    setTimeout(() => {
      this.email = novoEmail;
      callback(null, this.email);
    }, 100);
  }
  atualizarEmailPromise(novoEmail) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.email = novoEmail;
        resolve(this.email);
      }, 100);
    });
  }
  async atualizarEmailAsync(novoEmail) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.email = novoEmail;
    return this.email;
  }
  toDocument() {
    return { nome: this.nome, email: this.email, tipo: this.tipo, criadoEm: this.criadoEm };
  }
}
module.exports = Usuario;