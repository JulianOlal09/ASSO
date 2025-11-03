const express = require('express');
const router = express.Router();
const { registro, login, verificarToken: verificarTokenController } = require('../controllers/auth.controller');
const { verificarToken } = require('../middleware/auth.middleware');

// Rutas públicas
router.post('/registro', registro);
router.post('/login', login);

// Rutas protegidas
router.get('/verificar', verificarToken, verificarTokenController);

module.exports = router;
