const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Avance extends Model {}

Avance.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    proyectoId: { type: DataTypes.INTEGER, allowNull: false, field: 'proyecto_id' },
   
    fecha: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    descripcion: { type: DataTypes.TEXT, allowNull: false },
    notas: { type: DataTypes.TEXT, allowNull: true },
    dificultades: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: 'Avance',
    tableName: 'avances',
    underscored: true,
    timestamps: true,
  }
);

module.exports = Avance;
