const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

// Convencion REST: el token va en el header
//   Authorization: Bearer <token>
// (no en el body, no en query params - eso lo dejaria logueado en
// historiales de servidor y URLs compartidas).

function autenticar(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('No autenticado', 401));
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // A partir de aca, cualquier controller/service downstream puede
    // leer req.usuarioId para saber "quien" esta haciendo el pedido.
    req.usuarioId = payload.id;
    next();
  } catch (err) {
    return next(new AppError('Token invalido o expirado', 401));
  }
}

module.exports = autenticar;
