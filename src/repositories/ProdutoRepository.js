const BaseRepository = require('./BaseRepository');
class ProdutoRepository extends BaseRepository {
  constructor() { super('produtos'); }
}
module.exports = ProdutoRepository;