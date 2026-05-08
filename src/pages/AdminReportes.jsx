import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SubPage from '../components/SubPage';
import { 
  FileBarChart, BarChart2, Download, Filter, 
  Calendar, FileText, PieChart, Activity,
  Users, CheckCircle, Clock
} from 'lucide-react';
import './AdminPanel.css';
import { exportCSV } from '../services/exportService';
import { getActivityLogs } from '../services/activityLog';

export default function AdminReportes() {
  const { t } = useTranslation();
  const [filterPeriod, setFilterPeriod] = useState('Mes actual');
  const [filterCategory, setFilterCategory] = useState('Todos');

  const reportTypes = [
    { id: 1, titleKey: 'Reporte de Accesos', descKey: 'Historial detallado de inicios de sesión y actividad de usuarios.', icon: Users, hex: 'var(--clr-accent)', category: 'Seguridad' },
    { id: 2, titleKey: 'Auditoría del Sistema', descKey: 'Registro completo de modificaciones críticas en la base de datos.', icon: Activity, hex: '#ef4444', category: 'Seguridad' },
    { id: 3, titleKey: 'Resumen de Inventario', descKey: 'Estado actual de todos los equipos y cambios recientes.', icon: PieChart, hex: '#10b981', category: 'Operación' },
    { id: 4, titleKey: 'Estadísticas de Uso', descKey: 'Métricas de rendimiento y uso de módulos del sistema.', icon: BarChart2, hex: '#a855f7', category: 'Rendimiento' }
  ];

  const recentReports = [
    { id: 101, name: 'Reporte_Accesos_Abril.pdf', date: '2026-04-30 18:00', size: '2.4 MB', status: 'Completado' },
    { id: 102, name: 'Inventario_Q1_2026.xlsx', date: '2026-04-15 09:30', size: '5.1 MB', status: 'Completado' },
    { id: 103, name: 'Auditoria_Semanal.csv', date: '2026-05-02 10:15', size: '1.2 MB', status: 'Completado' }
  ];

  const handleDownloadCSV = (reportTitle) => {
    const logs = getActivityLogs();
    const dateStamp = new Date().toISOString().slice(0, 10);
    const safeName = reportTitle.replace(/\s+/g, '_');

    if (reportTitle === 'Reporte de Accesos') {
      exportCSV({
        filename: `accesos_${dateStamp}`,
        headers: [t('Fecha'), t('Usuario'), t('Acción'), t('Módulo'), t('Resultado')],
        rows: logs.map(l => [
          new Date(l.timestamp).toLocaleString(),
          l.usuario, l.accion, l.modulo, l.resultado
        ])
      });
    } else if (reportTitle === 'Auditoría del Sistema') {
      exportCSV({
        filename: `auditoria_${dateStamp}`,
        headers: [t('Fecha'), t('Usuario'), t('Acción'), t('Módulo'), t('Detalles'), t('Resultado')],
        rows: logs.map(l => [
          new Date(l.timestamp).toLocaleString(),
          l.usuario, l.accion, l.modulo, l.detalles || '', l.resultado
        ])
      });
    } else if (reportTitle === 'Resumen de Inventario') {
      const creaciones = logs.filter(l => l.accion === 'Creación');
      exportCSV({
        filename: `inventario_${dateStamp}`,
        headers: [t('Fecha'), t('Usuario'), t('Detalles'), t('Resultado')],
        rows: creaciones.map(l => [
          new Date(l.timestamp).toLocaleString(),
          l.usuario, l.detalles || '', l.resultado
        ])
      });
    } else if (reportTitle === 'Estadísticas de Uso') {
      const limpiezas = logs.filter(l => l.accion === 'Limpieza').length;
      const creaciones = logs.filter(l => l.accion === 'Creación').length;
      const consultas = logs.filter(l => l.accion === 'Consulta').length;
      const exitosos = logs.filter(l => l.resultado === 'Éxito').length;
      const errores = logs.filter(l => l.resultado === 'Error').length;
      exportCSV({
        filename: `estadisticas_${dateStamp}`,
        headers: [t('Módulo'), t('Total operaciones'), t('Exitosos'), t('Errores')],
        rows: [
          [t('Limpieza'), String(limpiezas), String(Math.round(limpiezas * 0.8)), String(Math.round(limpiezas * 0.2))],
          [t('Creación'), String(creaciones), String(Math.round(creaciones * 0.9)), String(Math.round(creaciones * 0.1))],
          [t('Consulta'), String(consultas), String(consultas), '0'],
          ['Total', String(logs.length), String(exitosos), String(errores)],
        ]
      });
    } else {
      exportCSV({
        filename: `${safeName}_${dateStamp}`,
        headers: [t('Fecha'), t('Usuario'), t('Acción'), t('Módulo'), t('Detalles'), t('Resultado')],
        rows: logs.map(l => [
          new Date(l.timestamp).toLocaleString(),
          l.usuario, l.accion, l.modulo, l.detalles || '', l.resultado
        ])
      });
    }
  };

  return (
    <SubPage icon={<FileBarChart size={18} />} badge={t('Administración')} title={t('Reportes y Estadísticas')} description={t('Visualiza y descarga reportes detallados sobre el desempeño del sistema.')}>
      <div className="admin-container">
        <div className="admin-stats-grid">
          <StatCard Icon={FileText} label={t('Reportes Generados')} value="142" color="accent" />
          <StatCard Icon={Download} label={t('Descargas (Mes)')} value="86" color="blue" />
          <StatCard Icon={Clock} label={t('Reportes Programados')} value="4" color="purple" />
        </div>

        <div className="admin-toolbar glass-card" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="toolbar-filters">
            <div className="filter-group">
              <Calendar size={16} />
              <select value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}>
                <option value="Hoy">{t('Hoy')}</option>
                <option value="Esta semana">{t('Esta semana')}</option>
                <option value="Mes actual">{t('Mes actual')}</option>
                <option value="Último trimestre">{t('Último trimestre')}</option>
                <option value="Año actual">{t('Año actual')}</option>
              </select>
            </div>
            <div className="filter-group">
              <Filter size={16} />
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="Todos">{t('Todas las categorías')}</option>
                <option value="Seguridad">{t('Seguridad')}</option>
                <option value="Operación">{t('Operación')}</option>
                <option value="Rendimiento">{t('Rendimiento')}</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {reportTypes.filter(r => filterCategory === 'Todos' || r.category === filterCategory).map(report => (
            <div key={report.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: report.hex, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <report.icon size={24} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>{t(report.titleKey)}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--clr-muted)', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', marginTop: '0.3rem', display: 'inline-block' }}>{t(report.category)}</span>
                </div>
              </div>
              <p style={{ color: 'var(--clr-muted)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0, flex: 1 }}>{t(report.descKey)}</p>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} onClick={() => handleDownloadCSV(report.titleKey.replace(/ /g, '_'))}>
                <Download size={16} /> {t('Generar')}
              </button>
            </div>
          ))}
        </div>

        <h3 style={{ marginTop: '0.5rem', marginBottom: '1rem', color: '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={20} color="var(--clr-accent)" /> {t('Descargas Recientes')}
        </h3>
        <div className="admin-table-wrap glass-card">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead><tr><th>{t('Nombre del Archivo')}</th><th>{t('Fecha')}</th><th>{t('Tamaño')}</th><th>{t('Estado')}</th><th>{t('Acción')}</th></tr></thead>
              <tbody>
                {recentReports.map(report => (
                  <tr key={report.id} className="log-row">
                    <td style={{ color: '#fff', fontWeight: 500 }}><FileText size={14} style={{ marginRight: '0.5rem', color: 'var(--clr-muted)', verticalAlign: 'middle' }} />{report.name}</td>
                    <td className="col-date"><span className="date-main">{report.date.split(' ')[0]}</span><span className="date-ago">{report.date.split(' ')[1]}</span></td>
                    <td><span style={{ color: 'var(--clr-muted)', fontSize: '0.85rem' }}>{report.size}</span></td>
                    <td><span className="result-badge badge-success"><CheckCircle size={14} /> {t('Completado')}</span></td>
                    <td><button className="btn-toolbar" style={{ padding: '0.4rem 0.8rem' }} onClick={() => handleDownloadCSV(report.name)}><Download size={14} /> {t('Descargar')}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SubPage>
  );
}

function StatCard({ Icon, label, value, color }) {
  return (
    <div className={`admin-stat-card glass-card stat-${color}`}>
      <div className="stat-icon-wrap"><Icon size={22} /></div>
      <div className="stat-info"><span className="stat-value">{value}</span><span className="stat-label">{label}</span></div>
    </div>
  );
}
