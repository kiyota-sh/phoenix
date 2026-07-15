const { Router } = require("express");
const autenticar = require("../middleware/auth.middleware");
const dashboardController = require("../controllers/dashboard.controller");

const router = Router();

router.use(autenticar);

router.get("/resumen", dashboardController.resumen);
router.get("/actividad-reciente", dashboardController.actividadReciente);
router.get("/proximos-objetivos", dashboardController.proximosObjetivos);

module.exports = router;
