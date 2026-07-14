const historialService = require("../services/historial.service");
const { success } = require("../utils/apiResponse");
const catchAsync = require("../utils/catchAsync");

const listarPorProyecto = catchAsync(async (req, res) => {
  const data = await historialService.listarPorProyecto(
    req.usuarioId,
    req.params.id,
  );
  return success(res, { data });
});

module.exports = { listarPorProyecto };
