// Script para verificar y crear usuarios de prueba
const db = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function verificarYCrearUsuarios() {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...\n');

    // Verificar usuarios existentes
    const [usuarios] = await db.query('SELECT id, nombre, email, rol, activo FROM usuarios');

    if (usuarios.length > 0) {
      console.log('✅ Usuarios encontrados:');
      console.table(usuarios);
    } else {
      console.log('⚠️  No hay usuarios en la base de datos');
    }

    // Crear usuarios de prueba si no existen
    console.log('\n📝 Creando usuarios de prueba...\n');

    const usuariosPrueba = [
      {
        nombre: 'Administrador',
        email: 'admin@test.com',
        password: '123456',
        rol: 'administrador'
      },
      {
        nombre: 'Chef Principal',
        email: 'cocina@test.com',
        password: '123456',
        rol: 'cocina'
      },
      {
        nombre: 'Juan Mesero',
        email: 'mesero@test.com',
        password: '123456',
        rol: 'mesero'
      },
      {
        nombre: 'María Mesera',
        email: 'maria@test.com',
        password: '123456',
        rol: 'mesero'
      }
    ];

    for (const usuario of usuariosPrueba) {
      // Verificar si el usuario ya existe
      const [existe] = await db.query('SELECT id FROM usuarios WHERE email = ?', [usuario.email]);

      if (existe.length > 0) {
        console.log(`⏩ Usuario ${usuario.email} ya existe`);
      } else {
        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(usuario.password, salt);

        // Insertar usuario
        await db.query(
          'INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES (?, ?, ?, ?, TRUE)',
          [usuario.nombre, usuario.email, passwordHash, usuario.rol]
        );
        console.log(`✅ Usuario creado: ${usuario.email} (password: ${usuario.password})`);
      }
    }

    // Mostrar todos los usuarios finales
    console.log('\n📋 Usuarios finales en la base de datos:');
    const [usuariosFinales] = await db.query('SELECT id, nombre, email, rol, activo FROM usuarios');
    console.table(usuariosFinales);

    console.log('\n✅ Proceso completado!');
    console.log('\n📱 Credenciales para iniciar sesión desde el iPhone:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email: admin@test.com');
    console.log('Password: 123456');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verificarYCrearUsuarios();
