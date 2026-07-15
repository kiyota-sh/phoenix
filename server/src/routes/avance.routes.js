const express = require("express");
const router = express.Router();
const autenticar = require("../middleware/auth.middleware");
const avanceController = require("../controllers/avance.controller");
router.use(autenticar);
router.put("/:id", avanceController.actualizar);
router.delete("/:id", avanceController.eliminar);

module.exports = router;
