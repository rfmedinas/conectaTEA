# 🧩 ConectaTEA — Backend API v4

> API REST + WebSocket para ConectaTEA. v4 incluye subcarpetas en Lectoscritura, submétricas por área y soporte para el módulo "¡A Divertirnos!".

## Estructura

```
src/
├── index.js               ← Express + Socket.io (puerto 4000)
├── config/
│   ├── database.js        ← SQLite (dev) / PostgreSQL (prod)
│   ├── logger.js          ← Winston
│   ├── socket.js          ← Notificaciones tiempo real
│   └── seed.js            ← Datos de demo
├── models/ (21 modelos)
│   ├── Actividad.js       ← +subcarpeta, +tipo lectura/escritura/diversion ⭐v4
│   ├── Nino.js            ← +nivel_lectura, nivel_escritura, nivel_matematicas ⭐v4
│   └── ...
├── controllers/ (15)
│   ├── actividad.controller.js   ← +listarPorArea, +subcarpeta logic ⭐v4
│   ├── nino.controller.js        ← +niveles_lectomatem en respuesta ⭐v4
│   └── ...
├── middlewares/ (5)
└── routes/ (16)
    └── actividad.routes.js       ← +GET /por-area/:slug ⭐v4
```

## Instalación rápida

```bash
npm install
cp .env.example .env
npm run seed    # datos de demo
npm run dev     # puerto 4000
```

## Cuentas de demo

| Rol | Email | Pass |
|-----|-------|------|
| 👩 Familia | maria@familia.com | Test1234! |
| 🧑‍⚕️ Terapeuta | ana@terapeuta.com | Test1234! |
| 🧑‍🏫 Docente | laura@colegio.edu | Test1234! |
| ⚙️ Admin | admin@conectatea.app | Test1234! |

## Endpoints clave

```
POST /api/v1/auth/login
GET  /api/v1/ninos/:id/progreso          ← incluye niveles_lectomatem ⭐v4
GET  /api/v1/actividades/por-area/:slug  ← nuevo en v4 ⭐
POST /api/v1/actividades/completar
GET  /api/v1/areas
GET  /api/v1/red-apoyo
GET  /api/v1/blog
GET  /api/v1/notificaciones
```

## Cambios v4

1. **`Actividad.subcarpeta`** — agrupa actividades en lectomatem: Lectura / Escritura / Matemáticas
2. **`Nino.nivel_lectura/escritura/matematicas`** — submétricas individuales
3. **`GET /actividades/por-area/:slug`** — devuelve actividades agrupadas por nivel y subcarpeta
4. **ENUM tipo** — nuevos valores: `lectura`, `escritura`, `diversion`
5. **`/ninos/:id/progreso`** — respuesta extendida con `niveles_lectomatem`

## Producción (PostgreSQL)

```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_NAME=conectatea_db
DB_USER=conectatea_user
DB_PASSWORD=tu_clave
JWT_SECRET=clave_larga_segura
NODE_ENV=production
```
