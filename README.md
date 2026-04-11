# 🐻 Club Osos de Chiapas — Sistema de Gestión

**Plataforma web integral para la administración del Club de Fútbol Americano Osos de Chiapas.**  
Gestión de jugadores, padres de familia, pagos, estadísticas, calendario, comunicados y portal privado para familias.

---

## 🏗️ Arquitectura General

El sistema está dividido en dos partes que corren en el mismo servidor bajo una sola URL:

```
public_html/
├── backend/        → API REST (Node.js + Express)
│   └── src/app.js  → Punto de entrada. Sirve también el frontend compilado.
└── frontend/       → Interfaz React (compilada en /frontend/dist)
```

El backend sirve directamente los archivos estáticos del frontend desde `frontend/dist`. **No hay servidor web separado para el frontend** — Node.js es el único proceso que corre.

---

## 🖥️ Entorno del Servidor

| Componente | Versión / Detalle |
|---|---|
| **Sistema Operativo** | AlmaLinux 9 |
| **Node.js** | v22.x |
| **Gestor de procesos** | PM2 |
| **Base de datos** | MySQL 8 |
| **Panel de hosting** | cPanel / DirectAdmin |
| **Certificado SSL** | Let's Encrypt (HTTPS) |
| **Dominio** | ososdechiapas.com |
| **Ruta en servidor** | `/home/ososdechiapas.com/public_html/` |

---

## ⚙️ Stack Tecnológico

### Backend
| Librería | Versión | Función |
|---|---|---|
| **Express** | ^5.2.1 | Framework HTTP y API REST |
| **mysql2** | ^3.20.0 | Conexión a base de datos MySQL |
| **socket.io** | ^4.8.3 | Tiempo real (marcadores en vivo) |
| **multer** | ^2.1.1 | Subida de archivos (comprobantes de pago, logos) |
| **helmet** | ^8.1.0 | Seguridad HTTP headers |
| **cors** | ^2.8.6 | Control de orígenes cruzados |
| **morgan** | ^1.10.1 | Logging de requests HTTP |
| **dotenv** | ^17.3.1 | Variables de entorno |
| **nodemon** | ^3.1.14 | Recarga automática en desarrollo |

### Frontend
| Librería | Versión | Función |
|---|---|---|
| **React** | ^19.2.4 | UI Component library |
| **Vite** | ^8.0.2 | Bundler y dev server |
| **@vitejs/plugin-react** | ^6.0.1 | Plugin de React para Vite |
| **React Router DOM** | ^7.13.2 | Navegación client-side (SPA) |
| **Tailwind CSS** | ^3.4.19 | Utilidades de estilos CSS |
| **Framer Motion** | ^12.38.0 | Animaciones de interfaz |
| **Lucide React** | ^1.0.1 | Íconos SVG |
| **Chart.js + react-chartjs-2** | ^4.5.1 | Gráficas de estadísticas |
| **Socket.io Client** | ^4.8.3 | Tiempo real en cliente |
| **react-social-media-embed** | ^2.5.18 | Muro social (Instagram, etc.) |
| **Axios** | ^1.13.6 | Cliente HTTP |
| **vite-plugin-pwa** | ^1.2.0 | Progressive Web App (instalable) |

---

## 🗄️ Base de Datos

**Nombre:** `clubosos_db`  
**Motor:** MySQL 8 con charset `utf8mb4_unicode_ci`

### Tablas principales

| Tabla | Descripción |
|---|---|
| `users` | Usuarios del sistema (padres/tutores, coaches, admins). Rol: `family`, `coach`, `admin` |
| `players` | Jugadores vinculados a un padre/tutor (`user_id`) y a una categoría |
| `categories` | Categorías del club (Infantil, Juvenil, etc.) |
| `leagues` | Ligas y torneos en los que participa el club |
| `teams` | Equipos rivales con logo, color y estadio |
| `matches` | Partidos: local vs visitante, fecha, marcador, estado |
| `match_events` | Jugadas y eventos dentro de un partido (para control de marcador en vivo) |
| `player_stats` | Estadísticas individuales por jugador por partido (TDs, yardas, tackles, etc.) |
| `payments` | Cargos económicos asignados a padres. Estados: `pending`, `paid`, `validating`, `late` |
| `announcements` | Comunicados del club. Campos: `title`, `body`, `tag`, `image_url`, `created_at` |
| `calendar_events` | Eventos del calendario: partidos, prácticas, reuniones, viajes |
| `settings` | Configuración del club (nombre, colores, datos de transferencia bancaria) |
| `social_posts` | Posts del muro social (Instagram embed, etc.) |
| `catalogs_positions` | Catálogo de posiciones de fútbol americano (QB, RB, WR, etc.) |
| `catalogs_blood_types` | Tipos de sangre para expediente del jugador |

### Roles de usuarios (`users.role`)
| Valor | Descripción |
|---|---|
| `family` | Padre o tutor de un jugador. Accede al Portal Familiar |
| `coach` | Coach o staff técnico. Accede al Panel Admin |
| `admin` | Administrador total del sistema |

---

## 🗂️ Estructura de Carpetas

```
public_html/
├── backend/
│   ├── src/
│   │   ├── app.js                  → Servidor principal, rutas API, Socket.io
│   │   ├── config/
│   │   │   └── db.js               → Pool de conexiones MySQL
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── announcement.controller.js
│   │   │   ├── calendar.controller.js
│   │   │   ├── matches.controller.js
│   │   │   ├── payment.controller.js
│   │   │   ├── player.controller.js
│   │   │   ├── stats.controller.js
│   │   │   ├── teams.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── category.controller.js
│   │   │   ├── settings.controller.js
│   │   │   ├── social.controller.js
│   │   │   └── catalogs.controller.js
│   │   ├── routes/                 → Definición de endpoints REST
│   │   ├── middlewares/            → Auth, upload de archivos
│   │   └── scripts/               → Seeds y migraciones
│   ├── uploads/                    → Archivos subidos (comprobantes, logos, fotos)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/                  → Todas las vistas (ver sección de módulos)
│   │   ├── components/             → Componentes reutilizables
│   │   ├── index.css               → Estilos globales + variables CSS
│   │   ├── App.jsx                 → Router principal
│   │   └── main.jsx                → Entry point React
│   ├── public/
│   │   ├── sitemap.xml             → SEO Sitemap
│   │   ├── robots.txt              → Control de crawlers
│   │   ├── manifest.webmanifest    → PWA manifest
│   │   └── icons/                  → Íconos SVG del sistema
│   ├── dist/                       → Build de producción (ignorado en Git)
│   ├── index.html                  → HTML base (incluye Google Analytics)
│   ├── vite.config.js              → Configuración Vite + PWA + proxy
│   └── package.json
│
└── schema.sql                      → Schema inicial de la base de datos
```

---

## 📡 API REST — Endpoints principales

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/auth/login` | Login de usuario |
| `GET` | `/api/players` | Lista de jugadores |
| `POST` | `/api/players` | Crear jugador (y crea el usuario padre si no existe) |
| `GET` | `/api/players/:id` | Detalle de jugador |
| `PUT` | `/api/players/:id` | Actualizar jugador |
| `GET` | `/api/users/parents` | Lista de padres/tutores (`role = 'family'`) |
| `POST` | `/api/users/parents` | Crear padre manualmente |
| `GET` | `/api/payments` | Lista de todos los cargos |
| `POST` | `/api/payments` | Crear nuevo cargo a un padre |
| `PUT` | `/api/payments/:id` | Actualizar estado de pago |
| `PUT` | `/api/payments/:id/report` | Padre sube comprobante de pago |
| `GET` | `/api/announcements` | Lista de comunicados |
| `POST` | `/api/announcements` | Crear comunicado |
| `GET` | `/api/categories` | Categorías del club |
| `GET` | `/api/teams` | Equipos rivales |
| `GET` | `/api/matches` | Partidos |
| `GET` | `/api/calendar` | Eventos del calendario |
| `GET` | `/api/stats` | Estadísticas generales |
| `GET` | `/api/settings` | Configuración del club |
| `PUT` | `/api/settings` | Actualizar configuración |

---

## 📱 Módulos del Sistema

### Panel Administrador (`/admin/*`)
| Módulo | Ruta | Descripción |
|---|---|---|
| **Dashboard** | `/admin/dashboard` | Vista principal: próximo partido, resultados, accesos rápidos |
| **Roster (Jugadores)** | `/players/list` | Lista completa de jugadores con búsqueda y filtro por categoría |
| **Detalle Jugador** | `/players/:id` | Expediente completo: datos, foto, posición, categoría, tutor |
| **Agregar Jugador** | `/players/new` | Formulario de alta de jugador + creación automática de cuenta de tutor |
| **Pagos / Finanzas** | `/admin/payments` | Gestión de cargos: crear, liquidar, aprobar comprobantes |
| **Comunicados** | `/admin/announcements` | Crear y gestionar avisos con imagen, tag y descripción |
| **Calendario** | `/admin/calendar` | Programar partidos, prácticas y eventos del club |
| **Estadísticas** | `/estadisticas` | Centro de estadísticas públicas por jugador y categoría |
| **Captura Stats** | `/admin/matches/:id/stats` | Captura de estadísticas individuales por partido |
| **Control Marcador** | `/admin/score-control/:id` | Control de marcador en tiempo real durante el partido |
| **Equipos Rivales** | `/teams/list` | Catálogo de equipos rivales |
| **Categorías** | `/admin/categories` | Administrar categorías y ligas |
| **Configuración** | `/admin/settings` | Datos del club, información bancaria para pagos, cambio de contraseña |

### Portal Familiar (`/portal/*`)
| Módulo | Ruta | Descripción |
|---|---|---|
| **Dashboard Portal** | `/portal` | Vista de bienvenida familiar: saldo, últimos avisos, accesos |
| **Mis Pagos** | `/portal/payments` | Estado de cuenta: cargos pendientes y pagados |
| **Reportar Pago** | `/portal/payments/:id/report` | Subir comprobante de transferencia |
| **Avisos** | `/portal/avisos` | Comunicados del club |
| **Agenda** | `/portal/agenda` | Calendario de partidos y eventos |
| **Perfil Familiar** | `/portal/perfil` | Datos del tutor y jugadores vinculados |
| **PlayCard** | `/portal/player/:id/playcard` | Tarjeta digital del jugador (estilo trading card) |

### Público
| Módulo | Ruta | Descripción |
|---|---|---|
| **Home** | `/` | Página principal pública: próximo partido, muro social Instagram, estadísticas |
| **Game Center** | `/game-center/:id` | Vista pública del marcador en vivo (para proyectar en estadio con QR) |
| **Estadísticas** | `/estadisticas` | Estadísticas públicas de jugadores |
| **Login** | `/login` | Acceso al sistema |
| **Registro** | `/registro` | Formulario público de registro de jugador |

---

## 🚀 Despliegue en Producción

### Primera vez (instalación desde cero)

```bash
# 1. Clonar el repositorio
cd /home/ososdechiapas.com/public_html
git clone https://github.com/yarodeveloper/ososdechiapas.git .

# 2. Crear la base de datos
mysql -u root -p < schema.sql

# 3. Configurar variables de entorno del backend
cp backend/.env.example backend/.env
# Editar backend/.env con los datos de MySQL

# 4. Instalar dependencias del backend
cd backend && npm install

# 5. Instalar y compilar el frontend
cd ../frontend
npm install --legacy-peer-deps
npm run build

# 6. Iniciar el servidor con PM2
cd ../backend
pm2 start src/app.js --name "clubosos-api"
pm2 save
pm2 startup
```

### Actualización de cambios (deploy rutinario)

```bash
cd /home/ososdechiapas.com/public_html

# 1. Bajar cambios de GitHub
git pull origin main

# 2. Reiniciar backend (si hubo cambios en /backend)
pm2 restart all

# 3. Recompilar frontend (si hubo cambios en /frontend)
cd frontend
npm install --legacy-peer-deps
npm run build
```

---

## 🔧 Variables de Entorno (`backend/.env`)

```env
DB_HOST=localhost
DB_USER=osos_user
DB_PASSWORD=tu_password_aqui
DB_NAME=clubosos_db
DB_PORT=3306
PORT=3001
JWT_SECRET=tu_clave_secreta_jwt
```

---

## 📊 Analytics y SEO

- **Google Analytics:** ID `G-9T61ZKMJSF` — integrado en `frontend/index.html`
- **Sitemap:** `https://ososdechiapas.com/sitemap.xml` (subido a Google Search Console)
- **robots.txt:** Indexa solo rutas públicas, bloquea `/admin/`, `/portal/`, `/api/`

---

## 🔴 Identidad Visual

| Token | Valor | Uso |
|---|---|---|
| `--primary` | `#e60000` | Rojo principal (equivalente a `red-600` en Tailwind) |
| `--bg-dark` | `#0a0a0a` | Fondo negro mate |
| `--bg-surface` | `#141414` | Superficie de tarjetas |
| Fuente display | **Outfit** (Google Fonts) | Títulos, botones, números |
| Fuente texto | **Inter** (Google Fonts) | Cuerpo de texto |

---

## 📝 Notas Técnicas Importantes

1. **El backend sirve el frontend:** `app.js` usa `express.static(frontend/dist)` y un catch-all para rutas de la SPA. No se necesita Apache/Nginx para el frontend.
2. **Socket.io** está activo en puerto `3001` para el Game Center en tiempo real.
3. **Multer** guarda archivos en `backend/uploads/images/`. Este directorio debe tener permisos de escritura (`chmod 755`).
4. **PWA:** La app es instalable en móviles como app nativa gracias a `vite-plugin-pwa`.
5. **`npm install --legacy-peer-deps`** es requerido debido a que `react-social-media-embed` aún no soporta React 19 oficialmente.
6. **Roles de usuario:** El valor real en base de datos es `family` (no `parent`) para padres/tutores, `coach` y `admin`.

---

*Última actualización: Abril 2026*
