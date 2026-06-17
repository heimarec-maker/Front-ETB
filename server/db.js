/**
 * server/db.js — Gestión de conexión a Oracle (Thin Mode)
 */
import oracledb from 'oracledb'
import sqlite3 from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const localDb = new sqlite3(path.join(__dirname, '../database/limpieza_equipos.db'))

// Configuración de oracledb para modo Thin (no requiere Instant Client)
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT
oracledb.fetchAsString = [oracledb.CLOB]

const dbConfig = {
  user:          process.env.DB_USER,
  password:      process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTION_STRING,
}

let pool = null

/** Inicializa el pool de conexiones */
export async function initDB() {
  try {
    pool = await oracledb.createPool(dbConfig)
    console.log('✅ Pool de conexiones a Oracle (ETB_PREQA / MSSLTED) iniciado.')
  } catch (err) {
    console.error('❌ Error al crear el pool de conexiones:', err.message)
    throw err
  }
}

/** Ejecuta una consulta (SELECT) */
export async function query(sql, params = {}) {
  let conn
  try {
    conn = await oracledb.getConnection()
    const result = await conn.execute(sql, params)
    
    // Normalizar claves a minúsculas para compatibilidad con el frontend
    if (result.rows && result.rows.length > 0) {
      return result.rows.map(row => {
        const normalized = {}
        for (const key in row) {
          normalized[key.toLowerCase()] = row[key]
        }
        return normalized
      })
    }
    return result.rows || []
  } catch (err) {
    if (!err.message.includes('ORA-00942')) {
      console.error('❌ Error en consulta SQL:', err.message)
    }
    throw err
  } finally {
    if (conn) {
      try { await conn.close() } catch (e) {}
    }
  }
}

/** Ejecuta una consulta que devuelve una sola fila */
export async function queryOne(sql, params = {}) {
  const rows = await query(sql, params)
  return rows.length > 0 ? rows[0] : null
}

/** Ejecuta una operación de escritura (INSERT/UPDATE/DELETE) con commit */
export async function execute(sql, params = {}) {
  let conn
  try {
    conn = await oracledb.getConnection()
    const result = await conn.execute(sql, params, { autoCommit: true })
    return result
  } catch (err) {
    // Squelch ORA-00942 in logs
    if (!err.message.includes('ORA-00942')) {
      console.error('❌ Error en ejecución SQL (Oracle):', err.message)
    }
    throw err
  } finally {
    if (conn) {
      try { await conn.close() } catch (e) {}
    }
  }
}

/** Ejecuta una transacción (varias sentencias) */
export async function executeTransaction(statements) {
  let conn
  try {
    conn = await oracledb.getConnection()
    for (const stmt of statements) {
      await conn.execute(stmt.sql, stmt.params || {})
    }
    await conn.commit()
  } catch (err) {
    if (conn) await conn.rollback()
    console.error('❌ Error en transacción:', err.message)
    throw err
  } finally {
    if (conn) {
      try { await conn.close() } catch (e) {}
    }
  }
}

/** 
 * Registra logs en la base de datos local SQLite para evitar errores en Oracle (ORA-00942)
 */
export async function registrarLog(serial, usuario, etapa, resultado, detalle) {
  try {
    const stmt = localDb.prepare(`
      INSERT INTO limpieza_log (serial_nbr, usuario, etapa, resultado, detalle, ejecutado_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `)
    stmt.run(serial, usuario, etapa, resultado, detalle)
    console.log(`📝 Log [Local]: ${etapa} - ${serial} [${resultado}]`)
  } catch (err) {
    console.error('⚠️ Error al registrar log local:', err.message)
  }
}

/** Obtiene logs de la base de datos local */
export async function getLocalLogs(serial = null) {
  try {
    if (serial) {
      return localDb.prepare('SELECT * FROM limpieza_log WHERE serial_nbr = ? ORDER BY ejecutado_at DESC').all(serial)
    }
    return localDb.prepare('SELECT * FROM limpieza_log ORDER BY ejecutado_at DESC').all()
  } catch (err) {
    console.error('⚠️ Error al obtener logs locales:', err.message)
    return []
  }
}
