const express = require('express');
const router = express.Router();
const {
  obtenerCategorias,
  crearCategoria,
  obtenerPlatillos,
  obtenerMenuCompleto,
  obtenerPlatilloPorId,
  crearPlatillo,
  actualizarPlatillo,
  eliminarPlatillo
} = require('../controllers/menu.controller');
const { verificarToken, verificarRol } = require('../middleware/auth.middleware');

// Rutas públicas (para clientes que escanean QR)
router.get('/categorias', obtenerCategorias);
router.get('/platillos', obtenerPlatillos);
router.get('/menu-completo', obtenerMenuCompleto);
router.get('/platillos/:id', obtenerPlatilloPorId);

// Rutas protegidas (solo administradores)
router.post('/categorias', verificarToken, verificarRol('administrador'), crearCategoria);
router.post('/platillos', verificarToken, verificarRol('administrador'), crearPlatillo);
router.put('/platillos/:id', verificarToken, verificarRol('administrador'), actualizarPlatillo);
router.delete('/platillos/:id', verificarToken, verificarRol('administrador'), eliminarPlatillo);

module.exports = router;
