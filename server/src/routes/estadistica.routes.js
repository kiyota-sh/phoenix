const { Router } = require("express");
const autenticar = require("../middleware/auth.middleware");
const estadisticaController = require("../controllers/estadistica.controller");

const router = Router();

router.use(autenticar);

router.get("/por-categoria", estadisticaController.porCategoria);
router.get("/motivos-abandono", estadisticaController.motivosAbandono);
router.get(
  "/tiempo-promedio-abandono",
  estadisticaController.tiempoPromedioAbandono,
);
router.get("/completados-por-anio", estadisticaController.completadosPorAnio);

module.exports = router;
