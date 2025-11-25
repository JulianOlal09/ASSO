const db = require('./src/config/database');

async function verificarMesasYMeseros() {
  try {
    console.log('🔍 Verificando mesas y meseros...\n');

    // Obtener todas las mesas con información del mesero
    const [mesas] = await db.query(`
      SELECT
        m.id,
        m.numero,
        m.capacidad,
        m.estado,
        m.mesero_id,
        u.nombre as mesero_nombre,
        u.email as mesero_email,
        u.rol as mesero_rol
      FROM mesas m
      LEFT JOIN usuarios u ON m.mesero_id = u.id
      ORDER BY m.numero
    `);

    console.log('📊 TODAS LAS MESAS:\n');
    console.table(mesas);

    // Mesas con mesero asignado
    const mesasConMesero = mesas.filter(m => m.mesero_id !== null);
    console.log(`\n✅ Mesas con mesero asignado: ${mesasConMesero.length}`);
    if (mesasConMesero.length > 0) {
      console.table(mesasConMesero);
    }

    // Mesas sin mesero
    const mesasSinMesero = mesas.filter(m => m.mesero_id === null);
    console.log(`\n⚠️  Mesas sin mesero asignado: ${mesasSinMesero.length}`);
    if (mesasSinMesero.length > 0) {
      console.table(mesasSinMesero.map(m => ({
        id: m.id,
        numero: m.numero,
        estado: m.estado,
        capacidad: m.capacidad
      })));
    }

    // Obtener todos los meseros
    const [meseros] = await db.query(`
      SELECT id, nombre, email, rol
      FROM usuarios
      WHERE rol = 'mesero'
      ORDER BY nombre
    `);

    console.log(`\n👥 MESEROS DISPONIBLES: ${meseros.length}\n`);
    console.table(meseros);

    await db.end();
    console.log('\n✅ Verificación completada');
  } catch (error) {
    console.error('❌ Error al verificar:', error);
    process.exit(1);
  }
}

verificarMesasYMeseros();
