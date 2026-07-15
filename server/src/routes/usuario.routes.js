const { Router } = require("express");
const autenticar = require("../middleware/auth.middleware");
const usuarioController = require("../controllers/usuario.controller");

const router = Router();

router.use(autenticar); // los tres endpoints requieren estar logueado

router.get("/perfil", usuarioController.obtenerPerfil);
router.put("/perfil", usuarioController.actualizarPerfil);
router.patch("/password", usuarioController.cambiarPassword);

module.exports = router;
