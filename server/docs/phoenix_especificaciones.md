# Phoenix — Especificaciones (contratos de la API)

> Este documento define el **modelo de datos** y el **contrato JSON** (request/response) de cada endpoint. Las validaciones, permisos, máquina de estados y cálculos están en `phoenix_reglas_negocio.md` — este documento no repite el *por qué*, solo el *shape*.

---

## 1. Estándar de respuesta

Toda respuesta del backend sigue esta forma:

```json
// Éxito
{ "success": true, "message": "string", "data": { ... } | [ ... ] | null }

// Error
{ "success": false, "message": "string", "errors": { ... } | null }
```

Prefijo de versión: `/api/v1/`.

---

## 2. Modelo de datos (entidades)

| Entidad | Campos principales |
|---|---|
| Usuario | id, nombre, email, passwordHash, fechaRegistro |
| Categoria | id, usuarioId, nombre |
| MotivoAbandono | id, nombre *(catálogo fijo, solo lectura)* |
| Proyecto | id, usuarioId, categoriaId, nombre, descripcion, objetivo, prioridad, fechaInicio, fechaObjetivo, estado, motivoAbandonoId, motivoAbandonoDetalle, fechaUltimoAvance |
| Avance | id, proyectoId, fecha, descripcion, notas, dificultades |
| Tarea | id, proyectoId, nombre, peso, completado, orden, fechaCompletado |
| HistorialCambio | id, proyectoId, campoModificado, valorAnterior, valorNuevo, fecha |

Campos calculados (no almacenados, se agregan en las respuestas de Proyecto): `progreso`, `diasRestantesObjetivo` — ver `phoenix_reglas_negocio.md` §5 para la fórmula.

---

## 3. Auth

### POST /api/v1/auth/registro
**Request:** `{ "nombre": "Ana Torres", "email": "ana@mail.com", "password": "unpassword123" }`
**Response 201:**
```json
{
  "success": true,
  "message": "Usuario registrado correctamente",
  "data": {
    "usuario": { "id": 1, "nombre": "Ana Torres", "email": "ana@mail.com", "fechaRegistro": "2026-07-12T10:00:00Z" },
    "token": "eyJhbGciOi..."
  }
}
```
**Errores:** 400.

### POST /api/v1/auth/login
**Request:** `{ "email": "ana@mail.com", "password": "unpassword123" }`
**Response 200:** mismo shape que registro (`usuario` + `token`).
**Errores:** 401.

### POST /api/v1/auth/logout
**Response 200:** `{ "success": true, "message": "Sesion cerrada", "data": null }`

---

## 4. Usuarios

### GET /api/v1/usuarios/perfil
Requiere token. **Response 200:** `data` = usuario (sin passwordHash).

### PUT /api/v1/usuarios/perfil
**Request:** `{ "nombre": "Ana T." }`
**Response 200:** usuario actualizado.

### PATCH /api/v1/usuarios/password
**Request:** `{ "passwordActual": "unpassword123", "passwordNueva": "otropassword456" }`
**Response 200:** `{ "success": true, "message": "Contrasena actualizada", "data": null }`
**Errores:** 401, 400.

---

## 5. Categorías

### GET /api/v1/categorias
**Response 200:** `data` = array de categorías del usuario.

### POST /api/v1/categorias
**Request:** `{ "nombre": "Freelance" }` → **Response 201:** categoría creada.

### PUT /api/v1/categorias/{id}
**Request:** `{ "nombre": "Freelance 2026" }` → **Response 200:** categoría actualizada.

### DELETE /api/v1/categorias/{id}
**Response 200:** `{ "success": true, "message": "Categoria eliminada", "data": null }`

---

## 6. Proyectos

### GET /api/v1/proyectos
Query params: `categoria`, `estado`, `prioridad`, `page`, `limit`, `orderBy`.
**Response 200:**
```json
{
  "success": true, "message": "OK",
  "data": {
    "proyectos": [ { "id": 1, "nombre": "...", "estado": "activo", "progreso": 40, "diasRestantesObjetivo": 12, "...": "..." } ],
    "paginacion": { "page": 1, "limit": 20, "total": 57, "totalPages": 3 }
  }
}
```

### GET /api/v1/proyectos/{id}
**Response 200:** `data` = proyecto completo, incluyendo `progreso`, `diasRestantesObjetivo`, y `categoria` embebida (no solo el id).

### POST /api/v1/proyectos
**Request:** `{ "nombre": "...", "descripcion": "...", "objetivo": "...", "categoriaId": 2, "prioridad": "alta", "fechaInicio": "2026-07-01", "fechaObjetivo": "2026-09-01" }`
**Response 201:** proyecto creado, `estado: "activo"` por default.

### PUT /api/v1/proyectos/{id}
Mismos campos que POST, todos opcionales.

### PATCH /api/v1/proyectos/{id}/archivar
Sin body. **Response 200:** proyecto con `estado: "archivado"`.

### PATCH /api/v1/proyectos/{id}/estado
**Request:** `{ "estado": "abandonado", "motivoAbandonoId": 3, "motivoAbandonoDetalle": "Perdi el interes" }`

### PATCH /api/v1/proyectos/{id}/reabrir
Sin body. **Response 200:** proyecto con `estado: "activo"`.

---

## 7. Avances

### GET /api/v1/proyectos/{id}/avances
Query: `page`, `limit`. **Response 200:** avances ordenados por `fecha DESC`.

### POST /api/v1/proyectos/{id}/avances
**Request:** `{ "descripcion": "Termine el modulo de auth", "notas": "...", "dificultades": "...", "fecha": "2026-07-10T18:00:00Z" }` (`fecha` opcional)
**Response 201:** avance creado.

### PUT /api/v1/avances/{id}
**Request:** `{ "descripcion": "...", "notas": "...", "dificultades": "..." }` (sin `fecha` — no editable después de creado).

### DELETE /api/v1/avances/{id}
**Response 200** o **400** según reglas de negocio.

---

## 8. Tareas

### GET /api/v1/proyectos/{id}/tareas
**Response 200:** `data` = array de tareas, ordenadas por `orden`.

### POST /api/v1/proyectos/{id}/tareas
**Request:** `{ "nombre": "Implementar auth", "peso": 3, "orden": 1 }`

### PUT /api/v1/tareas/{id}
**Request:** `{ "nombre": "...", "peso": 4, "orden": 2 }`

### PATCH /api/v1/tareas/{id}/completar
**Request:** `{ "completado": true }`

### DELETE /api/v1/tareas/{id}
**Response 200.**

---

## 9. Historial

### GET /api/v1/proyectos/{id}/historial
**Response 200:** `data` = array de `{ campoModificado, valorAnterior, valorNuevo, fecha }`, ordenado por fecha DESC.

---

## 10. Catálogos

### GET /api/v1/catalogos/motivos-abandono
**Response 200:** `data` = array fijo `[{ "id": 1, "nombre": "Falta de tiempo" }, ...]`.

---

## 11. Dashboard

### GET /api/v1/dashboard/resumen
**Response 200:** `{ "activos": 12, "abandonados": 8, "finalizados": 5, "archivados": 3 }`

### GET /api/v1/dashboard/actividad-reciente
Query: `limit`. **Response 200:** array mixto de avances y cambios de estado, cada item con `tipo` (`"avance" | "cambio_estado"`).

### GET /api/v1/dashboard/proximos-objetivos
**Response 200:** proyectos activos con `fecha_objetivo` próxima, ordenados ascendente.

---

## 12. Estadísticas

- `GET /estadisticas/por-categoria` → `[{ "categoria": "Freelance", "cantidad": 5 }]`
- `GET /estadisticas/motivos-abandono` → `[{ "motivo": "Falta de tiempo", "cantidad": 4 }]`
- `GET /estadisticas/tiempo-promedio-abandono` → `{ "diasPromedio": 23 }`
- `GET /estadisticas/completados-por-anio` → `[{ "anio": 2025, "cantidad": 7 }]`

---

## 13. Búsqueda

### GET /api/v1/proyectos/buscar
Query: `query`, `categoria`, `estado`, `page`, `limit`. Mismo shape que `GET /proyectos`.
