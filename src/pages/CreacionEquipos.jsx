import { useState } from 'react'
import SubPage from '../components/SubPage'
import './CreacionEquipos.css'

const TIPOS_EQUIPO = [
  'ONT',
  'ONT DUAL',
  'ONT ATP',
  'STB',
  'AP',
  'IP-IPhone virtual',
  'TV BOX',
  'Otro'
]

const ESTADOS_ASIGNAR = [
  'Disponible',
  'Asignado',
  'Recuperado',
  'No recuperado'
]

export default function CreacionEquipos() {
  const [serial, setSerial] = useState('ZTE') // ONT is the default type
  const [mac, setMac] = useState('')
  const [tipo, setTipo] = useState(TIPOS_EQUIPO[0])
  const [otroTipo, setOtroTipo] = useState('')
  const [estado, setEstado] = useState(ESTADOS_ASIGNAR[0])
  
  // Plantilla 
  const [mantenerPlantilla, setMantenerPlantilla] = useState(true)

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const mockCheckEquipoExistente = (s, m) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const query = (s + m).toLowerCase()
        if (query.includes('existe')) {
          resolve(true) // Simula que ya existe
        } else {
          resolve(false)
        }
      }, 600)
    })
  }

  const handleTipoChange = (e) => {
    const newTipo = e.target.value
    setTipo(newTipo)
    
    let prefix = ''
    if (newTipo === 'ONT' || newTipo === 'ONT ATP') prefix = 'ZTE'
    else if (newTipo === 'ONT DUAL') prefix = 'SZTE'
    else if (newTipo === 'STB') prefix = '653'
    else if (newTipo === 'AP') prefix = 'APF'
    else if (newTipo === 'TV BOX') prefix = 'TVBOX'

    setSerial(prefix)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setResult(null)

    if (!serial || !mac) {
      setResult({ type: 'error', message: 'Tanto el Serial como la MAC son obligatorios.' })
      return
    }

    const tipoFinal = tipo === 'Otro' ? otroTipo : tipo
    if (!tipoFinal) {
      setResult({ type: 'error', message: 'Debes especificar el tipo de equipo.' })
      return
    }

    setLoading(true)
    
    const existe = await mockCheckEquipoExistente(serial, mac)
    if (existe) {
      setResult({ 
        type: 'error', 
        message: `Error: El equipo con serial ${serial} / MAC ${mac} ya existe en el sistema.` 
      })
      setLoading(false)
      return
    }

    // Success process
    setTimeout(() => {
      setResult({ 
        type: 'success', 
        message: `¡Equipo creado exitosamente! Se agregó un ${tipoFinal} con el estado: ${estado}.` 
      })
      setLoading(false)

      if (mantenerPlantilla) {
        // Obtenemos el prefijo del tipo actual para resetear el serial a su valor base
        let prefix = ''
        if (tipoFinal === 'ONT' || tipoFinal === 'ONT ATP') prefix = 'ZTE'
        else if (tipoFinal === 'ONT DUAL') prefix = 'SZTE'
        else if (tipoFinal === 'STB') prefix = '653'
        else if (tipoFinal === 'AP') prefix = 'APF'
        else if (tipoFinal === 'TV BOX') prefix = 'TVBOX'

        setSerial(prefix)
        setMac('')
      } else {
        // Limpiamos todo y volvemos a los valores por defecto
        setSerial('ZTE')
        setMac('')
        setTipo(TIPOS_EQUIPO[0])
        setOtroTipo('')
        setEstado(ESTADOS_ASIGNAR[0])
      }
    }, 800)
  }

  return (
    <SubPage
      icon="➕"
      badge="Módulo"
      title="Creación de equipos"
      description="Registro y alta de nuevos equipos en el sistema ETB."
    >
      <div className="creacion-container">
        <div className="creacion-card">
          <h2>Registrar Nuevo Equipo</h2>
          <p className="creacion-subtitle">Diligencia los campos obligatorios para guardar en inventario.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Tipo de Equipo</label>
                <select value={tipo} onChange={handleTipoChange}>
                  {TIPOS_EQUIPO.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Serial</label>
                <input 
                  type="text" 
                  placeholder="Ej: ZXHN12345"
                  value={serial}
                  onChange={e => setSerial(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Dirección MAC</label>
                <input 
                  type="text" 
                  placeholder="Ej: 00:1A:2B:AA:BB:CC"
                  value={mac}
                  onChange={e => setMac(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Estado Asignado</label>
                <select value={estado} onChange={e => setEstado(e.target.value)}>
                  {ESTADOS_ASIGNAR.map(es => (
                    <option key={es} value={es}>{es}</option>
                  ))}
                </select>
              </div>
            </div>

            {tipo === 'Otro' && (
              <div className="form-group">
                <label>Especificar otro tipo de equipo</label>
                <input 
                  type="text" 
                  placeholder="Escribe el nombre del tipo..."
                  value={otroTipo}
                  onChange={e => setOtroTipo(e.target.value)}
                />
              </div>
            )}

            <label className="checkbox-group">
              <input 
                type="checkbox" 
                checked={mantenerPlantilla}
                onChange={e => setMantenerPlantilla(e.target.checked)}
              />
              <span>Mantener configuración de "Plantilla" (El tipo y el estado no se borrarán al guardar, para registrar varios rápidamente).</span>
            </label>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Equipo'}
            </button>
          </form>

          {result && (
            <div className={`result-box ${result.type}`}>
              {result.message}
            </div>
          )}

        </div>
      </div>
    </SubPage>
  )
}
