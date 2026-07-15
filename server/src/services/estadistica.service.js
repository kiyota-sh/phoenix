const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");

async function porCategoria(usuarioId) {
  return sequelize.query(
    `SELECT COALESCE(c.nombre, 'Sin categoria') AS categoria, COUNT(*)::int AS cantidad
       FROM proyectos p
       LEFT JOIN categorias c ON c.id = p.categoria_id
      WHERE p.usuario_id = :usuarioId
      GROUP BY c.nombre
      ORDER BY cantidad DESC`,
    { replacements: { usuarioId }, type: QueryTypes.SELECT },
  );
}

// cuenta TODOS los eventos de abandono historicos
// (via historial_cambios), no solo los proyectos que estan abandonados
// ahora mismo — un proyecto abandonado y reabierto sigue contando.
async function motivosAbandono(usuarioId) {
  return sequelize.query(
    `SELECT ma.nombre AS motivo, COUNT(*)::int AS cantidad
       FROM historial_cambios hc
       JOIN proyectos p ON p.id = hc.proyecto_id
       JOIN motivos_abandono ma ON ma.id = hc.valor_nuevo::integer
      WHERE p.usuario_id = :usuarioId
        AND hc.campo_modificado = 'motivo_abandono_id'
        AND hc.valor_nuevo IS NOT NULL
      GROUP BY ma.nombre
      ORDER BY cantidad DESC`,
    { replacements: { usuarioId }, type: QueryTypes.SELECT },
  );
}

async function tiempoPromedioAbandono(usuarioId) {
  const [fila] = await sequelize.query(
    `SELECT ROUND(AVG(EXTRACT(EPOCH FROM (hc.fecha - p.fecha_inicio)) / 86400)::numeric, 1) AS "diasPromedio"
       FROM historial_cambios hc
       JOIN proyectos p ON p.id = hc.proyecto_id
      WHERE p.usuario_id = :usuarioId
        AND hc.campo_modificado = 'estado'
        AND hc.valor_nuevo = 'abandonado'`,
    { replacements: { usuarioId }, type: QueryTypes.SELECT },
  );
  return {
    diasPromedio: fila.diasPromedio !== null ? Number(fila.diasPromedio) : null,
  };
}

async function completadosPorAnio(usuarioId) {
  return sequelize.query(
    `SELECT EXTRACT(YEAR FROM hc.fecha)::int AS anio, COUNT(*)::int AS cantidad
       FROM historial_cambios hc
       JOIN proyectos p ON p.id = hc.proyecto_id
      WHERE p.usuario_id = :usuarioId
        AND hc.campo_modificado = 'estado'
        AND hc.valor_nuevo = 'finalizado'
      GROUP BY anio
      ORDER BY anio DESC`,
    { replacements: { usuarioId }, type: QueryTypes.SELECT },
  );
}

module.exports = {
  porCategoria,
  motivosAbandono,
  tiempoPromedioAbandono,
  completadosPorAnio,
};
