const BaseRepository = require('./BaseRepository');
class EntregaRepository extends BaseRepository {
  constructor() { super('entregas'); }
  async atualizarStatus(id, status) { return this.updateById(id, { status }); }
}
module.exports = EntregaRepository;