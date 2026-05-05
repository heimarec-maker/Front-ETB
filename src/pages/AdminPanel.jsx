import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ShieldCheck, Activity, Sparkles, PlusCircle,
  Search, AlertTriangle, CheckCircle, XCircle,
  Info, Trash2, Download, Filter, Users,
  Clock, TrendingUp, BarChart3
} from 'lucide-react'
import { getActivityLogs, getActivityStats, clearActivityLogs } from '../services/activityLog'
import SubPage from '../components/SubPage'
import './AdminPanel.css'

const RESULT_CONFIG = {
  'Éxito':       { Icon: CheckCircle,   className: 'badge-success' },
  'Error':       { Icon: XCircle,       className: 'badge-error' },
  'Advertencia': { Icon: AlertTriangle, className: 'badge-warning' },
  'Info':        { Icon: Info,          className: 'badge-info' },
}

const ACTION_CONFIG = {
  'Limpieza': { Icon: Sparkles,   className: 'action-limpieza' },
  'Creación': { Icon: PlusCircle, className: 'action-creacion' },
  'Consulta': { Icon: Search,     className: 'action-consulta' },
}

export default function AdminPanel() {
  const { t } = useTranslation()
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({})
  const [filterAction, setFilterAction] = useState('Todas')
  const [filterResult, setFilterResult] = useState('Todos')
  const [filterUser, setFilterUser] = useState('Todos')
  const [searchText, setSearchText] = useState('')
  const [showConfirmClear, setShowConfirmClear] = useState(false)

  // Cargar datos
  const refreshData = () => {
    setLogs(getActivityLogs())
    setStats(getActivityStats())
  }

  useEffect(() => {
    refreshData()
    // Auto-refresh cada 10 segundos
    const interval = setInterval(refreshData, 10000)
    return () => clearInterval(interval)
  }, [])

  // Filtrado
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (filterAction !== 'Todas' && log.accion !== filterAction) return false
      if (filterResult !== 'Todos' && log.resultado !== filterResult) return false
      if (filterUser !== 'Todos' && log.usuario !== filterUser) return false
      if (searchText) {
        const q = searchText.toLowerCase()
        return (
          log.detalles?.toLowerCase().includes(q) ||
          log.usuario?.toLowerCase().includes(q) ||
          log.modulo?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [logs, filterAction, filterResult, filterUser, searchText])

  // Agrupar registros por fecha para el timeline
  const groupedLogs = useMemo(() => {
    const groups = {}
    filteredLogs.forEach(log => {
      const d = new Date(log.timestamp)
      const dateKey = d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(log)
    })
    return groups
  }, [filteredLogs])

  // Limpiar registros
  const handleClear = () => {
    clearActivityLogs()
    refreshData()
    setShowConfirmClear(false)
  }

  // Exportar CSV
  const handleExport = () => {
    if (filteredLogs.length === 0) return
    const headers = [t('Fecha'), t('Usuario'), t('Acción'), t('Módulo'), t('Detalles'), t('Resultado')]
    const rows = filteredLogs.map(l => [
      formatDate(l.timestamp),
      l.usuario,
      l.accion,
      l.modulo,
      `"${(l.detalles || '').replace(/"/g, '""')}"`,
      l.resultado,
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `registro_actividad_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
  }

  return (
    <SubPage
      icon={<ShieldCheck size={18} />}
      badge={t('Administración')}
      title={t('Panel de Administrador')}
      description={t('Registro y seguimiento de todas las operaciones realizadas por los usuarios del sistema.')}
    >
      <div className="admin-container">

        {/* ── Tarjetas de estadísticas ── */}
        <div className="admin-stats-grid">
          <StatCard Icon={Activity} label={t('Total operaciones')} value={stats.total || 0} color="accent" />
          <StatCard Icon={Sparkles} label={t('Limpiezas')} value={stats.limpiezas || 0} color="blue" />
          <StatCard Icon={PlusCircle} label={t('Creaciones')} value={stats.creaciones || 0} color="green" />
          <StatCard Icon={Users} label={t('Usuarios activos')} value={stats.usuarios || 0} color="purple" />
          <StatCard Icon={CheckCircle} label={t('Exitosos')} value={stats.exitosos || 0} color="emerald" />
          <StatCard Icon={XCircle} label={t('Errores')} value={stats.errores || 0} color="red" />
        </div>

        {/* ── Filtros y acciones ── */}
        <div className="admin-toolbar glass-card">
          <div className="toolbar-filters">
            <div className="filter-group">
              <Filter size={16} />
              <select value={filterAction} onChange={e => setFilterAction(e.target.value)}>
                <option value="Todas">{t('Todas las acciones')}</option>
                <option value="Limpieza">{t('Limpieza')}</option>
                <option value="Creación">{t('Creación')}</option>
                <option value="Consulta">{t('Consulta')}</option>
              </select>
            </div>

            <div className="filter-group">
              <TrendingUp size={16} />
              <select value={filterResult} onChange={e => setFilterResult(e.target.value)}>
                <option value="Todos">{t('Todos los resultados')}</option>
                <option value="Éxito">{t('Éxito')}</option>
                <option value="Error">Error</option>
                <option value="Advertencia">{t('Advertencia')}</option>
                <option value="Info">Info</option>
              </select>
            </div>

            <div className="filter-group">
              <Users size={16} />
              <select value={filterUser} onChange={e => setFilterUser(e.target.value)}>
                <option value="Todos">{t('Todos los usuarios')}</option>
                {(stats.listaUsuarios || []).map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div className="filter-search">
              <Search size={16} />
              <input
                type="text"
                placeholder={t('Buscar en detalles...')}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
            </div>
          </div>

          <div className="toolbar-actions">
            <button className="btn-toolbar" onClick={handleExport} title={t('Exportar')}>
              <Download size={16} /> {t('Exportar')}
            </button>
            <button
              className="btn-toolbar btn-toolbar-danger"
              onClick={() => setShowConfirmClear(true)}
              title={t('Limpiar')}
            >
              <Trash2 size={16} /> {t('Limpiar')}
            </button>
          </div>
        </div>

        {/* ── Confirmación de limpieza ── */}
        {showConfirmClear && (
          <div className="confirm-overlay" onClick={() => setShowConfirmClear(false)}>
            <div className="confirm-dialog glass-card" onClick={e => e.stopPropagation()}>
              <AlertTriangle size={40} className="confirm-icon" />
              <h3>{t('¿Estás seguro?')}</h3>
              <p>{t('Se eliminarán permanentemente todos los registros de actividad.')}</p>
              <div className="confirm-actions">
                <button className="btn btn-primary" style={{ background: '#ef4444' }} onClick={handleClear}>
                  {t('Sí, eliminar todo')}
                </button>
                <button className="btn btn-accent" onClick={() => setShowConfirmClear(false)}>
                  {t('Cancelar')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Contador de resultados ── */}
        <div className="admin-results-count">
          <BarChart3 size={16} />
          {t('Mostrando')} <strong>{filteredLogs.length}</strong> {t('de')} <strong>{logs.length}</strong> {t('registros')}
        </div>

        {/* ── Timeline de registros ── */}
        <div className="admin-timeline-wrap glass-card">
          {filteredLogs.length === 0 ? (
            <div className="admin-empty">
              <Clock size={48} />
              <h3>{t('Sin registros')}</h3>
              <p>{t('Aún no hay operaciones registradas o no coinciden con los filtros aplicados.')}</p>
            </div>
          ) : (
            <div className="timeline-container">
              {Object.entries(groupedLogs).map(([dateLabel, dayLogs]) => (
                <div key={dateLabel} className="timeline-day-group">
                  <div className="timeline-date-header">
                    <span className="timeline-date-badge">{dateLabel}</span>
                  </div>
                  <div className="timeline-items">
                    {dayLogs.map((log, index) => {
                      const actionCfg = ACTION_CONFIG[log.accion] || { Icon: Activity, className: '' }
                      const resultCfg = RESULT_CONFIG[log.resultado] || { Icon: Info, className: 'badge-info' }
                      const isLast = index === dayLogs.length - 1

                      return (
                        <div key={log.id} className="timeline-item">
                          <div className="timeline-connector">
                            <div className={`timeline-icon-wrap ${resultCfg.className}`}>
                              <actionCfg.Icon size={16} />
                            </div>
                            {!isLast && <div className="timeline-line"></div>}
                          </div>
                          
                          <div className="timeline-content glass-card">
                            <div className="timeline-header">
                              <div className="timeline-user">
                                <div className="mini-avatar">
                                  {log.usuario?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span className="user-name">{log.usuario}</span>
                                  <span className="action-text">
                                    {' '}{t('realizó una')} <strong>{log.accion.toLowerCase()}</strong> {t('en')} <strong>{log.modulo}</strong>
                                  </span>
                                </div>
                              </div>
                              <div className="timeline-meta">
                                <span className={`result-badge ${resultCfg.className}`}>
                                  <resultCfg.Icon size={14} />
                                  {log.resultado}
                                </span>
                                <span className="timeline-time">
                                  {new Date(log.timestamp).toLocaleTimeString('es-CO', {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                            </div>
                            <div className="timeline-body">
                              <p className="timeline-details">{log.detalles}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </SubPage>
  )
}

/* ── Sub-componente: Tarjeta de estadística ── */
function StatCard({ Icon, label, value, color }) {
  return (
    <div className={`admin-stat-card glass-card stat-${color}`}>
      <div className="stat-icon-wrap">
        <Icon size={22} />
      </div>
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  )
}
