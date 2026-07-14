const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

// Catalogo fijo, sin created_at/updated_at (no cambia despues del seed
// inicial en schema.sql). Sin timestamps: true tampoco, para que Sequelize
// no intente leer/escribir esas columnas inexistentes.

class MotivoAbandono extends Model {}

MotivoAbandono.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(150), allowNull: false },
    // es_sistema distingue el motivo reservado para el abandono automatico
    // por vencimiento (ver reglas_negocio.md §5 y §9) — el job diario lo
    // busca por este flag, no por id fijo ni por nombre.
    esSistema: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'es_sistema' },
  },
  {
    sequelize,
    modelName: 'MotivoAbandono',
    tableName: 'motivos_abandono',
    timestamps: false,
  }
);

module.exports = MotivoAbandono;
