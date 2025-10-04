class LogErro {
  constructor({ id = null, nomeErro, mensagem, stack, data = new Date() }) {
    this.id = id;
    this.nomeErro = nomeErro;
    this.mensagem = mensagem;
    this.stack = stack;
    this.data = data;
  }
  toDocument() {
    return { nomeErro: this.nomeErro, mensagem: this.mensagem, stack: this.stack, data: this.data };
  }
}
module.exports = LogErro;
