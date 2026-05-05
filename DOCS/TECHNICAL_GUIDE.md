# Manual Técnico - Club Osos de Chiapas

Este documento detalla la arquitectura, base de datos y flujos técnicos del sistema.

## 1. Arquitectura del Sistema
- **Frontend**: React.js con TailwindCSS (Vite).
- **Backend**: Node.js con Express.
- **Base de Datos**: MySQL 8.0+.
- **Tiempo Real**: Socket.io para notificaciones y Live Ticker de partidos.

## 2. Base de Datos y Migraciones
El sistema utiliza un corredor de migraciones personalizado para evitar discrepancias entre servidores.

- **Ubicación**: `backend/migrations/`
- **Comando**: `node src/db/migrationRunner.js` (ejecutar desde la carpeta `backend`).
- **Tabla de Control**: `migrations` (registra qué archivos SQL ya han sido aplicados).

### Tablas Principales
- `users`: Administradores, Coaches y Padres de Familia.
- `players`: Datos personales, estatus de baja y fotos.
- `payments`: Registro de cobros, recibos y estatus de validación.
- `player_stats`: Estadísticas desglosadas por partido.
- `leads`: Prospectos capturados desde la web principal.

## 3. APIs Críticas
- `/api/auth`: Manejo de sesiones y tokens JWT.
- `/api/leads`: Gestión de interesados (público para POST, privado para GET/PUT).
- `/api/payments`: Flujo de validación de tickets y reportes de pago.
- `/api/stats`: Cálculo de promedios, MVPs y visualización de Playcards.

## 4. Configuración de Producción (VPS)
- **SSL**: El sistema asume que corre bajo HTTPS.
- **Proxy Inverso**: Se recomienda Nginx con soporte para WebSockets.
- **Node Process**: Gestionado mediante PM2 (`pm2 start src/app.js`).

---
