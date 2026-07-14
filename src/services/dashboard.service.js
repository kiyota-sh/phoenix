const { Op } = require("sequelize");
const { Proyecto, Avance, HistorialCambio, Categoria } = require("../models");

async function resumen(usuarioId) {
  const proyectos = await Proyecto.findAll({
    where: { usuarioId },
    attributes: ["estado"],
    raw: true,
  });

  const conteo = { activos: 0, abandonados: 0, finalizados: 0, archivados: 0 };
  const CLAVE_POR_ESTADO = {
    activo: "activos",
    abandonado: "abandonados",
    finalizado: "finalizados",
    archivado: "archivados",
  };
  for (const p of proyectos) {
    conteo[CLAVE_POR_ESTADO[p.estado]]++;
  }
  return conteo;
}

async function actividadReciente(usuarioId, limit = 10) {
  const [avances, cambiosEstado] = await Promise.all([
    Avance.findAll({
      include: [
        {
          model: Proyecto,
          as: "proyecto",
          where: { usuarioId },
          attributes: ["id", "nombre"],
        },
      ],
      order: [["fecha", "DESC"]],
      limit,
    }),
    HistorialCambio.findAll({
      where: { campoModificado: "estado" },
      include: [
        {
          model: Proyecto,
          as: "proyecto",
          where: { usuarioId },
          attributes: ["id", "nombre"],
        },
      ],
      order: [["fecha", "DESC"]],
      limit,
    }),
  ]);

  const items = [
    ...avances.map((a) => ({
      tipo: "avance",
      fecha: a.fecha,
      proyectoId: a.proyecto.id,
      proyectoNombre: a.proyecto.nombre,
      descripcion: a.descripcion,
    })),
    ...cambiosEstado.map((h) => ({
      tipo: "cambio_estado",
      fecha: h.fecha,
      proyectoId: h.proyecto.id,
      proyectoNombre: h.proyecto.nombre,
      valorAnterior: h.valorAnterior,
      valorNuevo: h.valorNuevo,
    })),
  ];

  // Se piden `limit` de cada fuente por separado y despues se mezclan y
  // recortan — si solo pidieramos `limit` total de una fuente, podriamos
  // perder items recientes de la otra fuente en el camino.
  items.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  return items.slice(0, limit);
}

async function proximosObjetivos(usuarioId) {
  const hoy = new Date();
  const en30Dias = new Date();
  en30Dias.setDate(hoy.getDate() + 30);

  return Proyecto.findAll({
    where: {
      usuarioId,
      estado: "activo",
      fechaObjetivo: { [Op.gte]: hoy, [Op.lte]: en30Dias },
    },
    include: [{ model: Categoria, as: "categoria", attributes: ["nombre"] }],
    order: [["fechaObjetivo", "ASC"]],
  });
}

module.exports = { resumen, actividadReciente, proximosObjetivos };
