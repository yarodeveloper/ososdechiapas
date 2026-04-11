const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);

// Configuración de Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para pasar IO a las rutas
app.use((req, res, next) => {
  req.io = io;
  next();
});

// RUTA AL FRONTEND COMPILADO (relativa al archivo, funciona en dev y prod)
const isWindows = process.platform === 'win32';
const publicPath = path.join(__dirname, '..', '..', 'frontend', 'dist');

console.log(`Modo: ${isWindows ? 'Desarrollo' : 'Producción (VPS)'}`);
console.log(`Sirviendo archivos desde: ${publicPath}`);

// Carpeta de subidas
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Archivos estáticos del frontend
app.use(express.static(publicPath));

// Rutas de la API
const playerRoutes = require('./routes/player.routes');
const categoryRoutes = require('./routes/category.routes');
const userRoutes = require('./routes/user.routes');
const teamRoutes = require('./routes/teams.routes');
const matchRoutes = require('./routes/matches.routes');
const catalogRoutes = require('./routes/catalogs.routes');
const leadRoutes = require('./routes/lead.routes');
const paymentRoutes = require('./routes/payment.routes');
const authRoutes = require('./routes/auth.routes');
const settingsRoutes = require('./routes/settings.routes');
const announcementRoutes = require('./routes/announcement.routes');
const statsRoutes = require('./routes/stats.routes');
const calendarRoutes = require('./routes/calendar.routes');
const socialRoutes = require('./routes/social.routes');

app.use('/api/players', playerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/catalogs', catalogRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/social', socialRoutes);

// CATCH-ALL PARA SPA (SIN ASTERISCOS PARA EVITAR CRASH EN EXPRESS 5)
// Este middleware captura cualquier ruta que no sea de la API y sirve el index.html
app.use((req, res, next) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    return res.sendFile(path.join(publicPath, 'index.html'));
  }
  next();
});

// Lógica de Sockets para tiempo real
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('join_match', (matchId) => {
    socket.join(`match_${matchId}`);
    console.log(`Usuario unido al partido: ${matchId}`);
  });

  socket.on('update_match_state', (data) => {
    // Retransmitir actualización a todos los clientes en ese partido
    io.to(`match_${data.matchId}`).emit('match_updated', data);
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`==== SISTEMA EN LÍNEA ====`);
  console.log(`Puerto: ${PORT}`);
  console.log(`Ruta: ${publicPath}`);
});

module.exports = app;
