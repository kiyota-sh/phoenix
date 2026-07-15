const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Categoria extends Model {}

Categoria.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuarioId: { type: DataTypes.INTEGER, allowNull: false, field: 'usuario_id' },
    nombre: { type: DataTypes.STRING(150), allowNull: false },
  },
  {
    sequelize,
    modelName: 'Categoria',
    tableName: 'categorias',
    underscored: true,
    timestamps: true,
  }
);

module.exports = Categoria;
