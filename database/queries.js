/**
 * queries.js — Las 4 consultas del proceso de Limpieza de Equipos
 * 
 * Equivalente a las operaciones Oracle descritas en el documento:
 *   1. CONSULTA 1  : Validar estado del equipo (equip_ca_value + equipment)
 *   2. OPERACIÓN 2 : Ejecutar borrado (BORRADO_EQUIPOS) → elimina vinculaciones
 *   3. OPERACIÓN 3 : Marcar serial en serv_item_value  con '*'
 *   4. OPERACIÓN 4 : Marcar serial en serv_req_si_value con '*'
 * 
 * Uso: node database/queries.js
 */

import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH   = path.join(__dirname, 'limpieza_equipos.db')

const db = new Database(DB_PATH)
db.pragma('foreign_keys = ON')

// ─────────────────────────────────────────────────────────────────────────────
// CONSULTA 1 — Validar estado del equipo por serial
// Oracle original:
//   SELECT cv.ca_value
//   FROM   equip_ca_value cv
//   JOIN   equipment e ON e.equipment_id = cv.equipment_id
//   WHERE  e.serial_nbr = :serial
//   AND    cv.ca_value_label = 'Estado CPE'
// ─────────────────────────────────────────────────────────────────────────────
export function consultaValidarEquipo(serial, mac) {
  const stmt = db.prepare(`
    SELECT
      e.serial_nbr,
      e.model,
      e.brand,
      e.tipo,
      e.estado              AS estado_general, -- Estado general del equipo
      cv_estado.ca_value    AS estado_cpe,     -- Estado CPE específico
      cv_mac.ca_value       AS mac_address     -- Dirección MAC
    FROM   equipment e
    JOIN   equip_ca_value cv_estado ON cv_estado.equipment_id = e.equipment_id AND cv_estado.ca_value_label = 'Estado CPE'
    LEFT JOIN equip_ca_value cv_mac ON cv_mac.equipment_id = e.equipment_id AND cv_mac.ca_value_label = 'Dirección MAC'
    WHERE  e.serial_nbr     = ?
    AND    cv_mac.ca_value  = ? -- Validar que la MAC coincida
  `)
  return stmt.get(serial, mac) ?? null
}

// ─────────────────────────────────────────────────────────────────────────────
// OPERACIÓN 2 — Borrado del equipo (EXEC BORRADO_EQUIPOS)
// Oracle original: EXEC BORRADO_EQUIPOS('<SERIAL>');
// En SQLite simulamos la desvinculación del equipo:
//   • Cambia estado_cpe a 'RETIRADO' en equip_ca_value
//   • Cambia estado general a 'LIBRE' en equipment
//   • Registra en limpieza_log
// ─────────────────────────────────────────────────────────────────────────────
export function ejecutarBorradoEquipo(serial, usuario = 'Sistema') {
  const equipo = db.prepare(`SELECT equipment_id FROM equipment WHERE serial_nbr = ?`).get(serial)
  if (!equipo) {
    registrarLog(serial, usuario, 'BORRADO', 'NO_ENCONTRADO', `Serial ${serial} no existe en equipment`)
    return { ok: false, mensaje: `Serial ${serial} no encontrado.` }
  }

  const transaccion = db.transaction(() => {
    // Actualizar estado en equip_ca_value
    db.prepare(`
      UPDATE equip_ca_value
      SET    ca_value  = 'RETIRADO',
             updated_at = datetime('now')
      WHERE  equipment_id  = ?
      AND    ca_value_label = 'Estado CPE'
    `).run(equipo.equipment_id)

    // Marcar equipo como LIBRE en equipment
    db.prepare(`
      UPDATE equipment
      SET    estado     = 'LIBRE',
             updated_at = datetime('now')
      WHERE  equipment_id = ?
    `).run(equipo.equipment_id)
  })

  transaccion()
  registrarLog(serial, usuario, 'BORRADO', 'ÉXITO', `Equipo desvinculado correctamente`)
  return { ok: true, mensaje: `Equipo ${serial} desvinculado (LIBRE).` }
}

// ─────────────────────────────────────────────────────────────────────────────
// OPERACIÓN 3 — Marcar serial en serv_item_value con '*'
// Oracle original:
//   UPDATE serv_item_value
//   SET    valid_value = '*'
//   WHERE  value_label = 'Serial'
//   AND    valid_value = :serial
// ─────────────────────────────────────────────────────────────────────────────
export function limpiarServItemValue(serial, usuario = 'Sistema') {
  const result = db.prepare(`
    UPDATE serv_item_value
    SET    valid_value = valid_value || '*',
           updated_at  = datetime('now')
    WHERE  value_label = 'Serial'
    AND    valid_value = ?
  `).run(serial)

  const filas = result.changes
  const estado = filas > 0 ? 'ÉXITO' : 'NO_ENCONTRADO'
  registrarLog(serial, usuario, 'SERV_ITEM', estado, `${filas} fila(s) actualizadas en serv_item_value`)
  return { ok: filas > 0, filasAfectadas: filas }
}

// ─────────────────────────────────────────────────────────────────────────────
// OPERACIÓN 4 — Marcar serial en serv_req_si_value con '*'
// Oracle original:
//   UPDATE serv_req_si_value
//   SET    valid_value = '*'
//   WHERE  value_label = 'Serial'
//   AND    valid_value = :serial
// ─────────────────────────────────────────────────────────────────────────────
export function limpiarServReqSiValue(serial, usuario = 'Sistema') {
  const result = db.prepare(`
    UPDATE serv_req_si_value
    SET    valid_value = valid_value || '*',
           updated_at  = datetime('now')
    WHERE  value_label = 'Serial'
    AND    valid_value = ?
  `).run(serial)

  const filas = result.changes
  const estado = filas > 0 ? 'ÉXITO' : 'NO_ENCONTRADO'
  registrarLog(serial, usuario, 'SERV_REQ', estado, `${filas} fila(s) actualizadas en serv_req_si_value`)
  return { ok: filas > 0, filasAfectadas: filas }
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCESO COMPLETO — Ejecuta las 4 operaciones en secuencia para un serial
// ─────────────────────────────────────────────────────────────────────────────
export function procesarLimpiezaCompleta(serial, mac, usuario = 'Sistema') {
  console.log(`\n${'═'.repeat(60)}`)
  console.log(`🔧 PROCESO DE LIMPIEZA: ${serial} | MAC: ${mac} | Usuario: ${usuario}`)
  console.log('═'.repeat(60))

  // ── Operación 1: Validar estado ──────────────────────────────
  console.log('\n📋 OP 1 — Validando estado del equipo (Serial y MAC)...')
  const estadoEquipo = consultaValidarEquipo(serial, mac)
  if (!estadoEquipo) {
    console.log(`   ❌ Serial ${serial} con MAC ${mac} no encontrado o no coincide.`)
    registrarLog(serial, usuario, 'VALIDACION', 'NO_ENCONTRADO', `Serial ${serial} con MAC ${mac} no existe o no coincide en la BD`)
    return { ok: false, etapa: 'VALIDACION', message: 'Serial y/o MAC no encontrados o no coinciden.' }
  }
  console.log(`   ✅ Equipo encontrado: ${estadoEquipo.model} | Estado CPE: ${estadoEquipo.estado_cpe} | MAC: ${estadoEquipo.mac_address}`)

  // ── Operación 2: BORRADO_EQUIPOS ─────────────────────────────
  console.log('\n🗑️  OP 2 — Ejecutando BORRADO_EQUIPOS...')
  const borrado = ejecutarBorradoEquipo(serial, usuario)
  console.log(`   ${borrado.ok ? '✅' : '❌'} ${borrado.mensaje}`)

  // ── Operación 3: serv_item_value ──────────────────────────────
  console.log('\n🔄 OP 3 — Limpiando serv_item_value...')
  const itemResult = limpiarServItemValue(serial, usuario)
  console.log(`   ${itemResult.ok ? '✅' : '⚠️ '} ${itemResult.filasAfectadas} fila(s) marcadas con *`)

  // ── Operación 4: serv_req_si_value ────────────────────────────
  console.log('\n🔄 OP 4 — Limpiando serv_req_si_value...')
  const reqResult = limpiarServReqSiValue(serial, usuario)
  console.log(`   ${reqResult.ok ? '✅' : '⚠️ '} ${reqResult.filasAfectadas} fila(s) marcadas con *`)

  console.log(`\n${'─'.repeat(60)}`)
  console.log(`🏁 PROCESO FINALIZADO para serial: ${serial}`)

  return {
    type: 'success', // Cambiado de 'ok' a 'type' para consistencia con el frontend
    message: `Limpieza exitosa: El equipo ${serial} con MAC ${mac} ha sido liberado y marcado con '*' en servicios y órdenes.`,
    detalle: `Filas afectadas: ${itemResult.filasAfectadas} en items, ${reqResult.filasAfectadas} en solicitudes.`,
    data: {
      serial,
      estadoAnterior: estadoEquipo.estado_cpe,
      itemsActualizados: itemResult.filasAfectadas,
      solicitudesActualizadas: reqResult.filasAfectadas
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AUXILIAR — Registrar en limpieza_log
// ─────────────────────────────────────────────────────────────────────────────
function registrarLog(serial, usuario, etapa, resultado, detalle) {
  db.prepare(`
    INSERT INTO limpieza_log (serial_nbr, usuario, etapa, resultado, detalle)
    VALUES (?, ?, ?, ?, ?)
  `).run(serial, usuario, etapa, resultado, detalle)
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSULTA DE LOGS — Ver historial de limpiezas
// ─────────────────────────────────────────────────────────────────────────────
export function getLimpiezaLogs(serial = null) {
  if (serial) {
    return db.prepare(`
      SELECT * FROM limpieza_log WHERE serial_nbr = ? ORDER BY ejecutado_at DESC
    `).all(serial)
  }
  return db.prepare(`SELECT * FROM limpieza_log ORDER BY ejecutado_at DESC LIMIT 100`).all()
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN — Prueba de ejecución si se corre directamente
// ─────────────────────────────────────────────────────────────────────────────
if (process.argv[1].endsWith('queries.js')) {
  // Ejemplo solicitado: ZTEGDB0DCC99 → ZTEGDB0DCC99*
  const testSerial = 'TVBOXSN0000001'; // Usamos el ejemplo del TV BOX donde Serial y MAC son iguales
  const testMac = 'TVBOXSN0000001';
  const resultado = procesarLimpiezaCompleta(testSerial, testMac, 'heimar')
  console.log('\n📄 Logs registrados:')
  console.table(getLimpiezaLogs(testSerial))
  db.close()
}
