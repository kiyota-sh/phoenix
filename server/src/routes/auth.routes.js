const { Router } = require('express');
const authController = require('../controllers/auth.controller');

const router = Router();

router.post('/registro', authController.registro);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;
