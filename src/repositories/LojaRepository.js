const BaseRepository = require('./BaseRepository');

class LojaRepository extends BaseRepository {
  constructor() { super('lojas'); }
}
module.exports = LojaRepository;
