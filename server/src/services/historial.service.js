const { Proyecto, HistorialCambio } = require("../models");
const AppError = require("../utils/AppError");

async function listarPorProyecto(usuarioId, proyectoId) {

  const proyecto = await Proyecto.findOne({
    where: { id: proyectoId, usuarioId },
  });
  if (!proyecto) throw new AppError("Proyecto no encontrado", 404);

  return HistorialCambio.findAll({
    where: { proyectoId },
    order: [["fecha", "DESC"]],
  });
}

module.exports = { listarPorProyecto };
