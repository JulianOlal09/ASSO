const express = require('express');
const router = express.Router();
const {
  obtenerMesas,
  obtenerMesaPorId,
  crearMesa,
  actualizarMesa,
  eliminarMesa,
  generarQR,
  cambiarEstadoMesa,
  obtenerPedidosMesa,
  liberarMesa
} = require('../controllers/mesas.controller');
const { verificarToken, verificarRol } = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/:id/pedidos', obtenerPedidosMesa);

// Rutas protegidas
router.get('/', verificarToken, obtenerMesas);
router.get('/:id', verificarToken, obtenerMesaPorId);
router.get('/:id/qr', verificarToken, verificarRol('administrador'), generarQR);
router.post('/', verificarToken, verificarRol('administrador'), crearMesa);
router.put('/:id', verificarToken, verificarRol('administrador'), actualizarMesa);
router.put('/:id/estado', verificarToken, verificarRol('mesero', 'administrador'), cambiarEstadoMesa);
router.put('/:id/liberar', verificarToken, verificarRol('mesero', 'administrador'), liberarMesa);
router.delete('/:id', verificarToken, verificarRol('administrador'), eliminarMesa);

module.exports = router;
