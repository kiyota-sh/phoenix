const catchAsync = require("../utils/catchAsync");
const tareaService = require("../services/tarea.service");

const listar = catchAsync(async (req, res) => {
  const tareas = await tareaService.listarTareas(
    //id del proyecto, id del usuario
      req.params.id,
    req.usuarioId,
  );
  res.status(200).json({ success: true, message: "OK", data: tareas });
});

const crear = catchAsync(async (req, res) => {
  const tarea = await tareaService.crearTarea(
    req.params.id,
    req.usuarioId,
    req.body,
  );
  res.status(201).json({ success: true, message: "Tarea creada", data: tarea });
});

const actualizar = catchAsync(async (req, res) => {
  const tarea = await tareaService.actualizarTarea(
    req.params.id,
    req.usuarioId,
    req.body,
  );
  res
    .status(200)
    .json({ success: true, message: "Tarea actualizada", data: tarea });
});

const completar = catchAsync(async (req, res) => {
  const tarea = await tareaService.completarTarea(
    req.params.id,
    req.usuarioId,
    req.body.completado,
  );
  res
    .status(200)
    .json({ success: true, message: "Tarea actualizada", data: tarea });
});

const eliminar = catchAsync(async (req, res) => {
  await tareaService.eliminarTarea(req.params.id, req.usuarioId);
  res
    .status(200)
    .json({ success: true, message: "Tarea eliminada", data: null });
});

module.exports = { listar, crear, actualizar, completar, eliminar };
