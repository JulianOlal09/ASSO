const db = require('../config/database');
const QRCode = require('qrcode');

// Obtener todas las mesas
const obtenerMesas = async (req, res) => {
  try {
    const [mesas] = await db.query(`
      SELECT
        m.*,
        u.nombre as mesero_nombre,
        u.email as mesero_email
      FROM mesas m
      LEFT JOIN usuarios u ON m.mesero_id = u.id
      ORDER BY m.numero
    `);
    res.json(mesas);
  } catch (error) {
    console.error('Error al obtener mesas:', error);
    res.status(500).json({ error: 'Error al obtener mesas' });
  }
};

// Obtener mesa por ID
const obtenerMesaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const [mesas] = await db.query(`
      SELECT
        m.*,
        u.nombre as mesero_nombre,
        u.email as mesero_email
      FROM mesas m
      LEFT JOIN usuarios u ON m.mesero_id = u.id
      WHERE m.id = ?
    `, [id]);

    if (mesas.length === 0) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }

    res.json(mesas[0]);
  } catch (error) {
    console.error('Error al obtener mesa:', error);
    res.status(500).json({ error: 'Error al obtener mesa' });
  }
};

// Crear mesa
const crearMesa = async (req, res) => {
  try {
    const { numero, capacidad, mesero_id } = req.body;

    // Generar código QR único
    const qr_code = `MESA_${numero}_${Date.now()}`;

    const [result] = await db.query(
      'INSERT INTO mesas (numero, capacidad, mesero_id, qr_code) VALUES (?, ?, ?, ?)',
      [numero, capacidad, mesero_id || null, qr_code]
    );

    res.status(201).json({
      message: 'Mesa creada exitosamente',
      id: result.insertId,
      qr_code
    });
  } catch (error) {
    console.error('Error al crear mesa:', error);
    res.status(500).json({ error: 'Error al crear mesa' });
  }
};

// Actualizar mesa
const actualizarMesa = async (req, res) => {
  try {
    const { id } = req.params;
    const { numero, capacidad, estado, mesero_id } = req.body;

    await db.query(
      'UPDATE mesas SET numero = ?, capacidad = ?, estado = ?, mesero_id = ? WHERE id = ?',
      [numero, capacidad, estado, mesero_id || null, id]
    );

    res.json({ message: 'Mesa actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar mesa:', error);
    res.status(500).json({ error: 'Error al actualizar mesa' });
  }
};

// Eliminar mesa
const eliminarMesa = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM mesas WHERE id = ?', [id]);
    res.json({ message: 'Mesa eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar mesa:', error);
    res.status(500).json({ error: 'Error al eliminar mesa' });
  }
};

// Generar código QR para una mesa
const generarQR = async (req, res) => {
  try {
    const { id } = req.params;
    const [mesas] = await db.query('SELECT * FROM mesas WHERE id = ?', [id]);

    if (mesas.length === 0) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }

    const mesa = mesas[0];

    // URL que contendrá el QR (apunta a la página web del menú con el ID de la mesa)
    // En producción, cambiar a tu dominio real
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:4000';
    const url = `${baseUrl}/menu?mesa=${mesa.id}`;

    // Generar QR como imagen
    const qrImage = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 2
    });

    res.json({
      mesa_id: mesa.id,
      numero: mesa.numero,
      qr_code: mesa.qr_code,
      qr_image: qrImage,
      url
    });
  } catch (error) {
    console.error('Error al generar QR:', error);
    res.status(500).json({ error: 'Error al generar código QR' });
  }
};

// Cambiar estado de mesa
const cambiarEstadoMesa = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    await db.query('UPDATE mesas SET estado = ? WHERE id = ?', [estado, id]);

    res.json({ message: 'Estado de mesa actualizado exitosamente' });
  } catch (error) {
    console.error('Error al cambiar estado de mesa:', error);
    res.status(500).json({ error: 'Error al cambiar estado de mesa' });
  }
};

// Obtener pedidos activos de una mesa
const obtenerPedidosMesa = async (req, res) => {
  try {
    const { id } = req.params;

    // Consulta principal de pedidos (sin JSON_ARRAYAGG para compatibilidad con MySQL antiguo)
    const [pedidos] = await db.query(
      `SELECT
        p.id,
        p.mesa_id,
        p.mesero_id,
        p.total,
        p.estado,
        p.notas,
        p.created_at,
        p.updated_at
      FROM pedidos p
      WHERE p.mesa_id = ? AND p.estado != 'cancelado'
      ORDER BY p.created_at DESC`,
      [id]
    );

    // Obtener items para cada pedido
    const pedidosConItems = await Promise.all(
      pedidos.map(async (pedido) => {
        const [items] = await db.query(
          `SELECT
            dp.id,
            dp.platillo_id,
            pl.nombre as platillo_nombre,
            dp.cantidad,
            dp.precio_unitario,
            dp.subtotal,
            dp.estado,
            dp.notas_especiales
          FROM detalle_pedidos dp
          LEFT JOIN platillos pl ON dp.platillo_id = pl.id
          WHERE dp.pedido_id = ?`,
          [pedido.id]
        );

        return {
          ...pedido,
          items: items || []
        };
      })
    );

    res.json(pedidosConItems);
  } catch (error) {
    console.error('Error al obtener pedidos de la mesa:', error);
    res.status(500).json({ error: 'Error al obtener pedidos de la mesa' });
  }
};

// Liberar mesa (cambiar estado a disponible)
const liberarMesa = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si hay pedidos activos
    const [pedidosActivos] = await db.query(
      `SELECT COUNT(*) as total FROM pedidos
       WHERE mesa_id = ? AND estado NOT IN ('entregado', 'cancelado')`,
      [id]
    );

    if (pedidosActivos[0].total > 0) {
      return res.status(400).json({
        error: 'No se puede liberar la mesa porque tiene pedidos activos'
      });
    }

    // Actualizar estado de la mesa a disponible
    await db.query(
      'UPDATE mesas SET estado = ? WHERE id = ?',
      ['disponible', id]
    );

    res.json({
      message: 'Mesa liberada exitosamente',
      mesa_id: id
    });
  } catch (error) {
    console.error('Error al liberar mesa:', error);
    res.status(500).json({ error: 'Error al liberar mesa' });
  }
};

module.exports = {
  obtenerMesas,
  obtenerMesaPorId,
  crearMesa,
  actualizarMesa,
  eliminarMesa,
  generarQR,
  cambiarEstadoMesa,
  obtenerPedidosMesa,
  liberarMesa
};
