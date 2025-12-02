const db = require('../config/database');

// Crear pedido
const crearPedido = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { mesa_id, mesero_id, platillos, notas } = req.body;

    // Crear el pedido
    const [pedidoResult] = await connection.query(
      'INSERT INTO pedidos (mesa_id, mesero_id, notas) VALUES (?, ?, ?)',
      [mesa_id, mesero_id || null, notas || null]
    );

    const pedido_id = pedidoResult.insertId;
    let total = 0;

    // Insertar detalles del pedido
    for (const item of platillos) {
      const [platilloData] = await connection.query(
        'SELECT precio FROM platillos WHERE id = ? AND disponible = TRUE',
        [item.platillo_id]
      );

      if (platilloData.length === 0) {
        await connection.rollback();
        return res.status(400).json({
          error: `El platillo con ID ${item.platillo_id} no está disponible`
        });
      }

      const precio_unitario = platilloData[0].precio;
      const subtotal = precio_unitario * item.cantidad;
      total += subtotal;

      await connection.query(
        `INSERT INTO detalle_pedidos
         (pedido_id, platillo_id, cantidad, precio_unitario, subtotal, notas_especiales)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [pedido_id, item.platillo_id, item.cantidad, precio_unitario, subtotal, item.notas_especiales || null]
      );
    }

    // Actualizar total del pedido
    await connection.query('UPDATE pedidos SET total = ? WHERE id = ?', [total, pedido_id]);

    // Actualizar estado de la mesa
    await connection.query('UPDATE mesas SET estado = ? WHERE id = ?', ['ocupada', mesa_id]);

    await connection.commit();

    // Emitir evento WebSocket para notificar a todos
    const io = req.app.get('io');
    const [pedidoCompleto] = await obtenerDetallePedido(pedido_id);

    if (pedidoCompleto.length > 0) {
      const pedidoData = pedidoCompleto[0];

      // Notificar a la cocina
      io.to('cocina').emit('nuevo-pedido', pedidoData);

      // Notificar al admin
      io.to('admin').emit('nuevo-pedido', pedidoData);

      // Notificar a la mesa específica
      io.to(`mesa-${mesa_id}`).emit('pedido-confirmado', pedidoData);

      // Si hay mesero asignado, notificarlo
      if (mesero_id) {
        io.to(`mesero-${mesero_id}`).emit('nuevo-pedido', pedidoData);
      }

      // Obtener mesero asignado a la mesa
      const [mesaData] = await db.query('SELECT mesero_id FROM mesas WHERE id = ?', [mesa_id]);
      if (mesaData.length > 0 && mesaData[0].mesero_id) {
        io.to(`mesero-${mesaData[0].mesero_id}`).emit('nuevo-pedido', pedidoData);
      }

      console.log(`✅ Pedido ${pedido_id} creado - Notificaciones enviadas`);
    }

    res.status(201).json({
      message: 'Pedido creado exitosamente',
      pedido_id,
      total
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear pedido:', error);
    res.status(500).json({ error: 'Error al crear pedido' });
  } finally {
    connection.release();
  }
};

// Función auxiliar para obtener detalle completo del pedido
const obtenerDetallePedido = async (pedido_id) => {
  // Obtener datos del pedido
  const [pedidos] = await db.query(
    `SELECT
      p.*,
      m.numero as mesa_numero,
      u.nombre as mesero_nombre
    FROM pedidos p
    LEFT JOIN mesas m ON p.mesa_id = m.id
    LEFT JOIN usuarios u ON p.mesero_id = u.id
    WHERE p.id = ?`,
    [pedido_id]
  );

  if (pedidos.length === 0) {
    return [[]];
  }

  // Obtener items del pedido
  const [items] = await db.query(
    `SELECT
      dp.id,
      dp.platillo_id,
      pl.nombre as platillo_nombre,
      dp.cantidad,
      dp.precio_unitario,
      dp.subtotal,
      dp.notas_especiales,
      dp.estado
    FROM detalle_pedidos dp
    LEFT JOIN platillos pl ON dp.platillo_id = pl.id
    WHERE dp.pedido_id = ?`,
    [pedido_id]
  );

  // Combinar pedido con items
  const pedidoCompleto = {
    ...pedidos[0],
    items: items
  };

  return [[pedidoCompleto]];
};

// Obtener todos los pedidos
const obtenerPedidos = async (req, res) => {
  try {
    const { estado, mesa_id } = req.query;

    // Consulta principal de pedidos (sin JSON_ARRAYAGG para compatibilidad)
    let query = `
      SELECT
        p.id,
        p.mesa_id,
        p.mesero_id,
        p.total,
        p.estado,
        p.notas,
        p.created_at,
        p.updated_at,
        m.numero as mesa_numero,
        u.nombre as mesero_nombre
      FROM pedidos p
      LEFT JOIN mesas m ON p.mesa_id = m.id
      LEFT JOIN usuarios u ON p.mesero_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (estado) {
      query += ' AND p.estado = ?';
      params.push(estado);
    }

    if (mesa_id) {
      query += ' AND p.mesa_id = ?';
      params.push(mesa_id);
    }

    query += ' ORDER BY p.created_at DESC';

    const [pedidos] = await db.query(query, params);

    // Obtener items para cada pedido
    const pedidosConItems = await Promise.all(
      pedidos.map(async (pedido) => {
        const [items] = await db.query(
          `SELECT
            dp.id,
            dp.platillo_id,
            pl.nombre,
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
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

// Obtener pedido por ID con detalles
const obtenerPedidoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const [pedidos] = await obtenerDetallePedido(id);

    if (pedidos.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const pedido = pedidos[0];
    res.json(pedido);
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({ error: 'Error al obtener pedido' });
  }
};

// Actualizar estado del pedido
const actualizarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    await db.query('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, id]);

    // Emitir evento WebSocket a todos
    const io = req.app.get('io');
    const [pedido] = await obtenerDetallePedido(id);

    if (pedido.length > 0) {
      const pedidoData = pedido[0];
      const mesa_id = pedidoData.mesa_id;
      const mesero_id = pedidoData.mesero_id;

      // Notificar a todos los interesados
      io.to('cocina').emit('pedido-actualizado', { pedido_id: id, estado, pedido: pedidoData });
      io.to('admin').emit('pedido-actualizado', { pedido_id: id, estado, pedido: pedidoData });
      io.to(`mesa-${mesa_id}`).emit('pedido-actualizado', { pedido_id: id, estado, pedido: pedidoData });

      if (mesero_id) {
        io.to(`mesero-${mesero_id}`).emit('pedido-actualizado', { pedido_id: id, estado, pedido: pedidoData });
      }

      console.log(`✅ Pedido ${id} actualizado a ${estado} - Notificaciones enviadas`);
    }

    res.json({ message: 'Estado del pedido actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    res.status(500).json({ error: 'Error al actualizar estado del pedido' });
  }
};

// Actualizar estado de un ítem del pedido
const actualizarEstadoItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    await db.query('UPDATE detalle_pedidos SET estado = ? WHERE id = ?', [estado, id]);

    // Verificar si todos los items están listos para actualizar el pedido
    const [items] = await db.query('SELECT pedido_id FROM detalle_pedidos WHERE id = ?', [id]);

    if (items.length > 0) {
      const pedido_id = items[0].pedido_id;
      const [todosItems] = await db.query(
        'SELECT estado FROM detalle_pedidos WHERE pedido_id = ?',
        [pedido_id]
      );

      const todosListos = todosItems.every(item => item.estado === 'listo');
      if (todosListos) {
        await db.query('UPDATE pedidos SET estado = ? WHERE id = ?', ['listo', pedido_id]);
      }

      // Emitir evento WebSocket a todos
      const io = req.app.get('io');
      const [pedido] = await obtenerDetallePedido(pedido_id);

      if (pedido.length > 0) {
        const pedidoData = pedido[0];
        const mesa_id = pedidoData.mesa_id;
        const mesero_id = pedidoData.mesero_id;

        const updateData = {
          pedido_id,
          item_id: id,
          estado,
          pedido: pedidoData
        };

        // Notificar a todos
        io.to('cocina').emit('item-actualizado', updateData);
        io.to('admin').emit('item-actualizado', updateData);
        io.to(`mesa-${mesa_id}`).emit('item-actualizado', updateData);

        if (mesero_id) {
          io.to(`mesero-${mesero_id}`).emit('item-actualizado', updateData);
        }

        console.log(`✅ Item ${id} del pedido ${pedido_id} actualizado a ${estado}`);
      }
    }

    res.json({ message: 'Estado del ítem actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar estado del ítem:', error);
    res.status(500).json({ error: 'Error al actualizar estado del ítem' });
  }
};

// Cancelar pedido
const cancelarPedido = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('UPDATE pedidos SET estado = ? WHERE id = ?', ['cancelado', id]);

    res.json({ message: 'Pedido cancelado exitosamente' });
  } catch (error) {
    console.error('Error al cancelar pedido:', error);
    res.status(500).json({ error: 'Error al cancelar pedido' });
  }
};

// Obtener pedidos activos para la cocina
const obtenerPedidosCocina = async (req, res) => {
  try {
    const [pedidos] = await db.query(
      `SELECT
        p.id,
        p.created_at,
        p.estado as pedido_estado,
        m.numero as mesa_numero,
        dp.id as detalle_id,
        dp.cantidad,
        dp.notas_especiales,
        dp.estado as item_estado,
        pl.nombre as platillo_nombre,
        pl.tiempo_preparacion
      FROM pedidos p
      INNER JOIN detalle_pedidos dp ON p.id = dp.pedido_id
      INNER JOIN platillos pl ON dp.platillo_id = pl.id
      INNER JOIN mesas m ON p.mesa_id = m.id
      WHERE p.estado IN ('pendiente', 'en_preparacion', 'listo')
      ORDER BY p.created_at ASC, dp.id`
    );

    res.json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos de cocina:', error);
    res.status(500).json({ error: 'Error al obtener pedidos de cocina' });
  }
};

module.exports = {
  crearPedido,
  obtenerPedidos,
  obtenerPedidoPorId,
  actualizarEstadoPedido,
  actualizarEstadoItem,
  cancelarPedido,
  obtenerPedidosCocina
};
