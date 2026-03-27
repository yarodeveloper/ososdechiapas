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
    origin: "*", // En un entorno de producción, especifica el dominio del frontend
    methods: ["GET", "POST"]
  }
});

// Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Serve Frontend Static Files (Vite dist)
const frontendPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(frontendPath));

// API Routes
app.use('/api/players', playerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/catalogs', catalogRoutes);
app.use('/api/leads', leadRoutes);

// Catch-all to serve frontend's index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
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
