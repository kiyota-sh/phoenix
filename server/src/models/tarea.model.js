const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Tarea extends Model {}

Tarea.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    proyectoId: { type: DataTypes.INTEGER, allowNull: false, field: 'proyecto_id' },
    nombre: { type: DataTypes.STRING(200), allowNull: false },
    peso: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1, max: 5 },
    },
    completado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    // Gestionada por trigger de DB al cambiar `completado` — el servicio
    // nunca la escribe directamente.
    fechaCompletado: { type: DataTypes.DATE, allowNull: true, field: 'fecha_completado' },
  },
  {
    sequelize,
    modelName: 'Tarea',
    tableName: 'tareas',
    underscored: true,
    timestamps: true,
  }
);

module.exports = Tarea;
