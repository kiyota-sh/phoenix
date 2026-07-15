const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const errorHandler = require('./middleware/error.middleware');
const proyectoRoutes = require("./routes/proyecto.routes");
const avanceRoutes = require("./routes/avance.routes");
const tareaRoutes = require("./routes/tarea.routes");
const usuarioRoutes = require("./routes/usuario.routes");
const categoriaRoutes = require("./routes/categoria.routes");
const catalogoRoutes = require("./routes/catalogo.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const estadisticaRoutes = require("./routes/estadistica.routes");
const app = express();

app.use(cors());
app.use(express.json());

// Prefijo /api/v1 en un solo lugar
app.use('/api/v1/auth', authRoutes);
app.use("/api/v1/proyectos", proyectoRoutes);
app.use("/api/v1/avances", avanceRoutes);
app.use("/api/v1/tareas", tareaRoutes);
app.use("/api/v1/usuarios", usuarioRoutes);
app.use("/api/v1/categorias", categoriaRoutes);
app.use("/api/v1/catalogos", catalogoRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/estadisticas", estadisticaRoutes);
// Ruta  para verificar que el server esta vivo

app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'Phoenix API viva', data: null });
});

// El error handler SIEMPRE va al final, despues de todas las rutas.
// Express lo identifica como manejador de errores por tener 4 parametros.
app.use(errorHandler);

module.exports = app;
