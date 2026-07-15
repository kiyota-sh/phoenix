const { Router } = require("express");
const catalogoController = require("../controllers/catalogo.controller");

const router = Router();

// no depende del usuario, no requiere token.
router.get("/motivos-abandono", catalogoController.listarMotivosAbandono);

module.exports = router;
