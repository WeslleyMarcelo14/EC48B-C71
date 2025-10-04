const BaseRepository = require('./BaseRepository');

class UsuarioRepository extends BaseRepository {
  constructor() { super('usuarios'); }
}
module.exports = UsuarioRepository;
