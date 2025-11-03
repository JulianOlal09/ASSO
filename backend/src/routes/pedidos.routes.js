const express = require('express');
const router = express.Router();
const {
  crearPedido,
  obtenerPedidos,
  obtenerPedidoPorId,
  actualizarEstadoPedido,
  actualizarEstadoItem,
  cancelarPedido,
  obtenerPedidosCocina
} = require('../controllers/pedidos.controller');
const { verificarToken, verificarRol } = require('../middleware/auth.middleware');

// Crear pedido (puede ser cliente sin autenticación o mesero)
router.post('/', crearPedido);

// Rutas protegidas
router.get('/', verificarToken, obtenerPedidos);
router.get('/cocina', verificarToken, verificarRol('cocina', 'administrador'), obtenerPedidosCocina);
router.get('/:id', verificarToken, obtenerPedidoPorId);
router.put('/:id/estado', verificarToken, verificarRol('cocina', 'mesero', 'administrador'), actualizarEstadoPedido);
router.put('/item/:id/estado', verificarToken, verificarRol('cocina', 'administrador'), actualizarEstadoItem);
router.delete('/:id', verificarToken, verificarRol('mesero', 'administrador'), cancelarPedido);

module.exports = router;
