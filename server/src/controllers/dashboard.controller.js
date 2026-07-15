const dashboardService = require("../services/dashboard.service");
const { success } = require("../utils/apiResponse");
const catchAsync = require("../utils/catchAsync");

const resumen = catchAsync(async (req, res) => {
  const data = await dashboardService.resumen(req.usuarioId);
  return success(res, { data });
});

const actividadReciente = catchAsync(async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const data = await dashboardService.actividadReciente(req.usuarioId, limit);
  return success(res, { data });
});

const proximosObjetivos = catchAsync(async (req, res) => {
  const data = await dashboardService.proximosObjetivos(req.usuarioId);
  return success(res, { data });
});

module.exports = { resumen, actividadReciente, proximosObjetivos };
