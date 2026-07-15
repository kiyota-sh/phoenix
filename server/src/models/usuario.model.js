const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');



class Usuario extends Model {
  toSafeJSON() {
    const { id, nombre, email, fechaRegistro } = this;
    return { id, nombre, email, fechaRegistro };
  }
}

Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash',
    },
    fechaRegistro: {
      type: DataTypes.DATE,
      field: 'fecha_registro',
    },
  },
  {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    underscored: true, // created_at / updated_at en vez de createdAt / updatedAt
    timestamps: true,
  }
);

module.exports = Usuario;
