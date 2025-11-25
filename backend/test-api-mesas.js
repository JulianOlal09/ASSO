const db = require('./src/config/database');

async function testConsultaMesas() {
  try {
    console.log('🔍 Probando consulta de mesas del controlador...\n');

    // Esta es la misma consulta que usa el controlador
    const [mesas] = await db.query(`
      SELECT
        m.*,
        u.nombre as mesero_nombre,
        u.email as mesero_email
      FROM mesas m
      LEFT JOIN usuarios u ON m.mesero_id = u.id
      ORDER BY m.numero
    `);

    console.log('📊 RESULTADO DE LA CONSULTA:\n');
    console.log('Total de mesas:', mesas.length);
    console.log('\n');

    // Mostrar cada mesa con detalle
    mesas.forEach((mesa, index) => {
      console.log(`Mesa ${index + 1}:`);
      console.log('  - ID:', mesa.id);
      console.log('  - Número:', mesa.numero);
      console.log('  - Capacidad:', mesa.capacidad);
      console.log('  - Estado:', mesa.estado);
      console.log('  - mesero_id:', mesa.mesero_id, `(${typeof mesa.mesero_id})`);
      console.log('  - mesero_nombre:', mesa.mesero_nombre);
      console.log('  - mesero_email:', mesa.mesero_email);
      console.log('  - JSON:', JSON.stringify({
        id: mesa.id,
        numero: mesa.numero,
        mesero_id: mesa.mesero_id,
        mesero_nombre: mesa.mesero_nombre
      }));
      console.log('');
    });

    // Simular lo que recibiría el frontend
    console.log('\n📤 LO QUE SE ENVIARÍA AL FRONTEND:');
    console.log(JSON.stringify(mesas, null, 2));

    await db.end();
    console.log('\n✅ Test completado');
  } catch (error) {
    console.error('❌ Error en test:', error);
    process.exit(1);
  }
}

testConsultaMesas();
