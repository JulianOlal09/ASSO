const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Permitir todas las origenes para acceso desde celular
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (menú web)
const path = require('path');
app.use(express.static(path.join(__dirname, '../public')));

// Hacer io accesible en las rutas
app.set('io', io);

// Rutas
const authRoutes = require('./routes/auth.routes');
const menuRoutes = require('./routes/menu.routes');
const mesasRoutes = require('./routes/mesas.routes');
const pedidosRoutes = require('./routes/pedidos.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const reportesRoutes = require('./routes/reportes.routes');

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/reportes', reportesRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API de Restaurante funcionando correctamente',
    timestamp: new Date()
  });
});

// Ruta para el menú digital (redirigir /menu a /menu.html)
app.get('/menu', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/menu.html'));
});

// Manejo de WebSockets para actualizaciones en tiempo real
io.on('connection', (socket) => {
  console.log('✅ Cliente conectado:', socket.id);

  // Unirse a sala de cocina
  socket.on('join-cocina', () => {
    socket.join('cocina');
    console.log('👨‍🍳 Cliente unido a sala de cocina:', socket.id);
  });

  // Unirse a sala de administrador
  socket.on('join-admin', () => {
    socket.join('admin');
    console.log('👑 Cliente unido a sala de admin:', socket.id);
  });

  // Unirse a sala de mesero
  socket.on('join-mesero', (meseroId) => {
    socket.join(`mesero-${meseroId}`);
    console.log(`🧑‍💼 Mesero ${meseroId} unido a su sala:`, socket.id);
  });

  // Unirse a sala de mesa específica
  socket.on('join-mesa', (mesaId) => {
    socket.join(`mesa-${mesaId}`);
    console.log(`🪑 Cliente unido a mesa ${mesaId}:`, socket.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado:', socket.id);
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Algo salió mal!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 WebSocket habilitado para actualizaciones en tiempo real`);
  console.log(`📱 Acceso desde tu red local:`);
  console.log(`   - http://localhost:${PORT}/menu?mesa=1`);
  console.log(`   - http://<TU_IP_LOCAL>:${PORT}/menu?mesa=1`);
  console.log(`\n💡 Para obtener tu IP local:`);
  console.log(`   Windows: ipconfig (busca "Dirección IPv4")`);
  console.log(`   Mac/Linux: ifconfig (busca "inet")`);
});

module.exports = { app, io };
