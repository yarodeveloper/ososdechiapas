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

// Dynamic Frontend Path (Detecting Windows or VPS)
const frontendPath = process.platform === 'win32' 
    ? path.join(__dirname, '..', '..', 'frontend', 'dist')
    : '/home/ososdechiapas.com/public_html';

console.log(`Serving static files from: ${frontendPath}`);

// Serve Static Uploads (Common for both)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Serve Frontend Static Files
app.use(express.static(frontendPath));

// Import Routes
const playerRoutes = require('./routes/player.routes');
const categoryRoutes = require('./routes/category.routes');
const userRoutes = require('./routes/user.routes');
const teamRoutes = require('./routes/teams.routes');
const matchRoutes = require('./routes/matches.routes');
const catalogRoutes = require('./routes/catalogs.routes');
const leadRoutes = require('./routes/lead.routes');

// API Routes
app.use('/api/players', playerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/catalogs', catalogRoutes);
app.use('/api/leads', leadRoutes);

// Catch-all to serve frontend's index.html (Express 5 & Node 24 NO ASTERISKS FIX)
// We use a middleware to avoid the path-to-regexp error entirely
app.use((req, res, next) => {
  // If it's not an API call and not an upload, serve index.html
  if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    return res.sendFile(path.join(frontendPath, 'index.html'));
  }
  next();
});

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  socket.on('join_match', (matchId) => {
    socket.join(`match_${matchId}`);
    console.log(`Socket ${socket.id} se unió al partido ${matchId}`);
  });
  socket.on('update_match_state', (data) => {
    io.to(`match_${data.matchId}`).emit('match_updated', data);
  });
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server (HTTP & Socket.io) running on port ${PORT}`);
});

module.exports = app;
