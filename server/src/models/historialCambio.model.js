const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class HistorialCambio extends Model {}

HistorialCambio.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    proyectoId: { type: DataTypes.INTEGER, allowNull: false, field: 'proyecto_id' },
    // Agrupa las filas de una misma operacion  —
    // el servicio genera este valor una sola vez por operacion y
    // reutiliza en cada fila que inserte como parte de ese cambio.
    transaccionId: { type: DataTypes.UUID, allowNull: false, field: 'transaccion_id' },
    campoModificado: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'campo_modificado',
      validate: {
        isIn: [[
          'nombre', 'descripcion', 'objetivo', 'categoria_id',
          'prioridad', 'fecha_objetivo', 'estado',
          'motivo_abandono_id', 'motivo_abandono_detalle',
        ]],
      },
    },
    valorAnterior: { type: DataTypes.TEXT, allowNull: true, field: 'valor_anterior' },
    valorNuevo: { type: DataTypes.TEXT, allowNull: true, field: 'valor_nuevo' },
    fecha: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'HistorialCambio',
    tableName: 'historial_cambios',
    timestamps: false,
  }
);

module.exports = HistorialCambio;
