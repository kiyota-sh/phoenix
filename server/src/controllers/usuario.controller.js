const usuarioService = require("../services/usuario.service");
const { success } = require("../utils/apiResponse");
const catchAsync = require("../utils/catchAsync");

const obtenerPerfil = catchAsync(async (req, res) => {
  const data = await usuarioService.obtenerPerfil(req.usuarioId);
  return success(res, { data });
});

const actualizarPerfil = catchAsync(async (req, res) => {
  const data = await usuarioService.actualizarPerfil(req.usuarioId, req.body);
  return success(res, { message: "Perfil actualizado", data });
});

const cambiarPassword = catchAsync(async (req, res) => {
  await usuarioService.cambiarPassword(req.usuarioId, req.body);
  return success(res, { message: "Contrasena actualizada" });
});

module.exports = { obtenerPerfil, actualizarPerfil, cambiarPassword };
