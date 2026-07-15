const estadisticaService = require("../services/estadistica.service");
const { success } = require("../utils/apiResponse");
const catchAsync = require("../utils/catchAsync");

const porCategoria = catchAsync(async (req, res) => {
  const data = await estadisticaService.porCategoria(req.usuarioId);
  return success(res, { data });
});

const motivosAbandono = catchAsync(async (req, res) => {
  const data = await estadisticaService.motivosAbandono(req.usuarioId);
  return success(res, { data });
});

const tiempoPromedioAbandono = catchAsync(async (req, res) => {
  const data = await estadisticaService.tiempoPromedioAbandono(req.usuarioId);
  return success(res, { data });
});

const completadosPorAnio = catchAsync(async (req, res) => {
  const data = await estadisticaService.completadosPorAnio(req.usuarioId);
  return success(res, { data });
});

module.exports = {
  porCategoria,
  motivosAbandono,
  tiempoPromedioAbandono,
  completadosPorAnio,
};
