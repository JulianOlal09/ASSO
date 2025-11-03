const db = require('../config/database');

// Reporte de ventas por período
const reporteVentas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    let query = `
      SELECT
        DATE(created_at) as fecha,
        COUNT(*) as total_pedidos,
        SUM(total) as total_ventas,
        AVG(total) as promedio_venta
      FROM pedidos
      WHERE estado != 'cancelado'
    `;
    const params = [];

    if (fecha_inicio && fecha_fin) {
      query += ' AND DATE(created_at) BETWEEN ? AND ?';
      params.push(fecha_inicio, fecha_fin);
    }

    query += ' GROUP BY DATE(created_at) ORDER BY fecha DESC';

    const [ventas] = await db.query(query, params);

    // Total general
    const totalGeneral = ventas.reduce((sum, dia) => sum + parseFloat(dia.total_ventas || 0), 0);
    const pedidosGenerales = ventas.reduce((sum, dia) => sum + parseInt(dia.total_pedidos || 0), 0);

    res.json({
      ventas_diarias: ventas,
      resumen: {
        total_ventas: totalGeneral,
        total_pedidos: pedidosGenerales,
        promedio_diario: ventas.length > 0 ? totalGeneral / ventas.length : 0
      }
    });
  } catch (error) {
    console.error('Error al generar reporte de ventas:', error);
    res.status(500).json({ error: 'Error al generar reporte de ventas' });
  }
};

// Platillos más vendidos
const platillosMasVendidos = async (req, res) => {
  try {
    const { limite = 10 } = req.query;

    const [platillos] = await db.query(
      `SELECT
        pl.id,
        pl.nombre,
        pl.precio,
        COUNT(dp.id) as veces_pedido,
        SUM(dp.cantidad) as cantidad_total,
        SUM(dp.subtotal) as ingresos_totales
      FROM detalle_pedidos dp
      INNER JOIN platillos pl ON dp.platillo_id = pl.id
      INNER JOIN pedidos p ON dp.pedido_id = p.id
      WHERE p.estado != 'cancelado'
      GROUP BY pl.id, pl.nombre, pl.precio
      ORDER BY cantidad_total DESC
      LIMIT ?`,
      [parseInt(limite)]
    );

    res.json(platillos);
  } catch (error) {
    console.error('Error al obtener platillos más vendidos:', error);
    res.status(500).json({ error: 'Error al obtener platillos más vendidos' });
  }
};

// Estadísticas generales
const estadisticasGenerales = async (req, res) => {
  try {
    // Total de ventas
    const [[{ total_ventas, total_pedidos }]] = await db.query(
      `SELECT
        COALESCE(SUM(total), 0) as total_ventas,
        COUNT(*) as total_pedidos
      FROM pedidos
      WHERE estado != 'cancelado'`
    );

    // Pedidos por estado
    const [pedidosPorEstado] = await db.query(
      `SELECT
        estado,
        COUNT(*) as cantidad
      FROM pedidos
      GROUP BY estado`
    );

    // Promedio de tiempo de preparación (basado en created_at a cuando todos los items están listos)
    const [[{ promedio_tiempo }]] = await db.query(
      `SELECT
        AVG(TIMESTAMPDIFF(MINUTE, p.created_at, p.updated_at)) as promedio_tiempo
      FROM pedidos p
      WHERE p.estado = 'listo' OR p.estado = 'entregado'`
    );

    // Total de mesas
    const [[{ total_mesas, mesas_ocupadas }]] = await db.query(
      `SELECT
        COUNT(*) as total_mesas,
        SUM(CASE WHEN estado = 'ocupada' THEN 1 ELSE 0 END) as mesas_ocupadas
      FROM mesas`
    );

    res.json({
      ventas: {
        total: parseFloat(total_ventas || 0),
        cantidad_pedidos: parseInt(total_pedidos || 0),
        promedio_por_pedido: total_pedidos > 0 ? total_ventas / total_pedidos : 0
      },
      pedidos_por_estado: pedidosPorEstado,
      tiempo_preparacion: {
        promedio_minutos: parseFloat(promedio_tiempo || 0)
      },
      mesas: {
        total: parseInt(total_mesas || 0),
        ocupadas: parseInt(mesas_ocupadas || 0),
        disponibles: parseInt(total_mesas || 0) - parseInt(mesas_ocupadas || 0)
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas generales:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas generales' });
  }
};

// Reporte de inventario bajo
const inventarioBajo = async (req, res) => {
  try {
    const [items] = await db.query(
      `SELECT
        id,
        nombre,
        cantidad,
        unidad,
        cantidad_minima,
        (cantidad - cantidad_minima) as diferencia
      FROM inventario
      WHERE cantidad <= cantidad_minima
      ORDER BY diferencia ASC`
    );

    res.json(items);
  } catch (error) {
    console.error('Error al obtener inventario bajo:', error);
    res.status(500).json({ error: 'Error al obtener inventario bajo' });
  }
};

// Rendimiento por mesero
const rendimientoMeseros = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    let query = `
      SELECT
        u.id,
        u.nombre,
        COUNT(p.id) as total_pedidos,
        SUM(p.total) as total_ventas,
        AVG(p.total) as promedio_venta
      FROM usuarios u
      LEFT JOIN pedidos p ON u.id = p.mesero_id AND p.estado != 'cancelado'
      WHERE u.rol = 'mesero' AND u.activo = TRUE
    `;
    const params = [];

    if (fecha_inicio && fecha_fin) {
      query += ' AND DATE(p.created_at) BETWEEN ? AND ?';
      params.push(fecha_inicio, fecha_fin);
    }

    query += ' GROUP BY u.id, u.nombre ORDER BY total_ventas DESC';

    const [meseros] = await db.query(query, params);

    res.json(meseros);
  } catch (error) {
    console.error('Error al obtener rendimiento de meseros:', error);
    res.status(500).json({ error: 'Error al obtener rendimiento de meseros' });
  }
};

module.exports = {
  reporteVentas,
  platillosMasVendidos,
  estadisticasGenerales,
  inventarioBajo,
  rendimientoMeseros
};
