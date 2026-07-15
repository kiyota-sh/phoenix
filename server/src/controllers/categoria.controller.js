const categoriaService = require("../services/categoria.service");
const { success } = require("../utils/apiResponse");
const catchAsync = require("../utils/catchAsync");

const listar = catchAsync(async (req, res) => {
  const data = await categoriaService.listar(req.usuarioId);
  return success(res, { data });
});

const crear = catchAsync(async (req, res) => {
  const data = await categoriaService.crear(req.usuarioId, req.body);
  return success(res, { status: 201, message: "Categoria creada", data });
});

const actualizar = catchAsync(async (req, res) => {
  const data = await categoriaService.actualizar(
    req.usuarioId,
    req.params.id,
    req.body,
  );
  return success(res, { message: "Categoria actualizada", data });
});

const eliminar = catchAsync(async (req, res) => {
  await categoriaService.eliminar(req.usuarioId, req.params.id);
  return success(res, { message: "Categoria eliminada" });
});

module.exports = { listar, crear, actualizar, eliminar };
