const { Proyecto, Tarea } = require("../models");
const AppError = require("../utils/AppError");
const {
  buscarProyectoDelUsuario,
  asegurarProyectoActivo,
} = require("./proyecto.service");

const MENSAJE_PROYECTO_NO_ACTIVO =
  "No se pueden modificar tareas en un proyecto que no esta activo";

function validarPeso(peso) {
  if (peso !== undefined && (!Number.isInteger(peso) || peso < 1 || peso > 5)) {
    throw new AppError("El peso debe ser un entero entre 1 y 5",400);
  }
}

async function listarTareas(proyectoId, usuarioId) {
  await buscarProyectoDelUsuario(usuarioId, proyectoId);
  return Tarea.findAll({ where: { proyectoId }, order: [["orden", "ASC"]] });
}

async function crearTarea(proyectoId, usuarioId, datos) {
  const proyecto = await buscarProyectoDelUsuario(usuarioId, proyectoId);
  asegurarProyectoActivo(proyecto, MENSAJE_PROYECTO_NO_ACTIVO);

  if (!datos.nombre || !String(datos.nombre).trim()) {
    throw new AppError("El nombre es requerido", 400);
  }
  validarPeso(datos.peso);

  return Tarea.create({
    proyectoId,
    nombre: datos.nombre,
    peso: datos.peso ?? 1,
    completado: datos.completado ?? false,
    orden: datos.orden ?? 0,
    fechaCompletado: datos.fechaCompletado ?? null,
  });
}

async function obtenerTareaDeUsuario(tareaId, usuarioId) {
  const tarea = await Tarea.findByPk(tareaId, {
    include: [{ model: Proyecto, as: "proyecto", where: { usuarioId } }],
  });
  if (!tarea) {
    throw new AppError("Tarea no encontrada", 404);
  }
  return tarea;
}

async function actualizarTarea(tareaId, usuarioId, datos) {
  const tarea = await obtenerTareaDeUsuario(tareaId, usuarioId);
  asegurarProyectoActivo(tarea.proyecto, MENSAJE_PROYECTO_NO_ACTIVO);

  if ("nombre" in datos && !String(datos.nombre).trim()) {
    throw new AppError("El nombre es requerido", 400);
  }
  validarPeso(datos.peso);

  await tarea.update({
    nombre: "nombre" in datos ? datos.nombre : tarea.nombre,
    peso: datos.peso ?? tarea.peso,
    completado: datos.completado ?? false,
    orden: "orden" in datos ? datos.orden : tarea.orden,
    fechaCompletado: "fechaCompletado" in datos ? datos.fechaCompletado : tarea.fechaCompletado,
  });

  return tarea;
}

async function completarTarea(tareaId, usuarioId, completado) {
  const tarea = await obtenerTareaDeUsuario(tareaId, usuarioId);
  asegurarProyectoActivo(tarea.proyecto, MENSAJE_PROYECTO_NO_ACTIVO);

  if (typeof completado !== "boolean") {
    throw new AppError("El campo completado debe ser booleano", 400);
  }

  await tarea.update({ completado });
  return tarea;
}

async function eliminarTarea(tareaId, usuarioId) {
  const tarea = await obtenerTareaDeUsuario(tareaId, usuarioId);
  asegurarProyectoActivo(tarea.proyecto, MENSAJE_PROYECTO_NO_ACTIVO);
  await tarea.destroy();
}

module.exports = {
  listarTareas,
  crearTarea,
  actualizarTarea,
  completarTarea,
  eliminarTarea,
};
