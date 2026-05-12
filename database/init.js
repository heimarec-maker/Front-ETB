/**
 * init.js — Crea e inicializa la base de datos SQLite de Limpieza de Equipos
 * 
 * Uso:  node database/init.js
 * 
 * Genera el archivo: database/limpieza_equipos.db
 */

import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH   = path.join(__dirname, 'limpieza_equipos.db')

// Leer archivos SQL
const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
const seedSql   = fs.readFileSync(path.join(__dirname, 'seed.sql'),   'utf8')

// Crear / abrir la base de datos
const db = new Database(DB_PATH, { verbose: console.log })

console.log('\n🗄️  Inicializando base de datos:', DB_PATH)
console.log('─'.repeat(60))

// Ejecutar schema y seed en transacciones
db.exec(schemaSql)
console.log('✅ Schema creado correctamente.')

db.exec(seedSql)
console.log('✅ Datos de prueba insertados correctamente.')

// Verificar
const equipCount = db.prepare('SELECT COUNT(*) as total FROM equipment').get()
const logCount   = db.prepare('SELECT COUNT(*) as total FROM limpieza_log').get()

console.log(`\n📊 Estado inicial:`)
console.log(`   Equipos:       ${equipCount.total}`)
console.log(`   Logs limpieza: ${logCount.total}`)
console.log('\n✅ Base de datos lista en:', DB_PATH)

db.close()
