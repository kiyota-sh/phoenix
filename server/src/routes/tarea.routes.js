const express = require("express");
const router = express.Router();
const tareaController = require("../controllers/tarea.controller");
const autenticar = require("../middleware/auth.middleware");

router.use(autenticar);
router.put("/:id", tareaController.actualizar);
router.patch("/:id/completar", tareaController.completar);
router.delete("/:id", tareaController.eliminar);

module.exports = router;
