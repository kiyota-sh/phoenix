require('dotenv').config();
const app = require('./app');
// Importar desde models/index.js (no directo de config/database) para que
// TODAS las asociaciones entre modelos se registren al arrancar el server,
// antes de que cualquier request las necesite.
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

async function iniciar() {
  try {
    // authenticate() solo prueba la conexion, NO toca el schema
    // (a diferencia de sync(), que si lo haria).
    await sequelize.authenticate();
    console.log('Conexion a la base de datos OK');

    app.listen(PORT, () => {
      console.log(`Phoenix API corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('No se pudo conectar a la base de datos:', err.message);
    process.exit(1);
  }
}

iniciar();
