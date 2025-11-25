const express = require('express');
const router = express.Router();
const {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  obtenerMeseros,
  actualizarUsuario,
  cambiarPassword,
  eliminarUsuario
} = require('../controllers/usuarios.controller');
const { verificarToken, verificarRol } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación y rol de administrador
router.use(verificarToken);

router.get('/', verificarRol('administrador'), obtenerUsuarios);
router.get('/meseros/lista', verificarRol('administrador'), obtenerMeseros);
router.get('/:id', obtenerUsuarioPorId);
router.put('/:id', verificarRol('administrador'), actualizarUsuario);
router.put('/:id/password', cambiarPassword);
router.delete('/:id', verificarRol('administrador'), eliminarUsuario);

module.exports = router;
