import { useState } from 'react'
import SubPage from '../components/SubPage'
import './LimpiezaEquipos.css'

export default function LimpiezaEquipos() {
  const [tab, setTab] = useState('individual') // 'individual' | 'masiva'
  
  // Limpieza state
  const [serial, setSerial] = useState('')
  const [mac, setMac] = useState('')
  const [masivaText, setMasivaText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null) // { type: 'error'|'warning'|'success'|'info', message: string }

  // Consulta state
  const [querySerial, setQuerySerial] = useState('')
  const [queryLoading, setQueryLoading] = useState(false)
  const [queryResult, setQueryResult] = useState(null)

  // Funciones Mock para procesar
  const mockProcess = (s, m) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const val = s.trim().toLowerCase()
        if (val.includes('error') || val === '000') {
          resolve({ type: 'error', message: `Error: El equipo con serial ${s} no existe en el sistema.` })
        } else if (val.includes('libre')) {
          resolve({ type: 'warning', message: `El equipo ${s} existe pero no está en uso; no había nada que liberar o limpiar.` })
        } else if (val.includes('daño') || val.includes('malo')) {
          resolve({ type: 'error', message: `El equipo ${s} existe pero se encuentra en un estado no válido o dañado.` })
        } else {
          resolve({ type: 'success', message: `El equipo ${s} ha sido limpiado y liberado correctamente.` })
        }
      }, 800)
    })
  }

  const handleLimpiar = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    if (tab === 'individual') {
      if (!serial || !mac) {
        setResult({ type: 'error', message: 'Debes ingresar el Serial y la MAC.' })
        setLoading(false)
        return
      }
      const res = await mockProcess(serial, mac)
      setResult(res)
    } else {
      if (!masivaText) {
        setResult({ type: 'error', message: 'Debes ingresar la lista de equipos.' })
        setLoading(false)
        return
      }
      // Simulate bulk process
      setTimeout(() => {
        setResult({ type: 'info', message: 'Se ha procesado el lote de limpieza. Todos los equipos válidos fueron liberados.' })
        setLoading(false)
      }, 1500)
      return
    }
    setLoading(false)
  }

  const handleConsultar = (e) => {
    e.preventDefault()
    if (!querySerial) return
    setQueryLoading(true)
    setQueryResult(null)

    setTimeout(() => {
      const val = querySerial.trim().toLowerCase()
      if (val.includes('error') || val === '000') {
        setQueryResult({ type: 'error', message: 'El equipo no existe.' })
      } else if (val.includes('daño') || val.includes('malo')) {
        setQueryResult({ type: 'error', message: 'Estado del equipo: Dañado / No válido.' })
      } else if (val.includes('libre')) {
        setQueryResult({ type: 'info', message: 'Estado del equipo: Disponible (Sin uso actual).' })
      } else {
        setQueryResult({ type: 'success', message: 'Estado del equipo: En uso / Operativo y listo para limpiar si se requiere.' })
      }
      setQueryLoading(false)
    }, 600)
  }

  return (
    <SubPage
      icon="🖥️"
      badge="Módulo"
      title="Limpieza de equipos"
      description="Gestión, revisión y limpieza del inventario de equipos registrados en el sistema."
    >
      <div className="limpieza-container">
        
        {/* PANEL DE LIMPIEZA */}
        <div className="limpieza-card">
          <h2>🧹 Ejecutar Limpieza</h2>
          
          <div className="tabs">
            <button 
              className={`tab-btn ${tab === 'individual' ? 'active' : ''}`}
              onClick={() => setTab('individual')}
            >
              Individual
            </button>
            <button 
              className={`tab-btn ${tab === 'masiva' ? 'active' : ''}`}
              onClick={() => setTab('masiva')}
            >
              Masiva
            </button>
          </div>

          <form onSubmit={handleLimpiar}>
            {tab === 'individual' ? (
              <div className="form-row">
                <div className="form-group">
                  <label>Serial del Equipo</label>
                  <input 
                    type="text" 
                    placeholder="Ej. ZTE123456" 
                    value={serial} 
                    onChange={e => setSerial(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Dirección MAC</label>
                  <input 
                    type="text" 
                    placeholder="Ej: AAAAAAAAA115" 
                    value={mac} 
                    onChange={e => setMac(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label>Listado de equipos (Serial, MAC por línea)</label>
                <textarea 
                  rows="5" 
                  placeholder="ZTE123456, AAAAAAAAA115 &#10; TVBOXSN0000001, TVBOXSN0000001"
                  value={masivaText}
                  onChange={e => setMasivaText(e.target.value)}
                ></textarea>
              </div>
            )}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Procesando...' : 'Iniciar Limpieza'}
            </button>
          </form>

          {result && (
            <div className={`result-box ${result.type}`}>
              {result.message}
            </div>
          )}
        
        </div>

        {/* PANEL DE CONSULTA */}
        <div className="limpieza-card">
          <h2>🔍 Consulta de Estado</h2>
          <form onSubmit={handleConsultar} className="form-row" style={{ alignItems: 'flex-end'}}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Serial del Equipo</label>
              <input 
                type="text" 
                placeholder="Ingresa serial para consultar estado" 
                value={querySerial}
                onChange={e => setQuerySerial(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-submit" disabled={queryLoading}>
              Consultar Estado
            </button>
          </form>

          {queryResult && (
            <div className={`result-box ${queryResult.type}`}>
              {queryResult.message}
            </div>
          )}
        </div>

      </div>
    </SubPage>
  )
}
