const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function crearAdmin() {
  try {
    // Conectar a MySQL
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Conectado a MySQL');

    // Verificar si el usuario ya existe
    const [usuarios] = await connection.query(
      'SELECT * FROM usuarios WHERE email = ?',
      ['admin@restaurant.com']
    );

    if (usuarios.length > 0) {
      console.log('⚠️  El usuario admin@restaurant.com ya existe. Actualizando...');

      // Actualizar contraseña
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('admin123', salt);

      await connection.query(
        'UPDATE usuarios SET password = ?, activo = TRUE WHERE email = ?',
        [passwordHash, 'admin@restaurant.com']
      );

      console.log('✅ Usuario actualizado exitosamente');
      console.log('📧 Email: admin@restaurant.com');
      console.log('🔑 Password: admin123');
    } else {
      // Crear nuevo usuario
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('admin123', salt);

      await connection.query(
        'INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES (?, ?, ?, ?, ?)',
        ['Administrador', 'admin@restaurant.com', passwordHash, 'administrador', true]
      );

      console.log('✅ Usuario creado exitosamente');
      console.log('📧 Email: admin@restaurant.com');
      console.log('🔑 Password: admin123');
    }

    await connection.end();
    console.log('\n🎉 ¡Listo! Ahora puedes iniciar sesión con estas credenciales.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

crearAdmin();
