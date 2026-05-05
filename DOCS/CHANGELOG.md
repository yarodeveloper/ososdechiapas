# Bitácora de Cambios (CHANGELOG) - Club Osos de Chiapas

Este documento registra todas las intervenciones, mejoras y correcciones realizadas en el sistema.

---

## [2026-05-04] - Estabilización de Producción y Dashboard de Prospectos

### ✅ Funcionalidades Nuevas
- **Dashboard de Prospectos (Leads)**: Implementación de una bandeja de entrada para gestionar interesados que se registran en la web principal.
- **Integración con WhatsApp**: Botón de contacto directo desde el panel de administración con mensajes pre-configurados.
- **Sistema de Migraciones Automatizado**: Creación de un corredor de scripts SQL para mantener la base de datos sincronizada sin errores manuales.
- **Notificaciones en Tiempo Real**: Alertas visuales y actualización de contadores mediante Socket.io cuando entra un nuevo interesado.
- **Captura de Edad**: Se agregó el campo de "Edad del Jugador" al formulario de la web principal para completar el perfil del prospecto.
- **Iconografía**: Se actualizó el icono de Prospectos a un objetivo ('target') para representar mejor la meta de captación.

### 🚀 Mejoras de Estabilidad
- **Resiliencia en Frontend**: Se blindaron las páginas principales (Dashboard, Roster, Pagos) para evitar errores de tipo "pantalla en blanco" si las APIs fallan.
- **Estandarización de Fechas**: Creación de una utilidad de servidor para formatear fechas compatibles con MySQL, resolviendo errores 500 en la confirmación de pagos.
- **Optimización de WebSockets**: Mejora en la conexión de Socket.io agregando soporte para 'polling' y reintentos automáticos ante fallas de red.

### 🛠️ Correcciones de Errores (Bug Fixes)
- **Error 500 en Reporte de Pagos**: Se corrigió el esquema de la base de datos para aceptar el estatus `validating`.
- **Error 500 en Perfil Familiar**: Se refactorizó la consulta SQL de jugadores para eliminar conflictos con el modo estricto de MySQL (`ONLY_FULL_GROUP_BY`).
- **Mapeo de Datos en Playcard**: Se corrigió el dorsal del jugador y se agregó la foto oficial en la tarjeta de estadísticas.
- **Uploads de PDF**: Se actualizó el middleware de subida de archivos para permitir comprobantes en formato PDF.

### 🎨 Ajustes Visuales
- **Web Principal**: Se cambió el color de títulos y marcadores de partidos a Rojo Osos para mejor contraste.
- **Privacidad**: Se eliminó el "Game Center" público, moviendo la visualización de estadísticas al portal privado.
- **Estadísticas Elite**: Se agregó el desglose de Touchdowns Ofensivos/Defensivos en la vista de jugador.

---
