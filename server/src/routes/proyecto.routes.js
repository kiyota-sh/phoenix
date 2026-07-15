const { Router } = require("express");
const autenticar = require("../middleware/auth.middleware");
const proyectoController = require("../controllers/proyecto.controller");
const avanceController = require("../controllers/avance.controller");
const historialController = require("../controllers/historial.controller");

const tareaController = require("../controllers/tarea.controller");


const router = Router();

router.use(autenticar); // todas las rutas de proyectos requieren token

router.get("/", proyectoController.listar);
router.get("/:id", proyectoController.obtenerDetalle);
router.post("/", proyectoController.crear);
router.put("/:id", proyectoController.actualizar);
router.patch("/:id/archivar", proyectoController.archivar);
router.patch("/:id/estado", proyectoController.cambiarEstado);
router.patch("/:id/reabrir", proyectoController.reabrir);

//Avances
router.get("/:id/avances", avanceController.listar);
router.post("/:id/avances", avanceController.crear);

//Tareas
router.get("/:id/tareas", tareaController.listar);
router.post("/:id/tareas", tareaController.crear);

router.get("/:id/historial", historialController.listarPorProyecto);


module.exports = router;
