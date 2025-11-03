const db = require('../config/database');
const QRCode = require('qrcode');

// Obtener todas las mesas
const obtenerMesas = async (req, res) => {
  try {
    const [mesas] = await db.query('SELECT * FROM mesas ORDER BY numero');
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
    const [mesas] = await db.query('SELECT * FROM mesas WHERE id = ?', [id]);

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
    const { numero, capacidad } = req.body;

    // Generar código QR único
    const qr_code = `MESA_${numero}_${Date.now()}`;

    const [result] = await db.query(
      'INSERT INTO mesas (numero, capacidad, qr_code) VALUES (?, ?, ?)',
      [numero, capacidad, qr_code]
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
    const { numero, capacidad, estado } = req.body;

    await db.query(
      'UPDATE mesas SET numero = ?, capacidad = ?, estado = ? WHERE id = ?',
      [numero, capacidad, estado, id]
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

    // URL que contendrá el QR (apunta a la app del cliente con el ID de la mesa)
    const url = `${process.env.FRONTEND_URL || 'http://localhost:19006'}/menu?mesa=${mesa.id}`;

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

    const [pedidos] = await db.query(
      `SELECT
        p.*,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', dp.id,
            'platillo_nombre', pl.nombre,
            'cantidad', dp.cantidad,
            'precio_unitario', dp.precio_unitario,
            'subtotal', dp.subtotal,
            'estado', dp.estado
          )
        ) as items
      FROM pedidos p
      LEFT JOIN detalle_pedidos dp ON p.id = dp.pedido_id
      LEFT JOIN platillos pl ON dp.platillo_id = pl.id
      WHERE p.mesa_id = ? AND p.estado != 'cancelado'
      GROUP BY p.id
      ORDER BY p.created_at DESC`,
      [id]
    );

    // Parsear los items JSON
    const pedidosFormateados = pedidos.map(pedido => ({
      ...pedido,
      items: JSON.parse(pedido.items)
    }));

    res.json(pedidosFormateados);
  } catch (error) {
    console.error('Error al obtener pedidos de la mesa:', error);
    res.status(500).json({ error: 'Error al obtener pedidos de la mesa' });
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
  obtenerPedidosMesa
};
