import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SubPage from '../components/SubPage';
import { 
  Users, UserPlus, Search, Filter, 
  Shield, CheckCircle, XCircle,
  Activity, Mail, Edit, Trash2, Download
} from 'lucide-react';
import './AdminPanel.css';
import { exportUsers } from '../services/exportService';

export default function AdminUsuarios() {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('Todos');

  const usersList = [
    { id: 1, name: 'Carlos Mendoza', email: 'cmendoza@etb.com', role: 'Administrador', status: 'Activo', lastLogin: 'Hace 2 horas', avatar: 'C' },
    { id: 2, name: 'Ana Salazar', email: 'asalazar@etb.com', role: 'Operador', status: 'Activo', lastLogin: 'Hace 5 horas', avatar: 'A' },
    { id: 3, name: 'Luis Felipe Ruiz', email: 'lruiz@etb.com', role: 'Consultor', status: 'Inactivo', lastLogin: 'Hace 3 días', avatar: 'L' },
    { id: 4, name: 'María Gómez', email: 'mgomez@etb.com', role: 'Operador', status: 'Activo', lastLogin: 'Hace 1 día', avatar: 'M' },
    { id: 5, name: 'Jorge Pérez', email: 'jperez@etb.com', role: 'Consultor', status: 'Activo', lastLogin: 'Hace 4 horas', avatar: 'J' },
  ];

  const filteredUsers = usersList.filter(u => {
    if (filterRole !== 'Todos' && u.role !== filterRole) return false;
    if (searchText && !u.name.toLowerCase().includes(searchText.toLowerCase()) && !u.email.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  const handleExport = () => {
    if (filteredUsers.length === 0) return;
    exportUsers(filteredUsers, t);
  };

  return (
    <SubPage
      icon={<Users size={18} />}
      badge={t('Administración')}
      title={t('Gestión de Usuarios')}
      description={t('Administra los accesos, roles y permisos de los usuarios en la plataforma.')}
    >
      <div className="admin-container">
        
        {/* ── Tarjetas de estadísticas ── */}
        <div className="admin-stats-grid">
          <StatCard Icon={Users} label={t('Usuarios Totales')} value="24" color="blue" />
          <StatCard Icon={CheckCircle} label={t('Usuarios Activos')} value="21" color="emerald" />
          <StatCard Icon={Shield} label={t('Administradores')} value="3" color="purple" />
        </div>

        {/* ── Toolbar de Filtros ── */}
        <div className="admin-toolbar glass-card" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="toolbar-filters">
            <div className="filter-group">
              <Filter size={16} />
              <select value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                <option value="Todos">{t('Todos los roles')}</option>
                <option value="Administrador">{t('Administrador')}</option>
                <option value="Operador">{t('Operador')}</option>
                <option value="Consultor">{t('Consultor')}</option>
              </select>
            </div>
            
            <div className="filter-search">
              <Search size={16} />
              <input
                type="text"
                placeholder={t('Buscar por nombre o correo...')}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
            </div>
          </div>
          
          <div className="toolbar-actions">
            <button className="btn-toolbar" onClick={handleExport} title={t('Exportar')} style={{ marginRight: '0.5rem' }}>
              <Download size={16} /> {t('Exportar')}
            </button>
            <button className="btn btn-primary" style={{ padding: '0.6rem 1rem' }}>
              <UserPlus size={16} /> {t('Nuevo Usuario')}
            </button>
          </div>
        </div>

        {/* ── Tabla de Usuarios ── */}
        <div className="admin-table-wrap glass-card">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('Usuario')}</th>
                  <th>{t('Correo Electrónico')}</th>
                  <th>{t('Rol')}</th>
                  <th>{t('Estado')}</th>
                  <th>{t('Último Acceso')}</th>
                  <th style={{ textAlign: 'right' }}>{t('Acciones')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="log-row">
                    <td className="col-user">
                      <div className="user-cell">
                        <div className="mini-avatar" style={{ background: 'rgba(255,255,255,0.1)' }}>
                          {user.avatar}
                        </div>
                        <span style={{ fontWeight: 500, color: '#fff' }}>{user.name}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--clr-muted)' }}>
                        <Mail size={14} /> {user.email}
                      </div>
                    </td>
                    <td>
                      <span className={`result-badge ${user.role === 'Administrador' ? 'badge-warning' : 'badge-info'}`}>
                        {user.role === 'Administrador' ? <Shield size={12} /> : <Users size={12} />}
                        {t(user.role)}
                      </span>
                    </td>
                    <td>
                      <span className={`result-badge ${user.status === 'Activo' ? 'badge-success' : 'badge-error'}`}>
                        {user.status === 'Activo' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {t(user.status)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--clr-muted)', fontSize: '0.85rem' }}>
                        <Activity size={14} /> {user.lastLogin}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-toolbar" style={{ padding: '0.4rem', marginLeft: '0.5rem' }} title={t('Editar usuario')}>
                        <Edit size={16} />
                      </button>
                      <button className="btn-toolbar btn-toolbar-danger" style={{ padding: '0.4rem', marginLeft: '0.5rem' }} title={t('Eliminar usuario')}>
                        <Trash2 size={16} />
                      </button>
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
  );
}
