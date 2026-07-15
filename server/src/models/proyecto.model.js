const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');


class Proyecto extends Model {}

Proyecto.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuarioId: { type: DataTypes.INTEGER, allowNull: false, field: 'usuario_id' },
    categoriaId: { type: DataTypes.INTEGER, allowNull: true, field: 'categoria_id' },
    nombre: { type: DataTypes.STRING(200), allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: true },
    objetivo: { type: DataTypes.TEXT, allowNull: true },
    prioridad: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'media',
      validate: { isIn: [['baja', 'media', 'alta']] },
    },
    fechaInicio: { type: DataTypes.DATEONLY, allowNull: false, field: 'fecha_inicio' },
    fechaObjetivo: { type: DataTypes.DATEONLY, allowNull: true, field: 'fecha_objetivo' },
    estado: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'activo',
      validate: { isIn: [['activo', 'abandonado', 'finalizado', 'archivado']] },
    },
    motivoAbandonoId: { type: DataTypes.INTEGER, allowNull: true, field: 'motivo_abandono_id' },
    motivoAbandonoDetalle: { type: DataTypes.TEXT, allowNull: true, field: 'motivo_abandono_detalle' },
    fechaUltimoAvance: { type: DataTypes.DATE, allowNull: true, field: 'fecha_ultimo_avance' },
  },
  {
    sequelize,
    modelName: 'Proyecto',
    tableName: 'proyectos',
    underscored: true,
    timestamps: true,
  }
);

module.exports = Proyecto;
