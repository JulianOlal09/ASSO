const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios
const obtenerUsuarios = async (req, res) => {
  try {
    const [usuarios] = await db.query(
      'SELECT id, nombre, email, rol, activo, created_at FROM usuarios ORDER BY nombre'
    );
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Obtener usuario por ID
const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const [usuarios] = await db.query(
      'SELECT id, nombre, email, rol, activo, created_at FROM usuarios WHERE id = ?',
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuarios[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

// Obtener solo meseros activos
const obtenerMeseros = async (req, res) => {
  try {
    const [meseros] = await db.query(
      'SELECT id, nombre, email FROM usuarios WHERE rol = ? AND activo = TRUE ORDER BY nombre',
      ['mesero']
    );
    res.json(meseros);
  } catch (error) {
    console.error('Error al obtener meseros:', error);
    res.status(500).json({ error: 'Error al obtener meseros' });
  }
};

// Actualizar usuario
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, activo } = req.body;

    await db.query(
      'UPDATE usuarios SET nombre = ?, email = ?, rol = ?, activo = ? WHERE id = ?',
      [nombre, email, rol, activo, id]
    );

    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

// Cambiar contraseña
const cambiarPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password_actual, password_nueva } = req.body;

    // Verificar contraseña actual
    const [usuarios] = await db.query('SELECT password FROM usuarios WHERE id = ?', [id]);

    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const passwordValido = await bcrypt.compare(password_actual, usuarios[0].password);

    if (!passwordValido) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password_nueva, salt);

    await db.query('UPDATE usuarios SET password = ? WHERE id = ?', [passwordHash, id]);

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
};

// Eliminar usuario (soft delete)
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE usuarios SET activo = FALSE WHERE id = ?', [id]);
    res.json({ message: 'Usuario desactivado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  obtenerMeseros,
  actualizarUsuario,
  cambiarPassword,
  eliminarUsuario
};
