const crypto = require("crypto");
const {
  validateNombre,
  validateFechaInicio,
  validateFechaObjetivo,
  validatePrioridad,
  validarEstadoDestino,
  validarTransicionAAbandonado,
  validarMotivoAbandono,
  validarTransicionAFinalizado,
} = require("../validations/proyectoValidations");
const {
  Proyecto,
  Categoria,
  Tarea,
  HistorialCambio,
  sequelize,
} = require("../models");

const AppError = require("../utils/AppError");

//Campos del proyecto trackeados, en el momento que cambien se registrara dicho cambio
const CAMPOS_EDITABLES_TRACKEADOS = [
  "nombre",
  "descripcion",
  "objetivo",
  "categoriaId",
  "prioridad",
  "fechaObjetivo",
];

// Mapeo camelCase (modelo) -> snake_case (columna en historial_cambios,
// que respeta el mismo nombre que la columna real de Proyecto).
const CAMPO_A_COLUMNA = {
  nombre: "nombre",
  descripcion: "descripcion",
  objetivo: "objetivo",
  categoriaId: "categoria_id",
  prioridad: "prioridad",
  fechaObjetivo: "fecha_objetivo",
  estado: "estado",
  motivoAbandonoId: "motivo_abandono_id",
  motivoAbandonoDetalle: "motivo_abandono_detalle",
};

// ---------- Helpers de cálculo (campos que no se guardan, se calculan) ----------

async function calcularProgreso(proyectoId) {
  const resultado = await Tarea.findOne({
    where: { proyectoId },
    attributes: [
      [
        //literal permite insertar codigo SQL directamente en una consulta
        //La consulta evalua que el campo completado sea true en ese caso devuelve del peso sino devuelve 0 y las suma todos
        sequelize.literal("SUM(CASE WHEN completado THEN peso ELSE 0 END)"),
        "pesoCompletado",
        //Guarda dicho valor en la varible peso completado
      ],
      // Suma todas las columnas de peso y las guarda en la variable pesoTotal
      [sequelize.fn("SUM", sequelize.col("peso")), "pesoTotal"],
    ],
    //Recibe los datos como un objeto json limpio
    raw: true,
  });
  // sin tareas -> null
  if (!resultado || resultado.pesoTotal === null) return null;

  //Calcula el porcentaje que de peso completaado en funcion al peso total
  const pct =
    (Number(resultado.pesoCompletado) / Number(resultado.pesoTotal)) * 100;

  return Math.round(pct * 100) / 100; // 2 decimales
}

/**
 * Calculara los dias restantes que le queda al proyecto segun su fecha objetico
 *
 */
function calcularDiasRestantesObjetivo(fechaObjetivo) {
  if (!fechaObjetivo) return null;

  const hoy = new Date();

  //Resetea la hora a las 00:00:00:000 para comparar solo el calendario.
  hoy.setHours(0, 0, 0, 0);

  // Convierte el parámetro recibido  en un objeto de fecha .
  const objetivo = new Date(fechaObjetivo);

  // Resetea la hora a las 00:00:00:000 para comparar solo el calendario.
  objetivo.setHours(0, 0, 0, 0);

  //obtene las fechas en milisegundos y las resta
  const diffMs = objetivo.getTime() - hoy.getTime();

  //Obtenemos los dias restantes
  // Divide los milisegundos totales entre los milisegundos que tiene un día (1000ms * 60s * 60min * 24h = 86400000).
  // Usa Math.round() para redondear al entero más cercano y evitar problemas con los cambios de horario de verano.
  return Math.round(diffMs / 86400000);
}

/**
 * Adjunta los campos calculados al proyecto.
 */
async function enriquecer(proyecto) {
  //convertimos los datos del proyecto en formato json
  const plano = proyecto.toJSON();
  plano.progreso = await calcularProgreso(proyecto.id);
  plano.diasRestantesObjetivo = calcularDiasRestantesObjetivo(
    proyecto.fechaObjetivo,
  );
  return plano;
}

// ---------- Helper de permisos ----------
// 404 (no 403) si el proyecto no existe o no pertenece al usuario

/**
 * Obtiene el proyecto del usuario
 */
async function buscarProyectoDelUsuario(usuarioId, proyectoId) {
  const proyecto = await Proyecto.findOne({
    where: { id: proyectoId, usuarioId },
  });
  if (!proyecto) {
    throw new AppError("Proyecto no encontrado", 404);
  }
  return proyecto;
}

/**
 * Valida que una categoría, si se manda, pertenezca al usuario.
 */
async function validarCategoriaDelUsuario(usuarioId, categoriaId) {
  if (categoriaId === undefined || categoriaId === null) return;

  const categoria = await Categoria.findOne({
    where: { id: categoriaId, usuarioId },
  });

  if (!categoria) {
    throw new AppError("Categoria no encontrada", 404);
  }
}

/**
 * Registra los cambios del proyecto en el historial
 */

async function registrarHistorial(proyectoId, cambios) {
  if (cambios.length === 0) return;
  //Crea un Universally Unique Identifier para la transaccion de esta manera todos los cambios quedaran marcados con este mismo id
  const transaccionId = crypto.randomUUID();

  //bulkCreate permite insertar múltiples registros en la base de datos en una sola consulta SQL.
  // Inserta todos los cambios en la base de datos de manera masiva en una sola operación
  await HistorialCambio.bulkCreate(
    cambios.map((c) => ({
      proyectoId,
      transaccionId,
      campoModificado: CAMPO_A_COLUMNA[c.campo],
      valorAnterior:
        c.anterior === null || c.anterior === undefined
          ? null
          : String(c.anterior),
      valorNuevo:
        c.nuevo === null || c.nuevo === undefined ? null : String(c.nuevo),
    })),
  );
}

// ---------- Operaciones ----------

async function listar(
  usuarioId,
  {
    categoria,
    estado,
    prioridad,
    page = 1,
    limit = 20,
    orderBy = "createdAt",
  } = {},
) {
  //Construimos el filtro where
  const where = { usuarioId };
  if (categoria) where.categoriaId = categoria;
  if (estado) where.estado = estado;
  if (prioridad) where.prioridad = prioridad;

  //Calculamos el offset es decir cuantos registros se va a saltar en este caso sera de 20 en 20
  const offset = (page - 1) * limit;

  // findAndCountAll ejecuta dos consultas SQL: una cuenta el total de registros existentes (count) y otra trae las filas paginadas (rows)
  const { rows, count } = await Proyecto.findAndCountAll({
    where,
    limit: Number(limit),
    offset: Number(offset),
    order: [[orderBy, "DESC"]],
  });

  // Promise.all procesa todas las filas al mismo tiempo, aplicamos la funcion enriquecer
  // la cual le agregara a cada fila datos como el progreso y los dias restantes
  const proyectos = await Promise.all(rows.map(enriquecer));

  return {
    proyectos,
    paginacion: {
      page: Number(page),
      limit: Number(limit),
      total: count,
      //Calcula el total de paginas redondeando hacia arriba
      totalPages: Math.ceil(count / limit),
    },
  };
}

/**
 * Obtiene los datos datos del proyecto y le agrega campos como el progreso y los dias restantes
 */
async function obtenerDetalle(usuarioId, proyectoId) {
  const proyecto = await Proyecto.findOne({
    where: { id: proyectoId, usuarioId },
    include: [{ model: Categoria, as: "categoria" }],
  });
  if (!proyecto) throw new AppError("Proyecto no encontrado", 404);
  return enriquecer(proyecto);
}

//Crea el proyecto con los datos y el id del usuario
async function crear(usuarioId, datos) {
  const {
    nombre,
    descripcion,
    objetivo,
    categoriaId,
    prioridad,
    fechaInicio,
    fechaObjetivo,
  } = datos;

  //Validamos los datos necesarios y los normalizamos

  const nombreNormalizado = validateNombre(nombre);
  const fechaInicioNormalizada = validateFechaInicio(fechaInicio);
  const fechaObjetivoNormalizada = validateFechaObjetivo(fechaObjetivo);
  if (prioridad) validatePrioridad(prioridad);

  if (fechaObjetivo && fechaObjetivo < fechaInicio) {
    throw new AppError(
      "fechaObjetivo no puede ser anterior a fechaInicio",
      400,
    );
  }
  //Validamos que la categoria pertenezca al usuario
  await validarCategoriaDelUsuario(usuarioId, categoriaId);

  const proyecto = await Proyecto.create({
    usuarioId: usuarioId,
    nombre: nombreNormalizado,
    descripcion: descripcion,
    objetivo: objetivo,
    categoriaId: categoriaId,
    prioridad: prioridad,
    fechaInicio: fechaInicioNormalizada,
    fechaObjetivo: fechaObjetivoNormalizada,
  });

  return enriquecer(proyecto);
}

//Actualiza los datos del proyetco
async function actualizar(usuarioId, proyectoId, datos) {
  const proyecto = await buscarProyectoDelUsuario(usuarioId, proyectoId);

  if (datos.categoriaId !== undefined) {
    await validarCategoriaDelUsuario(usuarioId, datos.categoriaId);
  }

  const nuevaFechaObjetivo =
    datos.fechaObjetivo !== undefined
      ? datos.fechaObjetivo
      : proyecto.fechaObjetivo;

  const nuevaFechaInicio =
    datos.fechaInicio !== undefined ? datos.fechaInicio : proyecto.fechaInicio;

  if (nuevaFechaObjetivo && nuevaFechaObjetivo < nuevaFechaInicio) {
    throw new AppError(
      "fechaObjetivo no puede ser anterior a fechaInicio",
      400,
    );
  }
  if (datos.fechaObjetivo !== undefined) {
    datos.fechaObjetivo = validateFechaObjetivo(datos.fechaObjetivo);
  }
  if (datos.fechaInicio !== undefined) {
    datos.fechaInicio = validateFechaInicio(datos.fechaInicio);
  }

  if (datos.nombre !== undefined) {
    datos.nombre = validateNombre(datos.nombre);
  }
  if (datos.prioridad !== undefined) {
    validatePrioridad(datos.prioridad);
  }


  const cambios = [];
  //Registrar los cambios en el array cambios, asignar el nuevo valor a los campos del proyecto
  for (const campo of CAMPOS_EDITABLES_TRACKEADOS) {
    if (datos[campo] === undefined) continue;
    const anterior = proyecto[campo];
    const nuevo = datos[campo];
    if (anterior !== nuevo) {
      cambios.push({ campo, anterior, nuevo });
      proyecto[campo] = nuevo;
    }
  }
  await proyecto.save();
  await registrarHistorial(proyecto.id, cambios);

  return enriquecer(proyecto);
}

//Establece el estado del proyecto como archivado
async function archivar(usuarioId, proyectoId) {
  const proyecto = await buscarProyectoDelUsuario(usuarioId, proyectoId);

  if (proyecto.estado === "archivado") {
    throw new AppError("El proyecto ya esta en ese estado", 400);
  }

  const estadoAnterior = proyecto.estado;

  proyecto.estado = "archivado";

  await proyecto.save();

  await registrarHistorial(proyecto.id, [
    { campo: "estado", anterior: estadoAnterior, nuevo: "archivado" },
  ]);

  return enriquecer(proyecto);
}



// --- Función principal ---

async function cambiarEstado(
  usuarioId,
  proyectoId,
  { estado, motivoAbandonoId, motivoAbandonoDetalle },
) {
  validarEstadoDestino(estado);

  const proyecto = await buscarProyectoDelUsuario(usuarioId, proyectoId);

  if (estado === "abandonado") {
    validarTransicionAAbandonado(proyecto);
    validarMotivoAbandono(motivoAbandonoId);
  }

  if (estado === "finalizado") {
    validarTransicionAFinalizado(proyecto);
  }

  const cambios = [
    { campo: "estado", anterior: proyecto.estado, nuevo: estado },
  ];

  proyecto.estado = estado;

  if (estado === "abandonado") {
    cambios.push({
      campo: "motivoAbandonoId",
      anterior: proyecto.motivoAbandonoId,
      nuevo: motivoAbandonoId,
    });
    cambios.push({
      campo: "motivoAbandonoDetalle",
      anterior: proyecto.motivoAbandonoDetalle,
      nuevo: motivoAbandonoDetalle,
    });
    proyecto.motivoAbandonoId = motivoAbandonoId;
    proyecto.motivoAbandonoDetalle = motivoAbandonoDetalle || null;
  }

  await proyecto.save();
  await registrarHistorial(proyecto.id, cambios);

  return enriquecer(proyecto);
}

//Re abre un proyecto archivado o abandonado
async function reabrir(usuarioId, proyectoId) {
  const proyecto = await buscarProyectoDelUsuario(usuarioId, proyectoId);

  if (proyecto.estado === "activo") {
    throw new AppError("El proyecto ya esta en ese estado", 400);
  }

  if (!["abandonado", "archivado"].includes(proyecto.estado)) {
    throw new AppError("Transicion de estado invalida", 400);
  }

  const cambios = [
    { campo: "estado", anterior: proyecto.estado, nuevo: "activo" },
  ];

  // Solo hubo motivo si venia de "abandonado" - si venia de "archivado" sin
  // haber pasado por abandonado, motivoAbandonoId ya era null.
  if (proyecto.motivoAbandonoId !== null) {
    cambios.push({
      campo: "motivoAbandonoId",
      anterior: proyecto.motivoAbandonoId,
      nuevo: null,
    });
  }
  if (proyecto.motivoAbandonoDetalle !== null) {
    cambios.push({
      campo: "motivoAbandonoDetalle",
      anterior: proyecto.motivoAbandonoDetalle,
      nuevo: null,
    });
  }

  proyecto.estado = "activo";
  proyecto.motivoAbandonoId = null;
  proyecto.motivoAbandonoDetalle = null;
  await proyecto.save();

  await registrarHistorial(proyecto.id, cambios);

  return enriquecer(proyecto);
}
function asegurarProyectoActivo(proyecto, mensaje) {
  if (proyecto.estado !== "activo") {
    throw new AppError(
      "El estado del proyecto no permite esta operación. ",
      400
    );
  }
}

module.exports = {
  listar,
  obtenerDetalle,
  crear,
  actualizar,
  archivar,
  cambiarEstado,
  reabrir,
  buscarProyectoDelUsuario,
  validarCategoriaDelUsuario,
  enriquecer,
  asegurarProyectoActivo,
  registrarHistorial,
};
