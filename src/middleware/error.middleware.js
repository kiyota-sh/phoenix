const { error } = require('../utils/apiResponse');

// Middleware de 4 parametros = Express lo reconoce como manejador
// de errores. Se ejecuta cuando cualquier route/controller hace
// next(err), o cuando algo tira una excepcion dentro de una ruta
// async envuelta correctamente (ver catchAsync en utils).

function errorHandler(err, req, res, next) {
  // Error "esperado" (AppError): usamos su status y su mensaje tal cual.
  if (err.isOperational) {
    return error(res, { status: err.status, message: err.message });
  }

  // Error inesperado (bug real): no exponemos el detalle interno
  // al cliente, pero SI lo logueamos para nosotros.
  console.error('Error no controlado:', err);
  return error(res, { status: 500, message: 'Error interno del servidor' });
}

module.exports = errorHandler;
