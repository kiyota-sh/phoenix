const proyectoService = require("../services/proyecto.service");
const { success } = require("../utils/apiResponse");
const catchAsync = require("../utils/catchAsync");

const listar = catchAsync(async (req, res) => {
  const data = await proyectoService.listar(req.usuarioId, req.query);
  return success(res, { data });
});

const obtenerDetalle = catchAsync(async (req, res) => {
  const data = await proyectoService.obtenerDetalle(
    req.usuarioId,
    req.params.id,
  );
  return success(res, { data });
});

const crear = catchAsync(async (req, res) => {
    
    const data = await proyectoService.crear(req.usuarioId, req.body);
    
  return success(res, { status: 201, message: "Proyecto creado", data });
});

const actualizar = catchAsync(async (req, res) => {
  const data = await proyectoService.actualizar(
    req.usuarioId,
    req.params.id,
    req.body,
  );
  return success(res, { message: "Proyecto actualizado", data });
});

const archivar = catchAsync(async (req, res) => {
  const data = await proyectoService.archivar(req.usuarioId, req.params.id);
  return success(res, { message: "Proyecto archivado", data });
});

const cambiarEstado = catchAsync(async (req, res) => {
  const data = await proyectoService.cambiarEstado(
    req.usuarioId,
    req.params.id,
    req.body,
  );
  return success(res, { message: "Estado actualizado", data });
});

const reabrir = catchAsync(async (req, res) => {
  const data = await proyectoService.reabrir(req.usuarioId, req.params.id);
  return success(res, { message: "Proyecto reabierto", data });
});

module.exports = {
  listar,
  obtenerDetalle,
  crear,
  actualizar,
  archivar,
  cambiarEstado,
  reabrir,
};
