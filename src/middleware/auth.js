const { ObjectId } = require('mongodb');
async function requireAuth(req, res, next) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return res.status(401).json({ erro: 'Não autenticado' });
    }
    req.user = user;
    return next();
  } catch (error) {
    console.error('Erro no middleware de auth:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}
function requireRole(requiredRole) {
  return async (req, res, next) => {
    try {
      const user = await getSessionUser(req);
      if (!user) {
        return res.status(401).json({ erro: 'Não autenticado' });
      }
      if (user.role !== requiredRole) {
        return res.status(403).json({ erro: 'Acesso negado: papel insuficiente' });
      }
      req.user = user;
      return next();
    } catch (error) {
      console.error('Erro no middleware de role:', error);
      return res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  };
}
async function getSessionUser(req) {
  if (!req.session || !req.session.userId) return null;
  try {
    const { Users } = req.app.locals.db;
    const id = ObjectId.isValid(req.session.userId) ?
      new ObjectId(req.session.userId) : null;
    if (!id) return null;
    return await Users.findOne(
      { _id: id },
      { projection: { senhaHash: 0 } }
    );
  } catch (error) {
    console.error('Erro ao buscar usuário da sessão:', error);
    return null;
  }
}
module.exports = {
  requireAuth,
  requireRole,
  getSessionUser
};