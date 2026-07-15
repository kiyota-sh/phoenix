const catchAsync = require("../utils/catchAsync");
const avanceService = require("../services/avanze.service");

const listar = catchAsync(async (req, res) => {
  const data = await avanceService.listarAvances(
    //id del proyecto, id del usuario y paginacion
    req.params.id,
    req.usuarioId,
    {
      page: req.query.page,
      limit: req.query.limit,
    },
  );
  res.status(200).json({ success: true, message: "OK", data });
});

const crear = catchAsync(async (req, res) => {
  const avance = await avanceService.crearAvance(
    //id del proyecto, id del usuario y datos del avance
    req.params.id,
    req.usuarioId,
    req.body,
  );
  res
    .status(201)
    .json({ success: true, message: "Avance registrado", data: avance });
});

const actualizar = catchAsync(async (req, res) => {
  const avance = await avanceService.actualizarAvance(
    //id del avance, id del usuario y datos del avance
    req.params.id,
    req.usuarioId,
    req.body,
  );
  res
    .status(200)
    .json({ success: true, message: "Avance actualizado", data: avance });
});

const eliminar = catchAsync(async (req, res) => {
  await avanceService.eliminarAvance(req.params.id, req.usuarioId);
  res
    .status(200)
    .json({ success: true, message: "Avance eliminado", data: null });
});

module.exports = { listar, crear, actualizar, eliminar };
