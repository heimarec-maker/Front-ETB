/**
 * Servicio de registro de actividad (Activity Log)
 * Almacena las acciones de los usuarios en localStorage.
 * Cada entrada contiene: id, usuario, acción, módulo, detalles, resultado, timestamp.
 */

const STORAGE_KEY = 'etb_activity_log'

/**
 * Obtiene todos los registros de actividad.
 * @returns {Array} Lista de registros ordenados por fecha (más recientes primero).
 */
export function getActivityLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const logs = raw ? JSON.parse(raw) : []
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  } catch {
    return []
  }
}

/**
 * Agrega un nuevo registro de actividad.
 * @param {Object} entry
 * @param {string} entry.usuario   - Nombre del usuario que realiza la acción.
 * @param {string} entry.accion    - Tipo de acción: 'Limpieza' | 'Creación' | 'Consulta'.
 * @param {string} entry.modulo    - Módulo donde ocurrió: 'Limpieza Equipos' | 'Creación Equipos', etc.
 * @param {string} entry.detalles  - Detalles libres (serial, MAC, etc.).
 * @param {string} entry.resultado - 'Éxito' | 'Error' | 'Advertencia' | 'Info'.
 */
export function addActivityLog({ usuario, accion, modulo, detalles, resultado }) {
  const logs = getActivityLogs()

  const newEntry = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    usuario,
    accion,
    modulo,
    detalles,
    resultado,
    timestamp: new Date().toISOString(),
  }

  logs.unshift(newEntry)

  // Mantener solo los últimos 500 registros para no sobrecargar localStorage
  const trimmed = logs.slice(0, 500)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))

  return newEntry
}

/**
 * Limpia todos los registros de actividad.
 */
export function clearActivityLogs() {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Obtiene estadísticas resumidas de los registros.
 * @returns {Object} { total, limpiezas, creaciones, consultas, errores, usuarios }
 */
export function getActivityStats() {
  const logs = getActivityLogs()
  const usuarios = new Set(logs.map(l => l.usuario))

  return {
    total: logs.length,
    limpiezas: logs.filter(l => l.accion === 'Limpieza').length,
    creaciones: logs.filter(l => l.accion === 'Creación').length,
    consultas: logs.filter(l => l.accion === 'Consulta').length,
    errores: logs.filter(l => l.resultado === 'Error').length,
    exitosos: logs.filter(l => l.resultado === 'Éxito').length,
    usuarios: usuarios.size,
    listaUsuarios: [...usuarios],
  }
}
