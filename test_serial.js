
import * as db from './server/db.js'

async function test() {
  await db.initDB()
  const serial = 'ZTEQA065FP2E'
  
  console.log(`\n--- VERIFICANDO SERIAL: ${serial} ---`)
  
  const estado = await db.queryOne(`
    SELECT a.ca_value as ESTADO, b.SERIAL_NBR as SERIAL
    from ASAP.equip_ca_value a, ASAP.equipment b
    where b.SERIAL_NBR = :serial
    AND a.CA_VALUE_LABEL = 'Estado CPE'
    AND a.equipment_id = b.equipment_id
  `, { serial })
  
  console.log('Resultado 1.1 (Estado):', estado)

  const mac = await db.queryOne(`
    SELECT m.ca_value as MAC
    FROM ASAP.equip_ca_value m, ASAP.equipment b
    WHERE b.serial_nbr = :serial
    AND m.equipment_id = b.equipment_id
    AND m.ca_value_label = 'Mac Address'
  `, { serial })
  
  console.log('Resultado MAC (para el Front):', mac)

  process.exit(0)
}

test()
