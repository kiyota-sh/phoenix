const sequelize = require('../config/database');

const Usuario = require('./usuario.model');
const Categoria = require('./categoria.model');
const MotivoAbandono = require('./motivoAbandono.model');
const Proyecto = require('./proyecto.model');
const Tarea = require('./tarea.model');
const Avance = require('./avance.model');
const HistorialCambio = require('./historialCambio.model');


Usuario.hasMany(Categoria, { foreignKey: 'usuarioId', as: 'categorias' });
Usuario.hasMany(Proyecto, { foreignKey: 'usuarioId', as: 'proyectos' });

Categoria.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

Categoria.hasMany(Proyecto, { foreignKey: 'categoriaId', as: 'proyectos' });

Proyecto.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
Proyecto.belongsTo(Categoria, { foreignKey: 'categoriaId', as: 'categoria' });
Proyecto.belongsTo(MotivoAbandono, { foreignKey: 'motivoAbandonoId', as: 'motivoAbandono' });
Proyecto.hasMany(Avance, { foreignKey: 'proyectoId', as: 'avances' });
Proyecto.hasMany(Tarea, { foreignKey: 'proyectoId', as: 'tareas' });
Proyecto.hasMany(HistorialCambio, { foreignKey: 'proyectoId', as: 'historial' });


MotivoAbandono.hasMany(Proyecto, { foreignKey: 'motivoAbandonoId', as: 'proyectos' });

Avance.belongsTo(Proyecto, { foreignKey: 'proyectoId', as: 'proyecto' });
Tarea.belongsTo(Proyecto, { foreignKey: 'proyectoId', as: 'proyecto' });
HistorialCambio.belongsTo(Proyecto, { foreignKey: 'proyectoId', as: 'proyecto' });

module.exports = {
  sequelize,
  Usuario,
  Categoria,
  MotivoAbandono,
  Proyecto,
  Tarea,
  Avance,
  HistorialCambio,
};
