
-- ============================================================================
-- 1. USUARIOS
-- ============================================================================

CREATE TABLE usuarios (
    id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre          VARCHAR(150) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    password_hash   TEXT NOT NULL,
    fecha_registro  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_usuarios_nombre_longitud
        CHECK (char_length(nombre) BETWEEN 2 AND 150),
    -- El email se normaliza a minúsculas en la app antes de guardar (regla §2);
    -- este CHECK es una red de seguridad, no reemplaza esa normalización.
    CONSTRAINT chk_usuarios_email_lowercase
        CHECK (email = lower(email)),
    CONSTRAINT chk_usuarios_email_formato
        CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

CREATE UNIQUE INDEX uq_usuarios_email ON usuarios (email);


-- ============================================================================
-- 2. CATEGORÍAS
-- ============================================================================

CREATE TABLE categorias (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id  INTEGER NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    nombre      VARCHAR(150) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_categorias_usuario_nombre UNIQUE (usuario_id, nombre)
);

CREATE INDEX idx_categorias_usuario_id ON categorias (usuario_id);


-- ============================================================================
-- 3. MOTIVOS DE ABANDONO (catálogo fijo, global, solo lectura desde la app)
-- ============================================================================

CREATE TABLE motivos_abandono (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre      VARCHAR(150) NOT NULL,
    es_sistema  BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT uq_motivos_abandono_nombre UNIQUE (nombre)
);


CREATE UNIQUE INDEX uq_motivos_abandono_es_sistema
    ON motivos_abandono (es_sistema)
    WHERE es_sistema = true;

INSERT INTO motivos_abandono (nombre, es_sistema) VALUES
    ('Falta de tiempo', false),
    ('Perdida de interes', false),
    ('Cambio de prioridades', false),
    ('Dificultad tecnica', false),
    ('Falta de recursos', false),
    ('Proyecto reemplazado por otro', false),
    ('Otro', false),
    ('Fecha objetivo vencida', true);


-- ============================================================================
-- 4. PROYECTOS
-- ============================================================================

CREATE TABLE proyectos (
    id                      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id              INTEGER NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    categoria_id            INTEGER REFERENCES categorias (id) ON DELETE SET NULL,
    nombre                  VARCHAR(200) NOT NULL,
    descripcion             TEXT,
    objetivo                TEXT,
    prioridad               VARCHAR(10) NOT NULL DEFAULT 'media',
    fecha_inicio            DATE NOT NULL,
    fecha_objetivo          DATE,
    estado                  VARCHAR(20) NOT NULL DEFAULT 'activo',
    motivo_abandono_id      INTEGER REFERENCES motivos_abandono (id) ON DELETE RESTRICT,
    motivo_abandono_detalle TEXT,
  
    fecha_ultimo_avance     TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_proyectos_usuario_nombre UNIQUE (usuario_id, nombre),
    CONSTRAINT chk_proyectos_prioridad
        CHECK (prioridad IN ('baja', 'media', 'alta')),
    CONSTRAINT chk_proyectos_estado
        CHECK (estado IN ('activo', 'abandonado', 'finalizado', 'archivado')),
    
    CONSTRAINT chk_proyectos_fecha_objetivo_valida
        CHECK (fecha_objetivo IS NULL OR fecha_objetivo >= fecha_inicio),
    
    CONSTRAINT chk_proyectos_motivo_si_abandonado
        CHECK (estado <> 'abandonado' OR motivo_abandono_id IS NOT NULL)
);

CREATE INDEX idx_proyectos_usuario_id ON proyectos (usuario_id);
CREATE INDEX idx_proyectos_usuario_estado ON proyectos (usuario_id, estado);
CREATE INDEX idx_proyectos_categoria_id ON proyectos (categoria_id);

CREATE INDEX idx_proyectos_activos_fecha_objetivo
    ON proyectos (fecha_objetivo)
    WHERE estado = 'activo' AND fecha_objetivo IS NOT NULL;

CREATE INDEX idx_proyectos_busqueda_nombre ON proyectos (usuario_id, lower(nombre));


-- ============================================================================
-- 5. TAREAS
-- ============================================================================

CREATE TABLE tareas (
    id                INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    proyecto_id       INTEGER NOT NULL REFERENCES proyectos (id) ON DELETE CASCADE,
    nombre            VARCHAR(200) NOT NULL,
    peso              INTEGER NOT NULL DEFAULT 1,
    completado        BOOLEAN NOT NULL DEFAULT false,
    orden             INTEGER NOT NULL DEFAULT 0,
    fecha_completado  TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_tareas_peso CHECK (peso BETWEEN 1 AND 5)

);

CREATE INDEX idx_tareas_proyecto_id ON tareas (proyecto_id, orden);


CREATE OR REPLACE FUNCTION fn_tareas_fecha_completado()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.completado = true AND OLD.completado = false THEN
        NEW.fecha_completado := now();
    ELSIF NEW.completado = false AND OLD.completado = true THEN
        NEW.fecha_completado := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tareas_fecha_completado
    BEFORE UPDATE OF completado ON tareas
    FOR EACH ROW
    EXECUTE FUNCTION fn_tareas_fecha_completado();


-- ============================================================================
-- 6. AVANCES
-- ============================================================================

CREATE TABLE avances (
    id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    proyecto_id   INTEGER NOT NULL REFERENCES proyectos (id) ON DELETE CASCADE,
    fecha         TIMESTAMPTZ NOT NULL DEFAULT now(),
    descripcion   TEXT NOT NULL,
    notas         TEXT,
    dificultades  TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_avances_proyecto_fecha ON avances (proyecto_id, fecha DESC);


CREATE OR REPLACE FUNCTION fn_avances_validar_fecha()
RETURNS TRIGGER AS $$
DECLARE
    v_fecha_inicio        DATE;
    v_fecha_ultimo_avance TIMESTAMPTZ;
BEGIN
    SELECT fecha_inicio, fecha_ultimo_avance
      INTO v_fecha_inicio, v_fecha_ultimo_avance
      FROM proyectos
     WHERE id = NEW.proyecto_id;

    IF NEW.fecha < v_fecha_inicio THEN
        RAISE EXCEPTION
            'La fecha del avance no puede ser anterior a la fecha de inicio del proyecto'
            USING ERRCODE = '23514'; -- check_violation
    END IF;

    IF v_fecha_ultimo_avance IS NOT NULL AND NEW.fecha < v_fecha_ultimo_avance THEN
        RAISE EXCEPTION
            'La fecha del avance no puede ser anterior al avance mas reciente ya registrado'
            USING ERRCODE = '23514';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_avances_validar_fecha
    BEFORE INSERT ON avances
    FOR EACH ROW
    EXECUTE FUNCTION fn_avances_validar_fecha();

CREATE OR REPLACE FUNCTION fn_avances_actualizar_fecha_ultimo()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE proyectos
       SET fecha_ultimo_avance = NEW.fecha,
           updated_at = now()
     WHERE id = NEW.proyecto_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_avances_actualizar_fecha_ultimo
    AFTER INSERT ON avances
    FOR EACH ROW
    EXECUTE FUNCTION fn_avances_actualizar_fecha_ultimo();


CREATE OR REPLACE FUNCTION fn_avances_recalcular_fecha_ultimo()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE proyectos
       SET fecha_ultimo_avance = (
               SELECT MAX(fecha) FROM avances WHERE proyecto_id = OLD.proyecto_id
           ),
           updated_at = now()
     WHERE id = OLD.proyecto_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_avances_recalcular_fecha_ultimo
    AFTER DELETE ON avances
    FOR EACH ROW
    EXECUTE FUNCTION fn_avances_recalcular_fecha_ultimo();


-- ============================================================================
-- 7. HISTORIAL DE CAMBIOS
-- ============================================================================

CREATE TABLE historial_cambios (
    id                INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    proyecto_id       INTEGER NOT NULL REFERENCES proyectos (id) ON DELETE CASCADE,
    campo_modificado  VARCHAR(50) NOT NULL,
    valor_anterior    TEXT,
    valor_nuevo       TEXT,
    fecha             TIMESTAMPTZ NOT NULL DEFAULT now(),

    transaccion_id    UUID NOT NULL,

    CONSTRAINT chk_historial_campo_modificado
        CHECK (campo_modificado IN (
            'nombre', 'descripcion', 'objetivo', 'categoria_id',
            'prioridad', 'fecha_objetivo', 'estado',
            'motivo_abandono_id', 'motivo_abandono_detalle'
        ))
);

CREATE INDEX idx_historial_proyecto_fecha
    ON historial_cambios (proyecto_id, fecha DESC);
CREATE INDEX idx_historial_transaccion_id
    ON historial_cambios (transaccion_id);

CREATE INDEX idx_historial_campo_valor_nuevo
    ON historial_cambios (campo_modificado, valor_nuevo);


-- ============================================================================
-- 8. TRIGGER GENÉRICO: updated_at automático
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_categorias_updated_at
    BEFORE UPDATE ON categorias
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_proyectos_updated_at
    BEFORE UPDATE ON proyectos
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_tareas_updated_at
    BEFORE UPDATE ON tareas
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_avances_updated_at
    BEFORE UPDATE ON avances
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

