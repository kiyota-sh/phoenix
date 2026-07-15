const { Proyecto, Avance } = require("../models");
const AppError = require("../utils/AppError");
const {
  buscarProyectoDelUsuario,
    asegurarProyectoActivo,
} = require("./proyecto.service");
const { validateFecha } = require("../validations/avanceValidations");


async function listarAvances(
  proyectoId,
  usuarioId,
  { page = 1, limit = 20 } = {},
) {
  // Lectura libre en cualquier estado del proyecto 
  // la restriccion de "activo" solo aplica a escritura).
  await buscarProyectoDelUsuario(usuarioId, proyectoId);

  page = Number(page) || 1;
  limit = Number(limit) || 20;
  const offset = (page - 1) * limit;

  const { rows, count } = await Avance.findAndCountAll({
    where: { proyectoId },
    order: [["fecha", "DESC"]],
    limit,
    offset,
  });

  return {
    avances: rows,
    paginacion: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

async function crearAvance(proyectoId, usuarioId, datos) {
  const proyecto = await buscarProyectoDelUsuario(usuarioId, proyectoId);

  asegurarProyectoActivo( proyecto);

  if (!datos.descripcion || !String(datos.descripcion).trim()) {
    throw new AppError("La descripcion es requerida", 400);
  }
  
  if(datos.fecha===undefined)  datos.fecha = new Date().toISOString(); // si no viene, se asume hoy
  

  const fecha = validateFecha(datos.fecha);
  const fechaDate = new Date(fecha).getTime();  
  const fechaInicio = new Date(proyecto.fechaInicio).getTime();

  if ( fechaDate < fechaInicio ) {
    throw new AppError(
      "La fecha del avance no puede ser anterior a la fecha de inicio del proyecto",
      400
    );
  }

  if (
    proyecto.fechaUltimoAvance &&
    fecha < new Date(proyecto.fechaUltimoAvance)
  ) {
    throw new AppError(
      "La fecha del avance no puede ser anterior al avance mas reciente ya registrado",
      400
    );
    
  }


  return Avance.create({
    proyectoId,
    descripcion: datos.descripcion,
    notas: datos.notas ?? null,
    dificultades: datos.dificultades ?? null,
    fecha,
  });
}

async function obtenerAvanceDeUsuario(avanceId, usuarioId) {
  const avance = await Avance.findByPk(avanceId, {
    include: [{ model: Proyecto, as: "proyecto", where: { usuarioId } }],
  });
  if (!avance) {
    throw new AppError("Avance no encontrado", 404);
  }
  return avance;
}

async function actualizarAvance(avanceId, usuarioId, datos) {

  const avance = await obtenerAvanceDeUsuario(avanceId, usuarioId);

  if ("fecha" in datos) {
    throw new AppError("La fecha de un avance no se puede editar", 400);
  }


  if ("descripcion" in datos && !String(datos.descripcion).trim()) {
    throw new AppError("La descripcion es requerida", 400);
  }

  await avance.update({
    descripcion:
      "descripcion" in datos ? datos.descripcion : avance.descripcion,
    notas: "notas" in datos ? datos.notas : avance.notas,
    dificultades:
      "dificultades" in datos ? datos.dificultades : avance.dificultades,
  });

  return avance;
}

async function eliminarAvance(avanceId, usuarioId) {
  const avance = await obtenerAvanceDeUsuario(avanceId, usuarioId);

  const ultimoAvance = await Avance.findOne({
    where: { proyectoId: avance.proyectoId },
    order: [["fecha", "DESC"]],
  });

  if (ultimoAvance.id !== avance.id) {
    throw new AppError(
      "Solo se puede eliminar el avance mas reciente del proyecto",
      400
    );
  }

  await avance.destroy();
  // fechaUltimoAvance se recalcula solo via trigger de DB (AFTER DELETE).
}

module.exports = {
  listarAvances,
  crearAvance,
  actualizarAvance,
  eliminarAvance,
};
