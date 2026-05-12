-- ============================================================
-- ESQUEMA SQLite - Limpieza de Equipos ETB
-- Equivalente al modelo Oracle descrito en el documento
-- ============================================================

PRAGMA foreign_keys = ON;

-- ─── Tabla principal de equipos ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS equipment (
  equipment_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  serial_nbr     TEXT    NOT NULL UNIQUE,         -- Número de serie del equipo
  model          TEXT,                             -- Modelo del equipo
  brand          TEXT,                             -- Marca
  tipo           TEXT,                             -- Tipo (CPE, ONT, MODEM, etc.)
  estado         TEXT    DEFAULT 'ACTIVO',         -- Estado general
  created_at     TEXT    DEFAULT (datetime('now')),
  updated_at     TEXT    DEFAULT (datetime('now'))
);

-- ─── Atributos del equipo (equivale a equip_ca_value en Oracle) ───────────────
CREATE TABLE IF NOT EXISTS equip_ca_value (
  ca_value_id    INTEGER PRIMARY KEY AUTOINCREMENT,
  equipment_id   INTEGER NOT NULL REFERENCES equipment(equipment_id) ON DELETE CASCADE,
  ca_value_label TEXT    NOT NULL,                 -- Ej: 'Estado CPE'
  ca_value       TEXT    NOT NULL,                 -- Ej: 'ACTIVO', 'RETIRADO', 'LIBRE'
  created_at     TEXT    DEFAULT (datetime('now')),
  updated_at     TEXT    DEFAULT (datetime('now'))
);

-- ─── Valores de ítems de servicio (equivale a serv_item_value en Oracle) ──────
-- Relaciona seriales con servicios activos
CREATE TABLE IF NOT EXISTS serv_item_value (
  item_value_id  INTEGER PRIMARY KEY AUTOINCREMENT,
  serv_item_id   INTEGER NOT NULL,                 -- ID del ítem de servicio
  value_label    TEXT    NOT NULL,                 -- Ej: 'Serial'
  valid_value    TEXT    NOT NULL,                 -- Valor del campo (el serial del equipo)
  service_id     INTEGER,                          -- ID del servicio asociado
  created_at     TEXT    DEFAULT (datetime('now')),
  updated_at     TEXT    DEFAULT (datetime('now'))
);

-- ─── Valores de ítems de solicitudes/órdenes (equivale a serv_req_si_value) ───
-- Relaciona seriales con órdenes/solicitudes pendientes o históricas
CREATE TABLE IF NOT EXISTS serv_req_si_value (
  req_value_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  serv_req_id    INTEGER NOT NULL,                 -- ID de la solicitud/orden
  value_label    TEXT    NOT NULL,                 -- Ej: 'Serial'
  valid_value    TEXT    NOT NULL,                 -- Valor del campo (el serial del equipo)
  orden_estado   TEXT    DEFAULT 'PENDIENTE',      -- Estado de la orden
  created_at     TEXT    DEFAULT (datetime('now')),
  updated_at     TEXT    DEFAULT (datetime('now'))
);

-- ─── Log de limpiezas realizadas ──────────────────────────────────────────────
-- Registro de auditoría de cada limpieza ejecutada
CREATE TABLE IF NOT EXISTS limpieza_log (
  log_id         INTEGER PRIMARY KEY AUTOINCREMENT,
  serial_nbr     TEXT    NOT NULL,                 -- Serial tratado
  usuario        TEXT    NOT NULL,                 -- Quién ejecutó la limpieza
  etapa          TEXT    NOT NULL,                 -- 'VALIDACION' | 'BORRADO' | 'SERV_ITEM' | 'SERV_REQ'
  resultado      TEXT    NOT NULL,                 -- 'ÉXITO' | 'ERROR' | 'NO_ENCONTRADO'
  detalle        TEXT,                             -- Descripción libre del resultado
  ejecutado_at   TEXT    DEFAULT (datetime('now'))
);

-- ─── Índices para búsqueda rápida por serial ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_equipment_serial     ON equipment(serial_nbr);
CREATE INDEX IF NOT EXISTS idx_equip_ca_label       ON equip_ca_value(ca_value_label);
CREATE INDEX IF NOT EXISTS idx_serv_item_label      ON serv_item_value(value_label);
CREATE INDEX IF NOT EXISTS idx_serv_item_value      ON serv_item_value(valid_value);
CREATE INDEX IF NOT EXISTS idx_serv_req_label       ON serv_req_si_value(value_label);
CREATE INDEX IF NOT EXISTS idx_serv_req_value       ON serv_req_si_value(valid_value);
CREATE INDEX IF NOT EXISTS idx_limpieza_log_serial  ON limpieza_log(serial_nbr);
