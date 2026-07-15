# Phoenix — Reglas de negocio

> Este documento define el *por qué* y el *cómo* de cada regla — validaciones, permisos, transiciones de estado, fórmulas de cálculo. Los contratos JSON (shape de request/response) están en `phoenix_especificaciones.md`. Los flujos completos end-to-end están en `phoenix_casos_uso.md`.

---

## 1. Convención de permisos

Cuando un usuario intenta acceder/modificar un recurso (proyecto, avance, tarea, categoría) que no le pertenece, el backend responde **404** (no 403), con el mismo mensaje que si el recurso no existiera. Mismo criterio que en login: no se confirma la existencia de un recurso ajeno.

---

## 2. Auth

- `nombre`: requerido, 2–150 caracteres.
- `email`: requerido, formato válido, único (normalizado a minúsculas antes de guardar).
- `password`: requerido, mínimo 8 caracteres. Se guarda solo el hash (bcrypt).
- Login: mensaje de error genérico ("Credenciales inválidas") tanto si el email no existe como si la contraseña es incorrecta — evita enumeración de usuarios.
- Logout: sin invalidación server-side en la v1 (JWT stateless). El cliente descarta el token.

---

## 3. Usuarios

- El email **no** es editable vía `PUT /usuarios/perfil` (cambiar email de login es sensible, requeriría reverificación — fuera de alcance v1).
- Cambio de password (`PATCH /usuarios/password`): verifica `passwordActual` contra el hash guardado antes de aceptar el cambio. `passwordNueva` sigue las mismas reglas que en registro (mínimo 8 caracteres). No se permite que `passwordNueva` sea igual a `passwordActual`.

---

## 4. Categorías

- `nombre`: requerido, único por usuario.
- Al asignar `categoriaId` a un proyecto, el backend valida que la categoría pertenezca al mismo usuario dueño del proyecto — si no, 404 (mismo criterio de §1).
- Al borrar una categoría con proyectos asociados, los proyectos quedan con `categoriaId = null` (no se bloquea el borrado).

---

## 5. Proyectos

### Validaciones básicas
- `nombre`: requerido, único por usuario (dos usuarios distintos pueden repetir nombre, un mismo usuario no).
- `prioridad`: enum `baja|media|alta`, default `media`.
- `fechaObjetivo` (si está presente) debe ser >= `fechaInicio`.
- Cambiar a `abandonado` sin `motivoAbandonoId` → 400.

### Máquina de estados

```
activo      → abandonado   (requiere motivoAbandonoId)
cualquiera  → finalizado   (excepto desde finalizado mismo)
abandonado  → activo       (endpoint /reabrir)
cualquiera  → archivado    (excepto desde archivado mismo)
archivado   → activo       (endpoint /reabrir — mismo endpoint que "abandonado → activo")
```

- Transición no listada (ej. `finalizado → abandonado`) → 400 `"Transicion de estado invalida"`.
- Estado destino igual al actual (ej. `/archivar` sobre uno ya archivado) → 400 `"El proyecto ya esta en ese estado"`.
- No existe transición `finalizado → activo` en la v1.
- `/reabrir` (desde `abandonado` o `archivado`) limpia `motivoAbandonoId`/`motivoAbandonoDetalle` y cambia estado a `activo`.

### Abandono automático por vencimiento de fecha objetivo

Si un proyecto está `activo`, tiene `fechaObjetivo` definida, y la fecha actual supera a `fechaObjetivo` (sin margen — el mismo día que vence), el sistema lo transiciona automáticamente a `abandonado`. No aplica a proyectos sin `fechaObjetivo` ni a proyectos en otro estado.

- `motivoAbandonoId` apunta a un motivo dedicado del catálogo (ej. "Fecha objetivo vencida" — pendiente agregar al catálogo).
- `motivoAbandonoDetalle` se completa automáticamente con un mensaje generado por el sistema (ej. `"El sistema marco este proyecto como abandonado: la fecha objetivo (2026-06-01) se vencio sin actividad."`). Este mensaje es lo que deja constancia de que fue automático — no hace falta un campo separado de "origen".
- Se registra en `historial_cambios` igual que cualquier cambio de estado (§8).
- **Nota de implementación:** depende del paso del tiempo, no de un request HTTP — no se resuelve con un trigger de base de datos. Necesita un proceso programado (ej. job diario) que revise proyectos activos con `fechaObjetivo` vencida. Diseño del job pendiente para la etapa de implementación.

### Campos calculados

- **`progreso`**: `SUM(peso de tareas completadas) / SUM(peso de todas las tareas) * 100`. `null` si el proyecto no tiene tareas cargadas (no `0`, para distinguir "sin datos" de "0% real"). Se calcula al vuelo, no se almacena.
- **`diasRestantesObjetivo`**: `null` si no hay `fechaObjetivo`; positivo si es futura; negativo si ya venció (puede pasar brevemente antes de que corra el job de auto-abandono). El frontend decide cómo mostrar alertas con este número — el backend no arma el mensaje.

---

## 6. Avances

- `descripcion`: requerida.
- **Solo se puede crear un avance si el proyecto está en estado `activo`.** Crear un avance sobre un proyecto `abandonado`, `finalizado` o `archivado` → 400 `"No se pueden registrar avances en un proyecto que no esta activo"`. Es consistente con las estadísticas (ej. tiempo promedio de abandono, actividad reciente) — permitir avances fuera de `activo` generaría datos contradictorios (¿cómo interpretar actividad en un proyecto que el propio sistema marcó como abandonado?).
- `fecha`: el usuario puede especificarla manualmente **solo al crear** el avance (para cargar avances retroactivos), pero **no puede ser anterior a la `fecha` del avance más reciente ya registrado en ese proyecto** — se puede backdatear, pero solo hacia adelante del último, no insertar en el medio de la línea temporal. Fecha anterior a la del último avance → 400. Sin `fecha` enviada → default `now()`.
- **`fecha` tampoco puede ser anterior a `fechaInicio` del proyecto** — un avance no puede haber ocurrido antes de que el proyecto empezara. Fecha anterior a `fechaInicio` → 400.
- **`PUT /avances/{id}` no permite editar `fecha`** — solo `descripcion`, `notas`, `dificultades`. Si se envía `fecha` en el body de un PUT, se ignora (o se responde 400 si se prefiere ser estricto — a definir en implementación). Esto evita tener que revalidar el orden cronológico contra los avances vecinos cada vez que se edita uno.
- **`fechaUltimoAvance` del proyecto = la `fecha` del avance más reciente.** Como la fecha de un avance solo se define una vez (al crear, no se edita después) y siempre es `>= fechaUltimoAvance` actual, alcanza con asignarla directamente al insertar — no hace falta recalcular con `MAX()` en ningún otro momento salvo al borrar (ver regla siguiente).
- **Solo se puede eliminar el último avance registrado** de un proyecto. Al borrarlo, `fechaUltimoAvance` se recalcula al avance restante más reciente.

---

## 7. Tareas

- `nombre`: requerido.
- **Todas las operaciones de escritura sobre una tarea (crear, editar, completar/descompletar, borrar) requieren que el proyecto esté `activo`.** Cualquiera de ellas en otro estado → 400 `"No se pueden modificar tareas en un proyecto que no esta activo"`. Es consistente: tanto `peso` como `completado` afectan el cálculo de `progreso`, y borrar una tarea también lo afecta (saca peso del total) — no tendría sentido que una fuera restringida y las otras no. Solo la lectura (`GET`) queda libre en cualquier estado.
- `peso`: entero 1–5, default 1.
- `completado`: boolean, default false. Al cambiar de `false` a `true`, `fechaCompletado` se setea automáticamente; al volver a `false`, se limpia.
- `orden`: entero libre, sin unicidad — es solo criterio de visualización, no pasa nada si dos tareas comparten valor.
- Cualquier tarea se puede borrar, sin restricciones (a diferencia de avances).
- Permisos: transitivos vía el proyecto (si el usuario es dueño del proyecto, puede operar sus tareas).

---

## 8. Historial

Se registra una fila en `historial_cambios` únicamente cuando cambian estos campos de `Proyecto`: `nombre`, `descripcion`, `objetivo`, `categoriaId`, `prioridad`, `fechaObjetivo`, `estado`, `motivoAbandonoId`, `motivoAbandonoDetalle`.

Cada fila lleva un `transaccionId` (UUID) que agrupa las filas generadas por la misma operación — ej. un `PATCH /estado` que cambia `estado` + `motivoAbandonoId` + `motivoAbandonoDetalle` genera 3 filas con el mismo `transaccionId`. El servicio genera este UUID una sola vez por operación (no una vez por fila) y lo reutiliza en el `INSERT` de cada campo modificado. Esto es lo que permite correlacionar, por ejemplo, qué motivo corresponde a cuál evento de abandono en la estadística de §11 — sin depender de que las fechas coincidan al milisegundo entre inserts separados.

**No** se trackean cambios en `Avance` ni `Tarea` ahí — esas entidades ya tienen su propia tabla con timestamps, que cumple una función equivalente.

`motivoAbandonoId`/`motivoAbandonoDetalle` están en esta lista específicamente para que el motivo de abandono no se pierda cuando un proyecto se reabre (ver CU-01) — sin esto, la promesa central de Phoenix de "no perder el historial de por qué se abandonó" se rompía en el flujo de reapertura.

---

## 9. Catálogos

`GET /catalogos/motivos-abandono` no requiere autenticación — es un catálogo global, no depende del usuario.

---

## 10. Dashboard

- `actividad-reciente`: `limit` default 10.
- `proximos-objetivos`: proyectos activos con `fechaObjetivo` en los próximos 30 días.

---

## 11. Estadísticas

Todas requieren autenticación y se calculan solo sobre los datos del usuario autenticado (no son globales).

- **`motivos-abandono` y `tiempo-promedio-abandono` cuentan TODOS los eventos de abandono históricos, no solo los proyectos que están abandonados ahora mismo.** Se calculan consultando `historial_cambios` (filas donde `campoModificado = 'estado'` y `valorNuevo = 'abandonado'`), no la tabla `Proyecto` directamente — porque reabrir un proyecto limpia `motivoAbandonoId` de la fila actual, pero el evento de abandono sigue existiendo en el historial. Un proyecto abandonado 3 veces y reabierto cada vez cuenta 3 veces en estas estadísticas.
  - Para `motivos-abandono` específicamente, se correlaciona la fila de `estado` con la fila de `motivoAbandonoId` del mismo evento usando `transaccionId` (ver §8) — ambas filas comparten el mismo valor porque el servicio las inserta como parte de la misma operación.
- `tiempo-promedio-abandono` se calcula entre `fechaInicio` del proyecto y la fecha de cada evento de abandono (de `historial_cambios`) — si un proyecto se abandonó más de una vez, cada evento aporta su propio dato al promedio.
- `por-categoria` y `completados-por-anio` sí consultan `Proyecto`/estado actual directamente — no tienen el mismo problema porque no hay transición de reversión desde `finalizado`, y la distribución por categoría es sobre el estado presente, no un evento histórico.

---

## 12. Búsqueda

`query` busca coincidencias en `nombre` + `descripcion`.

