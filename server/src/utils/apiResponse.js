// Estandariza la forma de TODAS las respuestas, exito o error.
// Asi el frontend siempre sabe donde buscar { success, message, data }
// sin importar que endpoint haya llamado.

function success(res, { status = 200, message = 'OK', data = null } = {}) {
  return res.status(status).json({ success: true, message, data });
}

function error(res, { status = 400, message = 'Error', errors = null } = {}) {
  return res.status(status).json({ success: false, message, errors });
}

module.exports = { success, error };
