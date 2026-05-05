import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SubPage from '../components/SubPage';
import { Database, UploadCloud, Download, CheckCircle, Clock, Save, RefreshCw, AlertTriangle } from 'lucide-react';
import './AdminPanel.css';

export default function AdminRespaldo() {
  const { t } = useTranslation();
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => { setIsBackingUp(false); alert(t('Respaldo generado correctamente.')); }, 2000);
  };

  const backupHistory = [
    { id: 1, name: 'etb_backup_20260504_2300.sql.gz', date: '2026-05-04 23:00', size: '142 MB', status: 'Completado', type: 'Automático' },
    { id: 2, name: 'etb_backup_20260503_2300.sql.gz', date: '2026-05-03 23:00', size: '140 MB', status: 'Completado', type: 'Automático' },
    { id: 3, name: 'etb_backup_manual_v1.sql.gz', date: '2026-05-02 15:30', size: '138 MB', status: 'Completado', type: 'Manual' },
    { id: 4, name: 'etb_backup_20260502_2300.sql.gz', date: '2026-05-02 23:00', size: '138 MB', status: 'Fallido', type: 'Automático' },
  ];

  return (
    <SubPage icon={<Database size={18} />} badge={t('Administración')} title={t('Respaldo de Datos')} description={t('Gestiona las copias de seguridad de la base de datos.')}>
      <div className="admin-container">
        <div className="admin-stats-grid">
          <StatCard Icon={Save} label={t('Último Respaldo')} value={t('Hace 16 hrs')} color="emerald" />
          <StatCard Icon={Database} label={t('Espacio Usado')} value="2.4 GB" color="blue" />
          <StatCard Icon={UploadCloud} label={t('Respaldos Totales')} value="34" color="purple" />
        </div>

        <div className="glass-card" style={{ padding: '2rem', marginTop: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h3 style={{ color: '#fff', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={20} color="var(--clr-accent)" /> {t('Crear Respaldo Manual')}
            </h3>
            <p style={{ color: 'var(--clr-muted)', margin: 0, fontSize: '0.95rem', maxWidth: '600px' }}>
              {t('Genera una copia de seguridad instantánea de todos los registros.')}
            </p>
          </div>
          <button className="btn btn-primary" style={{ padding: '0.8rem 1.5rem', fontSize: '1rem', minWidth: '200px', justifyContent: 'center' }} onClick={handleBackup} disabled={isBackingUp}>
            {isBackingUp ? (<><RefreshCw size={18} className="spin" /> {t('Generando...')}</>) : (<><UploadCloud size={18} /> {t('Iniciar Respaldo Ahora')}</>)}
          </button>
        </div>

        <h3 style={{ marginTop: '0.5rem', marginBottom: '1rem', color: '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={20} color="var(--clr-accent)" /> {t('Historial de Copias de Seguridad')}
        </h3>
        <div className="admin-table-wrap glass-card">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead><tr><th>{t('Nombre del Archivo')}</th><th>{t('Fecha')}</th><th>{t('Tipo')}</th><th>{t('Tamaño')}</th><th>{t('Estado')}</th><th style={{ textAlign: 'right' }}>{t('Acciones')}</th></tr></thead>
              <tbody>
                {backupHistory.map(backup => (
                  <tr key={backup.id} className="log-row">
                    <td style={{ color: '#fff', fontWeight: 500 }}><Database size={14} style={{ marginRight: '0.5rem', color: 'var(--clr-muted)', verticalAlign: 'middle' }} />{backup.name}</td>
                    <td className="col-date"><span className="date-main">{backup.date.split(' ')[0]}</span><span className="date-ago">{backup.date.split(' ')[1]}</span></td>
                    <td><span style={{ color: 'var(--clr-muted)', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{t(backup.type)}</span></td>
                    <td><span style={{ color: 'var(--clr-muted)', fontSize: '0.85rem' }}>{backup.size}</span></td>
                    <td>
                      {backup.status === 'Completado' ? (
                        <span className="result-badge badge-success"><CheckCircle size={12} /> {t('Completado')}</span>
                      ) : (
                        <span className="result-badge badge-error"><AlertTriangle size={12} /> {t('Fallido')}</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-toolbar" style={{ padding: '0.4rem', marginLeft: '0.5rem' }} title={t('Descargar')} disabled={backup.status !== 'Completado'}><Download size={16} /></button>
                      <button className="btn-toolbar btn-toolbar-danger" style={{ padding: '0.4rem', marginLeft: '0.5rem' }} title={t('Restaurar')} disabled={backup.status !== 'Completado'}><RefreshCw size={16} /></button>
                    </td>
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
