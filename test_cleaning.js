
import * as db from './server/db.js'

async function testCleaning() {
  await db.initDB()
  const serial = 'ZTEQA065FP2E'
  const usuario = 'TEST_BOT'
  
  console.log(`\n🚀 INICIANDO PRUEBA DE LIMPIEZA PARA SERIAL: ${serial}`)
  
  try {
    // --- PASO 1.1: ESTADO INICIAL ---
    const inicial = await db.queryOne(`
      SELECT a.ca_value as ESTADO
      from ASAP.equip_ca_value a, ASAP.equipment b
      where b.SERIAL_NBR = :serial
      AND a.CA_VALUE_LABEL = 'Estado CPE'
      AND a.equipment_id = b.equipment_id
    `, { serial })
    console.log('📊 Estado inicial:', inicial?.estado || 'No encontrado')

    // --- PASO 1.2: BORRADO ---
    console.log('⏳ Ejecutando Paso 1.2 (BORRADO_EQUIPOS)...')
    const plsql = `
      DECLARE
        VALORES ASAP.ARRAY_EQUIPOS := ASAP.ARRAY_EQUIPOS(:serial);
      BEGIN
        ASAP.BORRADO_EQUIPOS (VALORES);
      END;
    `;
    await db.execute(plsql, { serial })
    console.log('✅ Paso 1.2 completado.')

    // --- PASO 1.3: SERV_ITEM_VALUE ---
    console.log('⏳ Ejecutando Paso 1.3 (SERV_ITEM_VALUE)...')
    const itemRes = await db.execute(`
      UPDATE ASAP.serv_item_value
      SET    valid_value = valid_value || '*', updated_at = CURRENT_TIMESTAMP
      WHERE  value_label = 'Serial' AND valid_value = :serial
    `, { serial })
    console.log(`✅ Paso 1.3 completado. Filas afectadas: ${itemRes.rowsAffected || 0}`)

    // --- PASO 1.4: SERV_REQ_SI_VALUE ---
    console.log('⏳ Ejecutando Paso 1.4 (SERV_REQ_SI_VALUE)...')
    const reqRes = await db.execute(`
      UPDATE ASAP.serv_req_si_value
      SET    valid_value = valid_value || '*', updated_at = CURRENT_TIMESTAMP
      WHERE  value_label = 'Serial' AND valid_value = :serial
    `, { serial })
    console.log(`✅ Paso 1.4 completado. Filas afectadas: ${reqRes.rowsAffected || 0}`)

    // --- VERIFICACIÓN FINAL ---
    const final = await db.queryOne(`
      SELECT a.ca_value as ESTADO
      from ASAP.equip_ca_value a, ASAP.equipment b
      where b.SERIAL_NBR = :serial
      AND a.CA_VALUE_LABEL = 'Estado CPE'
      AND a.equipment_id = b.equipment_id
    `, { serial })
    console.log('📊 Estado final:', final?.estado || 'No encontrado')
    
    console.log('\n✨ PRUEBA FINALIZADA CON ÉXITO.')

  } catch (err) {
    console.error('\n❌ ERROR DURANTE LA PRUEBA:', err.message)
  } finally {
    process.exit(0)
  }
}

testCleaning()
