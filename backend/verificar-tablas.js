// Script para verificar que todas las tablas necesarias existen
const db = require('./src/config/database');

async function verificarTablas() {
  try {
    console.log('🔍 Verificando tablas de la base de datos...\n');

    // Obtener lista de tablas
    const [tablas] = await db.query('SHOW TABLES');
    const nombreTablas = tablas.map(t => Object.values(t)[0]);

    console.log('📋 Tablas encontradas:');
    nombreTablas.forEach(tabla => console.log(`  ✅ ${tabla}`));

    // Tablas requeridas
    const tablasRequeridas = [
      'usuarios',
      'categorias',
      'platillos',
      'mesas',
      'pedidos',
      'detalle_pedidos'
    ];

    console.log('\n🔎 Verificando tablas requeridas:\n');

    let todoOK = true;

    for (const tabla of tablasRequeridas) {
      if (nombreTablas.includes(tabla)) {
        console.log(`  ✅ ${tabla} - EXISTE`);

        // Mostrar estructura de la tabla
        const [estructura] = await db.query(`DESCRIBE ${tabla}`);
        console.log(`     Columnas: ${estructura.map(c => c.Field).join(', ')}`);
      } else {
        console.log(`  ❌ ${tabla} - NO EXISTE`);
        todoOK = false;
      }
    }

    console.log('\n📊 Verificando datos de ejemplo:\n');

    // Verificar categorías
    const [categorias] = await db.query('SELECT COUNT(*) as total FROM categorias');
    console.log(`  Categorías: ${categorias[0].total}`);

    // Verificar platillos
    const [platillos] = await db.query('SELECT COUNT(*) as total FROM platillos');
    console.log(`  Platillos: ${platillos[0].total}`);

    // Verificar mesas
    const [mesas] = await db.query('SELECT COUNT(*) as total FROM mesas');
    console.log(`  Mesas: ${mesas[0].total}`);

    // Verificar usuarios
    const [usuarios] = await db.query('SELECT COUNT(*) as total FROM usuarios');
    console.log(`  Usuarios: ${usuarios[0].total}`);

    if (!todoOK) {
      console.log('\n❌ FALTAN TABLAS!');
      console.log('\n📝 Ejecuta el siguiente comando para crear las tablas:');
      console.log('   mysql -u root -p restaurant_db < backend/database/crear_tablas_completas.sql');
    } else {
      console.log('\n✅ TODAS LAS TABLAS EXISTEN!');

      if (categorias[0].total === 0 || platillos[0].total === 0) {
        console.log('\n⚠️  Faltan datos de ejemplo. Ejecuta:');
        console.log('   mysql -u root -p restaurant_db < backend/database/datos_menu_ejemplo.sql');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);

    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('\n📝 La tabla no existe. Ejecuta:');
      console.log('   mysql -u root -p restaurant_db < backend/database/crear_tablas_completas.sql');
    }

    process.exit(1);
  }
}

verificarTablas();
