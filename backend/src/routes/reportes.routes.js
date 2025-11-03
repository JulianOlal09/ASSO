const express = require('express');
const router = express.Router();
const {
  reporteVentas,
  platillosMasVendidos,
  estadisticasGenerales,
  inventarioBajo,
  rendimientoMeseros
} = require('../controllers/reportes.controller');
const { verificarToken, verificarRol } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación y rol de administrador
router.use(verificarToken);
router.use(verificarRol('administrador'));

router.get('/ventas', reporteVentas);
router.get('/platillos-mas-vendidos', platillosMasVendidos);
router.get('/estadisticas-generales', estadisticasGenerales);
router.get('/inventario-bajo', inventarioBajo);
router.get('/rendimiento-meseros', rendimientoMeseros);

module.exports = router;
