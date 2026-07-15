# Phoenix — Casos de uso

> Flujos completos end-to-end. Formato: Actor / Precondición / Flujo principal / Flujos alternativos / Excepciones / Poscondición. Las reglas individuales que sustentan cada paso están en `phoenix_reglas_negocio.md`.

---

## CU-01: Ciclo de vida de un proyecto

**Actor:** Usuario autenticado, dueño del proyecto.
**Precondición:** El proyecto existe y pertenece al usuario autenticado.

**Flujo principal — Abandonar un proyecto activo:**
1. Proyecto está en estado `activo`.
2. Usuario llama `PATCH /proyectos/{id}/estado` con `estado: "abandonado"`, `motivoAbandonoId`, y opcionalmente `motivoAbandonoDetalle`.
3. Sistema valida que `activo → abandonado` es una transición válida y que viene con motivo.
4. Sistema actualiza `estado`, `motivoAbandonoId`, `motivoAbandonoDetalle` en el proyecto.
5. Sistema registra en `historial_cambios` una fila por cada campo modificado: `estado`, `motivoAbandonoId`, `motivoAbandonoDetalle`.
6. **Poscondición:** proyecto `abandonado`, motivo guardado en el proyecto y en su historial.

**Flujo alternativo A — Reabrir un proyecto `abandonado` o `archivado`:**
1. Usuario llama `PATCH /proyectos/{id}/reabrir`.
2. Sistema valida que el estado actual admite reapertura (`abandonado` o `archivado`).
3. Sistema registra en `historial_cambios` el valor anterior de `motivoAbandonoId`/`motivoAbandonoDetalle` antes de limpiarlos (valor_nuevo: null).
4. Sistema limpia `motivoAbandonoId`/`motivoAbandonoDetalle` del proyecto y cambia `estado` a `activo`.
5. **Poscondición:** proyecto `activo`, sin motivo activo — pero el motivo anterior sigue disponible en `GET /proyectos/{id}/historial`.

**Flujo alternativo B — Finalizar un proyecto:**
1. Usuario llama `PATCH /proyectos/{id}/estado` con `estado: "finalizado"`, desde cualquier estado excepto `finalizado` mismo.
2. Sistema cambia el estado y lo registra en historial.
3. **Poscondición:** proyecto `finalizado`. No existe transición de vuelta a `activo` en la v1.

**Flujo alternativo C — Abandono automático por vencimiento de fecha objetivo:**
1. Un proceso programado (job diario) revisa proyectos `activo` con `fechaObjetivo` vencida.
2. Para cada uno, el sistema ejecuta el mismo cambio de estado que el flujo principal, pero con `motivoAbandonoId` fijo del catálogo y `motivoAbandonoDetalle` generado automáticamente.
3. Se registra en `historial_cambios` igual que en el flujo principal.
4. **Poscondición:** proyecto `abandonado` sin intervención del usuario. El detalle del motivo deja constancia de que fue automático.

**Excepción — Transición inválida o redundante:**
- Transición no listada (ej. `finalizado → abandonado`) → 400 `"Transicion de estado invalida"`.
- Estado destino igual al actual (ej. `/archivar` sobre uno ya `archivado`) → 400 `"El proyecto ya esta en ese estado"`.
- **Poscondición:** el proyecto no cambia, no se genera fila en historial.

---

## CU-02: Registrar avance

**Actor:** Usuario autenticado, dueño del proyecto.
**Precondición:** El proyecto existe, pertenece al usuario autenticado, y está en estado `activo`.

**Flujo principal — Crear un avance con fecha actual:**
1. Usuario llama `POST /proyectos/{id}/avances` con `descripcion` (requerida) y opcionalmente `notas`, `dificultades`. No envía `fecha`.
2. Sistema valida que el proyecto exista y pertenezca al usuario (404 si no).
3. Sistema valida que el proyecto esté en estado `activo` (400 si no — ver excepción).
4. Sistema valida `descripcion` requerida (400 si falta).
5. Como no se envió `fecha`, el sistema usa `now()`.
6. Sistema inserta el avance.
7. Sistema actualiza `fechaUltimoAvance` del proyecto con la `fecha` del avance recién creado (trigger de DB).
8. **Poscondición:** avance creado, `fechaUltimoAvance` del proyecto actualizado.

**Flujo alternativo A — Crear un avance retroactivo (fecha pasada):**
1. Usuario llama `POST /proyectos/{id}/avances` con `fecha` explícita, anterior a `now()`.
2. Sistema valida proyecto existente, dueño, y estado `activo` (igual que en el flujo principal).
3. Sistema valida `fecha >= fechaInicio` del proyecto (400 si no).
4. Sistema valida `fecha >= fecha` del avance más reciente ya registrado (400 si no — no se puede insertar en el medio de la línea temporal).
5. Si todas las validaciones pasan, continúa igual que el flujo principal desde el paso 6 (insertar avance).
6. **Poscondición:** igual al flujo principal — el avance retroactivo pasa a ser el más reciente, `fechaUltimoAvance` se actualiza a esa fecha (aunque sea "del pasado" respecto a hoy, es la más nueva entre los avances existentes).

**Flujo alternativo B — Editar un avance existente:**
1. Usuario llama `PUT /avances/{id}` con `descripcion`, `notas`, y/o `dificultades`.
2. Sistema valida que el avance pertenezca (transitivamente, vía el proyecto) al usuario.
3. `fecha` no es editable — si viene en el body, se ignora.
4. Sistema actualiza los campos permitidos.
5. **Poscondición:** avance actualizado, `fechaUltimoAvance` del proyecto sin cambios (la fecha del avance no se tocó).

**Flujo alternativo C — Eliminar el último avance:**
1. Usuario llama `DELETE /avances/{id}`, donde `{id}` es el avance con la `fecha` más reciente del proyecto.
2. Sistema valida que sea efectivamente el más reciente (400 si no lo es).
3. Sistema elimina el avance.
4. Sistema recalcula `fechaUltimoAvance` al avance restante más reciente (o a `null`/sin valor si no quedan avances).
5. **Poscondición:** avance eliminado, `fechaUltimoAvance` recalculado.

**Excepción — Fecha inválida:**
- `fecha` anterior a `fechaInicio` del proyecto → 400.
- `fecha` anterior a la del avance más reciente existente → 400.
- **Poscondición:** no se crea el avance, el proyecto no cambia.

**Excepción — Intentar borrar un avance que no es el más reciente:**
- → 400 `"Solo se puede eliminar el avance mas reciente"`.
- **Poscondición:** el avance no se borra.

**Excepción — Proyecto no está activo:**
- Proyecto en `abandonado`, `finalizado` o `archivado` → 400 `"No se pueden registrar avances en un proyecto que no esta activo"`.
- **Poscondición:** no se crea el avance. Si el usuario quiere retomarlo, primero debe reabrirlo (`PATCH /proyectos/{id}/reabrir`, ver CU-01) y recién después registrar el avance.

---

## CU-03: Checklist de tareas y cálculo de progreso

**Actor:** Usuario autenticado, dueño del proyecto.
**Precondición:** El proyecto existe y pertenece al usuario autenticado.

**Flujo principal — Crear una tarea:**
1. Proyecto está en estado `activo`.
2. Usuario llama `POST /proyectos/{id}/tareas` con `nombre` (requerido), y opcionalmente `peso` (1–5, default 1) y `orden`.
3. Sistema valida proyecto existente, dueño, y estado `activo` (400 si no — ver excepción).
4. Sistema valida `nombre` requerido y `peso` dentro de 1–5 si se envió.
5. Sistema inserta la tarea con `completado: false`.
6. **Poscondición:** tarea creada. El `progreso` del proyecto cambia en la próxima consulta (baja, porque ahora hay más peso total sin completar) — no se recalcula ni almacena en este momento, se calcula al vuelo en cada `GET`.

**Flujo alternativo A — Completar (o descompletar) una tarea:**
1. Proyecto está `activo`.
2. Usuario llama `PATCH /tareas/{id}/completar` con `{ "completado": true }` (o `false`).
3. Sistema valida que la tarea pertenezca (vía el proyecto) al usuario, y que el proyecto esté `activo`.
4. Sistema actualiza `completado`. `fechaCompletado` se setea automáticamente si pasa a `true`, se limpia si vuelve a `false` (trigger de DB).
5. **Poscondición:** el `progreso` del proyecto cambia en la próxima consulta.

**Flujo alternativo B — Editar metadatos de una tarea (nombre, peso u orden):**
1. Proyecto está `activo`.
2. Usuario llama `PUT /tareas/{id}` con los campos a cambiar.
3. Sistema valida que la tarea pertenezca al usuario y que el proyecto esté `activo` (400 si no).
4. Sistema actualiza los campos.
5. **Poscondición:** si se cambió `peso`, el `progreso` calculado cambia en la próxima consulta — es un valor instantáneo, no un historial, así que no hay "versión anterior" del progreso que se pierda (a diferencia del motivo de abandono, acá no aplica la misma preocupación porque el progreso nunca se consideró un dato histórico, siempre fue "estado actual").

**Flujo alternativo C — Eliminar una tarea:**
1. Proyecto está `activo`.
2. Usuario llama `DELETE /tareas/{id}`.
3. Sistema valida que la tarea pertenezca al usuario y que el proyecto esté `activo` (400 si no).
4. Sistema elimina la tarea.
5. **Poscondición:** el `progreso` se recalcula sobre el total de tareas restante en la próxima consulta (si no queda ninguna tarea, `progreso` vuelve a `null`).

**Flujo alternativo D — Calcular el progreso (implícito en cualquier lectura del proyecto):**
1. Cliente llama `GET /proyectos/{id}` (o `GET /proyectos` en el listado).
2. Sistema calcula `progreso = SUM(peso de tareas completadas) / SUM(peso de todas las tareas) * 100`.
3. Si el proyecto no tiene tareas cargadas, `progreso: null` (no `0` — distingue "sin datos" de "0% real").
4. **Poscondición:** ninguna — es una operación de lectura, no cambia estado.

**Excepción — Proyecto no está activo (al crear, editar, completar o borrar tarea):**
- → 400 `"No se pueden modificar tareas en un proyecto que no esta activo"`.
- **Poscondición:** la operación no se ejecuta, la tarea queda como estaba.

**Excepción — Peso fuera de rango:**
- `peso` fuera de 1–5 → 400.
- **Poscondición:** la tarea no se crea/actualiza.

---

## CU-04: Registro y autenticación

**Actor:** Visitante no autenticado (registro, login); Usuario autenticado (logout, cambio de password).
**Precondición:** Ninguna para registro/login. Token JWT válido para logout y cambio de password.

**Flujo principal — Registro exitoso:**
1. Visitante llama `POST /auth/registro` con `nombre`, `email`, `password`.
2. Sistema valida `nombre` (2–150 caracteres), `email` (formato válido), `password` (mínimo 8 caracteres). 400 si falta algo o no cumple formato.
3. Sistema normaliza `email` a minúsculas.
4. Sistema valida que no exista ya un usuario con ese email (400 si existe).
5. Sistema hashea `password` con bcrypt — nunca se guarda en texto plano.
6. Sistema crea el usuario.
7. Sistema genera un JWT con `{ id, email }` como payload.
8. **Poscondición:** usuario creado, se devuelve `usuario` (sin `passwordHash`) + `token`. El usuario queda autenticado de inmediato — no necesita hacer login por separado después de registrarse.

**Flujo alternativo A — Login exitoso:**
1. Usuario llama `POST /auth/login` con `email`, `password`.
2. Sistema normaliza `email` a minúsculas y busca el usuario.
3. Sistema compara `password` contra el hash guardado (`bcrypt.compare`).
4. Si el usuario existe y la contraseña coincide, genera un nuevo JWT.
5. **Poscondición:** se devuelve `usuario` + `token` (mismo shape que registro).

**Flujo alternativo B — Logout:**
1. Usuario autenticado llama `POST /auth/logout`.
2. Sistema no hace nada server-side — no hay blacklist de tokens en la v1 (JWT stateless).
3. **Poscondición:** responde éxito. La invalidación real ocurre del lado del cliente (descarta el token guardado). **Limitación conocida:** el token sigue siendo técnicamente válido hasta que expira (`JWT_EXPIRES_IN`), aunque el cliente ya no lo use — si se necesita invalidación real (ej. "cerrar sesión en todos los dispositivos", o revocar por robo de token), hace falta una blacklist en DB, fuera de alcance v1.

**Flujo alternativo C — Cambio de password:**
1. Usuario autenticado llama `PATCH /usuarios/password` con `passwordActual`, `passwordNueva`.
2. Sistema verifica `passwordActual` contra el hash guardado (401 si no coincide, mensaje genérico "Contraseña actual incorrecta").
3. Sistema valida `passwordNueva` (mínimo 8 caracteres, distinta de `passwordActual`).
4. Sistema hashea `passwordNueva` y actualiza.
5. **Poscondición:** password actualizado. **Misma limitación que en logout:** el JWT emitido antes del cambio sigue siendo válido hasta que expira — cambiar la contraseña no invalida sesiones activas en otros dispositivos. Vale la pena tenerlo en cuenta si en algún momento se reporta una cuenta comprometida.

**Excepción — Email ya registrado:**
- → 400, mensaje claro (a diferencia de login, acá sí se puede decir "el email ya existe" porque quien registra ya demostró tener control sobre ese intento — no hay riesgo de enumeración en el mismo sentido que en login).
- **Poscondición:** no se crea el usuario.

**Excepción — Credenciales inválidas (login):**
- Email no existe, o contraseña incorrecta → 401, mismo mensaje genérico en ambos casos ("Credenciales invalidas") — evita que alguien use el endpoint para averiguar qué emails están registrados.
- **Poscondición:** no se genera token.

**Excepción — Token inválido, ausente o expirado (en cualquier ruta protegida):**
- → 401, vía el middleware de autenticación (aplica a todos los endpoints salvo `/auth/registro`, `/auth/login`, y `/catalogos/motivos-abandono`).
- **Poscondición:** el request no llega a ejecutar ninguna lógica de negocio.

---

## CU-05: Gestión de categorías

**Actor:** Usuario autenticado.
**Precondición:** Ninguna especial para crear. Para editar/borrar, la categoría debe pertenecer al usuario.

**Flujo principal — Crear categoría:**
1. Usuario llama `POST /categorias` con `nombre`.
2. Sistema valida `nombre` requerido y único entre las categorías del propio usuario (400 si duplicado).
3. Sistema crea la categoría.
4. **Poscondición:** categoría creada, disponible para asignar a proyectos vía `categoriaId`.

**Flujo alternativo A — Editar categoría:**
1. Usuario llama `PUT /categorias/{id}` con nuevo `nombre`.
2. Sistema valida que la categoría pertenezca al usuario (404 si no) y que el nuevo nombre no choque con otra categoría propia (400 si sí).
3. Sistema actualiza.
4. **Poscondición:** categoría actualizada. Los proyectos que la referencian (por `categoriaId`, no por nombre copiado) reflejan el nuevo nombre automáticamente en su próxima lectura — no hay nada que resincronizar.

**Flujo alternativo B — Eliminar categoría con proyectos asociados:**
1. Usuario llama `DELETE /categorias/{id}`.
2. Sistema valida que la categoría pertenezca al usuario (404 si no).
3. Sistema elimina la categoría. La base de datos (`ON DELETE SET NULL`) deja `categoriaId = null` en los proyectos que la usaban — no hace falta lógica adicional en el backend para esto.
4. **Poscondición:** categoría eliminada, proyectos asociados intactos pero sin categoría.

**Excepción — Nombre duplicado:**
- → 400. **Poscondición:** no se crea/edita la categoría.

---

## CU-06: Dashboard

**Actor:** Usuario autenticado.
**Precondición:** Ninguna — son todas operaciones de lectura.

**Flujo principal — Resumen de conteos:**
1. Usuario llama `GET /dashboard/resumen`.
2. Sistema cuenta los proyectos del usuario agrupados por `estado` (`activo`, `abandonado`, `finalizado`, `archivado`).
3. **Poscondición:** ninguna, es lectura.

**Flujo alternativo A — Actividad reciente:**
1. Usuario llama `GET /dashboard/actividad-reciente?limit=10`.
2. Sistema combina dos fuentes: avances recientes (`Avance.fecha`) y cambios de estado recientes (`historial_cambios` donde `campoModificado = 'estado'`), ordenados juntos por fecha DESC, cada item marcado con `tipo` (`"avance"` o `"cambio_estado"`).
3. **Nota:** esto incluye tanto cambios manuales como el abandono automático por vencimiento (CU-01, flujo C) — ambos quedan en `historial_cambios` de la misma forma, así que no hace falta lógica especial para que aparezcan en la actividad reciente.
4. **Poscondición:** ninguna.

**Flujo alternativo B — Próximos objetivos:**
1. Usuario llama `GET /dashboard/proximos-objetivos`.
2. Sistema busca proyectos `activo` del usuario con `fechaObjetivo` entre hoy y hoy+30 días (`fechaObjetivo >= hoy AND fechaObjetivo <= hoy+30`), ordenados ascendente.
3. **Nota:** el límite inferior (`>= hoy`) excluye a propósito los proyectos con `fechaObjetivo` ya vencida — esos deberían haber sido auto-abandonados por el job diario (CU-01, flujo C); si aparecen acá es señal de que el job todavía no corrió ese día, un caso transitorio y no algo que este endpoint deba resolver.
4. **Poscondición:** ninguna.

---

## CU-07: Estadísticas

**Actor:** Usuario autenticado.
**Precondición:** Ninguna — son todas operaciones de lectura, calculadas solo sobre los datos del propio usuario.

**Flujo principal — Distribución por categoría:**
1. Usuario llama `GET /estadisticas/por-categoria`.
2. Sistema agrupa los proyectos actuales del usuario por `categoriaId` y cuenta.
3. **Poscondición:** ninguna.

**Flujo alternativo A — Motivos de abandono (histórico completo):**
1. Usuario llama `GET /estadisticas/motivos-abandono`.
2. Sistema consulta `historial_cambios` — no `Proyecto` — buscando cada evento donde `campoModificado = 'estado'` y `valorNuevo = 'abandonado'`.
3. Para cada evento, correlaciona con la fila de `motivoAbandonoId` insertada en el mismo cambio (misma `fecha` exacta, ver nota técnica en `reglas_negocio.md` §13) para saber qué motivo le corresponde.
4. Sistema agrupa y cuenta por motivo.
5. **Poscondición:** ninguna. Un proyecto abandonado y reabierto varias veces aporta un evento por cada vez que fue abandonado, no solo su estado actual.

**Flujo alternativo B — Tiempo promedio de abandono:**
1. Usuario llama `GET /estadisticas/tiempo-promedio-abandono`.
2. Sistema toma los mismos eventos de abandono del flujo A, y para cada uno calcula `fecha del evento - fechaInicio del proyecto`.
3. Sistema promedia todos los valores.
4. **Poscondición:** ninguna.

**Flujo alternativo C — Completados por año:**
1. Usuario llama `GET /estadisticas/completados-por-anio`.
2. Sistema busca en `historial_cambios` los eventos donde `campoModificado = 'estado'` y `valorNuevo = 'finalizado'`, agrupa por año de la `fecha` del evento.
3. **Poscondición:** ninguna. (Usa `historial_cambios` y no `Proyecto.updatedAt` para que la fecha sea la del momento exacto de la transición, no la última modificación cualquiera del proyecto.)

---

## CU-08: Búsqueda de proyectos

**Actor:** Usuario autenticado.
**Precondición:** Ninguna.

**Flujo principal — Búsqueda combinada:**
1. Usuario llama `GET /proyectos/buscar?query=...&categoria=...&estado=...&page=&limit=`.
2. Sistema busca entre los proyectos del usuario donde `nombre` o `descripcion` contengan `query` (case-insensitive).
3. Sistema aplica los filtros adicionales (`categoria`, `estado`) si vinieron, igual que en `GET /proyectos`.
4. Sistema pagina los resultados.
5. **Poscondición:** ninguna.

**Flujo alternativo A — Búsqueda sin `query` (solo filtros):**
1. Usuario llama el mismo endpoint sin `query`, solo con `categoria` y/o `estado`.
2. Sistema no aplica el filtro de texto, solo los filtros estructurados — equivalente a `GET /proyectos` con esos mismos filtros.
3. **Poscondición:** ninguna. (`query` es opcional, no hay un mínimo de caracteres requerido.)
