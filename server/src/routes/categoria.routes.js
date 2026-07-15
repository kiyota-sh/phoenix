const { Router } = require("express");
const autenticar = require("../middleware/auth.middleware");
const categoriaController = require("../controllers/categoria.controller");

const router = Router();

router.use(autenticar);

router.get("/", categoriaController.listar);
router.post("/", categoriaController.crear);
router.put("/:id", categoriaController.actualizar);
router.delete("/:id", categoriaController.eliminar);

module.exports = router;
