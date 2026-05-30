-- ============================================================
--  CELESTE AGROTEC — Schema para Supabase (PostgreSQL)
--  Ejecutar en: Supabase > SQL Editor
-- ============================================================

-- ============================================================
-- EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: roles
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
    id          SERIAL PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL,
    fecha_crea  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: perfiles
-- Linked to auth.users (Supabase Auth maneja contraseñas)
-- ============================================================
CREATE TABLE IF NOT EXISTS perfiles (
    id          UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    usuario     VARCHAR(60)  NOT NULL UNIQUE,
    correo      VARCHAR(120) NOT NULL UNIQUE,
    telefono    VARCHAR(20),
    direccion   VARCHAR(255),
    id_rol      INT          NOT NULL DEFAULT 2 REFERENCES roles(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    activo      BOOLEAN      NOT NULL DEFAULT TRUE,
    fecha_crea  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: distribuidores
-- ============================================================
CREATE TABLE IF NOT EXISTS distribuidores (
    id              SERIAL PRIMARY KEY,
    cedula          VARCHAR(20)  NOT NULL UNIQUE,
    nombre          VARCHAR(120) NOT NULL,
    placa_vehiculo  VARCHAR(20),
    id_usuario      UUID REFERENCES perfiles(id) ON DELETE SET NULL,
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_crea      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: productos
-- ============================================================
CREATE TABLE IF NOT EXISTS productos (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(120)   NOT NULL,
    descripcion     TEXT,
    precio          NUMERIC(10,2)  NOT NULL CHECK (precio >= 0),
    stock           INT            NOT NULL DEFAULT 0 CHECK (stock >= 0),
    categoria       VARCHAR(60),
    imagen_url      TEXT,
    estado          VARCHAR(20)    NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo','inactivo')),
    fecha_crea      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    fecha_actualiza TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: pedidos
-- ============================================================
CREATE TABLE IF NOT EXISTS pedidos (
    id                  SERIAL PRIMARY KEY,
    id_usuario          UUID        NOT NULL REFERENCES perfiles(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    estado              VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','en_proceso','entregado','cancelado')),
    valor_total         NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    metodo_pago         VARCHAR(30) CHECK (metodo_pago IN ('efectivo','pse','nequi','daviplata')),
    referencia_pago     VARCHAR(100),
    f_estimada_entrega  DATE,
    notas               TEXT,
    fecha_crea          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualiza     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: pedido_items
-- ============================================================
CREATE TABLE IF NOT EXISTS pedido_items (
    id          SERIAL PRIMARY KEY,
    id_pedido   INT          NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    id_producto INT          NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    cantidad    INT          NOT NULL CHECK (cantidad > 0),
    precio_unit NUMERIC(10,2) NOT NULL CHECK (precio_unit >= 0),
    subtotal    NUMERIC(10,2) GENERATED ALWAYS AS (cantidad * precio_unit) STORED
);

-- ============================================================
-- TABLA: envios
-- ============================================================
CREATE TABLE IF NOT EXISTS envios (
    id              SERIAL PRIMARY KEY,
    id_pedido       INT         NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    id_distribuidor INT         REFERENCES distribuidores(id) ON DELETE SET NULL,
    direccion       VARCHAR(255),
    telefono        VARCHAR(20),
    estado          VARCHAR(20) NOT NULL DEFAULT 'preparando' CHECK (estado IN ('preparando','en_camino','entregado','fallido')),
    fecha_envio     TIMESTAMPTZ,
    fecha_entrega   TIMESTAMPTZ,
    notas           TEXT,
    fecha_crea      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: pagos
-- ============================================================
CREATE TABLE IF NOT EXISTS pagos (
    id              SERIAL PRIMARY KEY,
    id_pedido       INT           NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    metodo          VARCHAR(30)   NOT NULL CHECK (metodo IN ('efectivo','pse','nequi','daviplata')),
    valor           NUMERIC(10,2) NOT NULL CHECK (valor >= 0),
    estado          VARCHAR(20)   NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','aprobado','rechazado','cancelado')),
    id_transaccion  VARCHAR(100),
    banco           VARCHAR(100),
    fecha_pago      TIMESTAMPTZ,
    fecha_crea      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: auditoria
-- ============================================================
CREATE TABLE IF NOT EXISTS auditoria (
    id                  SERIAL PRIMARY KEY,
    responsable         VARCHAR(120) NOT NULL,
    id_usuario          UUID         REFERENCES perfiles(id)     ON DELETE SET NULL,
    accion              VARCHAR(50)  NOT NULL,
    tabla_afectada      VARCHAR(80)  NOT NULL,
    id_registro         INT,
    valor_anterior      JSONB,
    valor_nuevo         JSONB,
    fecha_modificacion  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: solicitudes_distribuidor (CAC-008 "Trabaja con nosotros")
-- ============================================================
CREATE TABLE IF NOT EXISTS solicitudes_distribuidor (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(120) NOT NULL,
    correo      VARCHAR(120) NOT NULL,
    telefono    VARCHAR(20),
    ciudad      VARCHAR(80),
    mensaje     TEXT,
    estado      VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','revisando','aprobada','rechazada')),
    fecha_crea  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_perfiles_correo       ON perfiles  (correo);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario        ON pedidos   (id_usuario);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado         ON pedidos   (estado);
CREATE INDEX IF NOT EXISTS idx_envios_pedido          ON envios    (id_pedido);
CREATE INDEX IF NOT EXISTS idx_envios_distribuidor    ON envios    (id_distribuidor);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha        ON auditoria (fecha_modificacion);
CREATE INDEX IF NOT EXISTS idx_auditoria_tabla        ON auditoria (tabla_afectada);
CREATE INDEX IF NOT EXISTS idx_productos_estado       ON productos (estado);
CREATE INDEX IF NOT EXISTS idx_productos_categoria    ON productos (categoria);

-- ============================================================
-- DATOS INICIALES
-- ============================================================
INSERT INTO roles (descripcion) VALUES
    ('Administrador'),
    ('Cliente'),
    ('Distribuidor')
ON CONFLICT DO NOTHING;

-- Productos de ejemplo (los mismos del mock actual)
INSERT INTO productos (nombre, descripcion, precio, stock, categoria, estado) VALUES
    ('Huevos de Gallina AA', 'Huevos frescos de categoría AA', 15000, 100, 'Huevos',       'activo'),
    ('Huevos de Gallina A',  'Huevos frescos de categoría A',  12000, 150, 'Huevos',       'activo'),
    ('Pechuga de Pollo',     'Pechuga fresca por kilogramo',    9800,  80, 'Pollo',        'activo'),
    ('Muslo de Pollo',       'Muslo fresco por kilogramo',      7500,  90, 'Pollo',        'activo'),
    ('Concentrado Avícola',  'Bulto de 40kg para aves',        85000,  30, 'Concentrados', 'activo'),
    ('Suplemento Mineral',   'Bulto de 25kg suplemento',       45000,  25, 'Concentrados', 'activo')
ON CONFLICT DO NOTHING;

