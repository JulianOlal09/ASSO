const db = require('../config/database');

// Obtener todas las categorías
const obtenerCategorias = async (req, res) => {
  try {
    const [categorias] = await db.query(
      'SELECT * FROM categorias WHERE activo = TRUE ORDER BY orden'
    );
    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

// Crear categoría
const crearCategoria = async (req, res) => {
  try {
    const { nombre, descripcion, orden } = req.body;
    const [result] = await db.query(
      'INSERT INTO categorias (nombre, descripcion, orden) VALUES (?, ?, ?)',
      [nombre, descripcion, orden || 0]
    );

    res.status(201).json({
      message: 'Categoría creada exitosamente',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
};

// Obtener todos los platillos o por categoría
const obtenerPlatillos = async (req, res) => {
  try {
    const { categoria_id } = req.query;
    let query = `
      SELECT p.*, c.nombre as categoria_nombre
      FROM platillos p
      INNER JOIN categorias c ON p.categoria_id = c.id
      WHERE p.disponible = TRUE
    `;
    const params = [];

    if (categoria_id) {
      query += ' AND p.categoria_id = ?';
      params.push(categoria_id);
    }

    query += ' ORDER BY c.orden, p.nombre';

    const [platillos] = await db.query(query, params);
    res.json(platillos);
  } catch (error) {
    console.error('Error al obtener platillos:', error);
    res.status(500).json({ error: 'Error al obtener platillos' });
  }
};

// Obtener menú completo (categorías con sus platillos)
const obtenerMenuCompleto = async (req, res) => {
  try {
    const [categorias] = await db.query(
      'SELECT * FROM categorias WHERE activo = TRUE ORDER BY orden'
    );

    const menu = await Promise.all(
      categorias.map(async (categoria) => {
        const [platillos] = await db.query(
          'SELECT * FROM platillos WHERE categoria_id = ? AND disponible = TRUE',
          [categoria.id]
        );
        return {
          ...categoria,
          platillos
        };
      })
    );

    res.json(menu);
  } catch (error) {
    console.error('Error al obtener menú completo:', error);
    res.status(500).json({ error: 'Error al obtener menú completo' });
  }
};

// Obtener platillo por ID
const obtenerPlatilloPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const [platillos] = await db.query(
      `SELECT p.*, c.nombre as categoria_nombre
       FROM platillos p
       INNER JOIN categorias c ON p.categoria_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    if (platillos.length === 0) {
      return res.status(404).json({ error: 'Platillo no encontrado' });
    }

    res.json(platillos[0]);
  } catch (error) {
    console.error('Error al obtener platillo:', error);
    res.status(500).json({ error: 'Error al obtener platillo' });
  }
};

// Crear platillo
const crearPlatillo = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      precio,
      categoria_id,
      imagen_url,
      tiempo_preparacion,
      ingredientes,
      alergenos
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO platillos
       (nombre, descripcion, precio, categoria_id, imagen_url, tiempo_preparacion, ingredientes, alergenos)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion, precio, categoria_id, imagen_url, tiempo_preparacion, ingredientes, alergenos]
    );

    res.status(201).json({
      message: 'Platillo creado exitosamente',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error al crear platillo:', error);
    res.status(500).json({ error: 'Error al crear platillo' });
  }
};

// Actualizar platillo
const actualizarPlatillo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      precio,
      categoria_id,
      imagen_url,
      disponible,
      tiempo_preparacion,
      ingredientes,
      alergenos
    } = req.body;

    await db.query(
      `UPDATE platillos SET
       nombre = ?, descripcion = ?, precio = ?, categoria_id = ?,
       imagen_url = ?, disponible = ?, tiempo_preparacion = ?,
       ingredientes = ?, alergenos = ?
       WHERE id = ?`,
      [nombre, descripcion, precio, categoria_id, imagen_url, disponible, tiempo_preparacion, ingredientes, alergenos, id]
    );

    res.json({ message: 'Platillo actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar platillo:', error);
    res.status(500).json({ error: 'Error al actualizar platillo' });
  }
};

// Eliminar platillo (soft delete)
const eliminarPlatillo = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE platillos SET disponible = FALSE WHERE id = ?', [id]);
    res.json({ message: 'Platillo eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar platillo:', error);
    res.status(500).json({ error: 'Error al eliminar platillo' });
  }
};

module.exports = {
  obtenerCategorias,
  crearCategoria,
  obtenerPlatillos,
  obtenerMenuCompleto,
  obtenerPlatilloPorId,
  crearPlatillo,
  actualizarPlatillo,
  eliminarPlatillo
};
