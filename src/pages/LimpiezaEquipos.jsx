import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Monitor, Sparkles, Search, Download } from 'lucide-react'
import SubPage from '../components/SubPage'
import { addActivityLog } from '../services/activityLog'
import { exportOperationResults } from '../services/exportService'
import './LimpiezaEquipos.css'

const getUsername = () => {
  try {
    const u = JSON.parse(localStorage.getItem('currentUser'))
    return u?.username || 'Desconocido'
  } catch { return 'Desconocido' }
}

const mapResultType = (type) => {
  switch (type) {
    case 'success': return 'Éxito'
    case 'error':   return 'Error'
    case 'warning': return 'Advertencia'
    default:        return 'Info'
  }
}

export default function LimpiezaEquipos() {
  const { t } = useTranslation()
  const [tab, setTab] = useState('individual')
  const [serial, setSerial] = useState('')
  const [mac, setMac] = useState('')
  const [masivaText, setMasivaText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [querySerial, setQuerySerial] = useState('')
  const [queryLoading, setQueryLoading] = useState(false)
  const [queryResult, setQueryResult] = useState(null)
  const [history, setHistory] = useState([])

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
        setResult({ type: 'error', message: t('Debes ingresar el Serial y la MAC.') })
        setLoading(false)
        return
      }
      const res = await mockProcess(serial, mac)
      setResult(res)
      setHistory(prev => [{ input: `${serial} | ${mac}`, status: mapResultType(res.type), message: res.message, timestamp: new Date().toISOString() }, ...prev])
      addActivityLog({
        usuario: getUsername(),
        accion: 'Limpieza',
        modulo: 'Limpieza Equipos (Individual)',
        detalles: `Serial: ${serial} | MAC: ${mac}`,
        resultado: mapResultType(res.type),
      })
    } else {
      if (!masivaText) {
        setResult({ type: 'error', message: t('Debes ingresar la lista de equipos.') })
        setLoading(false)
        return
      }
      setTimeout(() => {
        setResult({ type: 'info', message: 'Se ha procesado el lote de limpieza. Todos los equipos válidos fueron liberados.' })
        setHistory(prev => [{ input: `Lote (${masivaText.trim().split('\n').length})`, status: 'Info', message: 'Lote procesado', timestamp: new Date().toISOString() }, ...prev])
        setLoading(false)
        addActivityLog({
          usuario: getUsername(),
          accion: 'Limpieza',
          modulo: 'Limpieza Equipos (Masiva)',
          detalles: `Lote de ${masivaText.trim().split('\n').length} equipo(s)`,
          resultado: 'Info',
        })
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
      let res
      if (val.includes('error') || val === '000') {
        res = { type: 'error', message: 'El equipo no existe.' }
      } else if (val.includes('daño') || val.includes('malo')) {
        res = { type: 'error', message: 'Estado del equipo: Dañado / No válido.' }
      } else if (val.includes('libre')) {
        res = { type: 'info', message: 'Estado del equipo: Disponible (Sin uso actual).' }
      } else {
        res = { type: 'success', message: 'Estado del equipo: En uso / Operativo y listo para limpiar si se requiere.' }
      }
      setQueryResult(res)
      setQueryLoading(false)
      addActivityLog({
        usuario: getUsername(),
        accion: 'Consulta',
        modulo: 'Limpieza Equipos',
        detalles: `Consulta serial: ${querySerial}`,
        resultado: mapResultType(res.type),
      })
    }, 600)
  }

  return (
    <SubPage
      icon={<Monitor size={18} />}
      badge={t('Módulo')}
      title={t('Limpieza de equipos')}
      description={t('Gestión, revisión y limpieza del inventario de equipos registrados en el sistema.')}
    >
      <div className="limpieza-container">
        
        {/* PANEL DE LIMPIEZA */}
        <div className="limpieza-card glass-card">
          <h2><Sparkles size={20} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />{t('Ejecutar Limpieza')}</h2>
          
          <div className="tabs">
            <button 
              className={`tab-btn ${tab === 'individual' ? 'active' : ''}`}
              onClick={() => setTab('individual')}
            >
              {t('Individual')}
            </button>
            <button 
              className={`tab-btn ${tab === 'masiva' ? 'active' : ''}`}
              onClick={() => setTab('masiva')}
            >
              {t('Masiva')}
            </button>
          </div>

          <form onSubmit={handleLimpiar}>
            {tab === 'individual' ? (
              <div className="form-row">
                <div className="form-group">
                  <label>{t('Serial del Equipo')}</label>
                  <input 
                    type="text" 
                    placeholder="Ej. ZTE123456" 
                    value={serial} 
                    onChange={e => setSerial(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>{t('Dirección MAC')}</label>
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
                <label>{t('Listado de equipos (Serial, MAC por línea)')}</label>
                <textarea 
                  rows="5" 
                  placeholder="ZTE123456, AAAAAAAAA115 &#10; TVBOXSN0000001, TVBOXSN0000001"
                  value={masivaText}
                  onChange={e => setMasivaText(e.target.value)}
                ></textarea>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? t('Procesando...') : t('Iniciar Limpieza')}
            </button>
          </form>

          {result && (
            <div className={`result-box ${result.type}`}>
              {result.message}
            </div>
          )}
        
        </div>

        {/* PANEL DE CONSULTA */}
        <div className="limpieza-card glass-card">
          <h2><Search size={20} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />{t('Consulta de Estado')}</h2>
          <form onSubmit={handleConsultar} className="form-row" style={{ alignItems: 'flex-end'}}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>{t('Serial del Equipo')}</label>
              <input 
                type="text" 
                placeholder={t('Serial del Equipo')} 
                value={querySerial}
                onChange={e => setQuerySerial(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={queryLoading}>
              {t('Consultar Estado')}
            </button>
          </form>

          {queryResult && (
            <div className={`result-box ${queryResult.type}`}>
              {queryResult.message}
            </div>
          )}
        </div>

        </div>

        {/* BOTÓN EXPORTAR */}
        {history.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-primary"
              style={{ gap: '0.5rem' }}
              onClick={() => exportOperationResults({ module: 'Limpieza_Equipos', results: history, t })}
            >
              <Download size={16} /> {t('Exportar')} ({history.length})
            </button>
          </div>
        )}

      </div>
    </SubPage>
  )
}
