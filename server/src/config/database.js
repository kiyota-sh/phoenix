require('dotenv').config();
const { Sequelize } = require('sequelize');

// Importante: esta instancia NO usa sync() para crear/modificar tablas.
// El schema real vive en phoenix_schema.sql (o en migraciones, mas adelante).
// Sequelize solo se conecta y mapea modelos a tablas que ya existen.

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, // poner console.log para ver las queries generadas mientras aprendes
  }
);

module.exports = sequelize;
