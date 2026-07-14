const catalogoService = require("../services/catalogo.service");
const { success } = require("../utils/apiResponse");
const catchAsync = require("../utils/catchAsync");

const listarMotivosAbandono = catchAsync(async (req, res) => {
  const data = await catalogoService.listarMotivosAbandono();
  return success(res, { data });
});

module.exports = { listarMotivosAbandono };
