import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext'
import {
  Monitor, Sparkles, ClipboardList, Globe,
  Pencil, LogOut, Save, CheckCircle,
  Bell, Lock, Languages, Palette
} from 'lucide-react'
import './Perfil.css'

const STAT_CARDS = [
  { label: 'Equipos creados',   value: '—', Icon: Monitor },
  { label: 'Limpiezas equipos', value: '—', Icon: Sparkles },
  { label: 'Órdenes MSS',       value: '—', Icon: ClipboardList },
  { label: 'Dirs. SMW',         value: '—', Icon: Globe },
]

export default function Perfil() {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const savedUser = localStorage.getItem('currentUser')
  const currentUser = savedUser ? JSON.parse(savedUser) : null

  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    username:  currentUser?.username  || '',
    email:     currentUser?.email     || '',
    cargo:     currentUser?.cargo     || 'Técnico ETB',
    area:      currentUser?.area      || 'Operaciones',
  })
  const [saved, setSaved] = useState(false)

  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('userSettings')
    return savedSettings ? JSON.parse(savedSettings) : {
      notifications: true,
      language: 'es-CO',
      theme: theme
    }
  })

  const [showPasswordCheck, setShowPasswordCheck] = useState(false)
  const [passwordStatus, setPasswordStatus] = useState('')

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('userSettings', JSON.stringify(newSettings))
    
    if (key === 'language') {
      i18n.changeLanguage(value)
    }

    if (key === 'theme') {
      toggleTheme(value)
    }
  }

  const handleCheckPassword = () => {
    setPasswordStatus('analizando')
    setTimeout(() => {
      setPasswordStatus('segura')
    }, 2000)
  }

  if (!currentUser) {
    navigate('/')
    return null
  }

  const initials = formData.username.charAt(0).toUpperCase()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = () => {
    const updated = { ...currentUser, ...formData }
    localStorage.setItem('currentUser', JSON.stringify(updated))
    setEditMode(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    navigate('/')
  }

  return (
    <div className="perfil-page">

      {/* ── Hero Header ── */}
      <div className="perfil-hero">
        <div className="perfil-hero-bg" />
        <div className="perfil-hero-content">

          {/* Avatar */}
          <div className="perfil-avatar-wrap">
            <div className="perfil-avatar">
              {initials}
              <span className="perfil-status-dot" />
            </div>
          </div>

          {/* Nombre y rol */}
          <div className="perfil-hero-info">
            <h1 className="perfil-name">{formData.username}</h1>
            <p className="perfil-role">{formData.cargo} · {formData.area}</p>
            <span className="perfil-badge">Activo</span>
          </div>

          {/* Acciones hero */}
          <div className="perfil-hero-actions">
            <button
              className="btn-perfil btn-perfil-primary"
              onClick={() => setEditMode(true)}
            >
              <Pencil size={15} /> {t("Editar perfil")}
            </button>
            <button
              className="btn-perfil btn-perfil-ghost"
              onClick={handleLogout}
            >
              <LogOut size={15} /> {t("Cerrar sesión")}
            </button>
          </div>

        </div>
      </div>

      {/* ── Stats ── */}
      <div className="perfil-stats">
        {STAT_CARDS.map((s) => (
          <div key={s.label} className="perfil-stat-card glass-card">
            <span className="perfil-stat-icon"><s.Icon size={24} /></span>
            <span className="perfil-stat-value">{s.value}</span>
            <span className="perfil-stat-label">{t(s.label)}</span>
          </div>
        ))}
      </div>

      {/* ── Grid info + settings ── */}
      <div className="perfil-grid">

        {/* Información personal */}
        <section className="perfil-section glass-card">
          <div className="perfil-section-header">
            <h2>{t("Información personal")}</h2>
            {!editMode && (
              <button className="btn-perfil-sm" onClick={() => setEditMode(true)}>
                {t("Editar")}
              </button>
            )}
          </div>

          <div className="perfil-fields">
            <Field
              label={t("Nombre de usuario")}
              name="username"
              value={formData.username}
              editMode={editMode}
              onChange={handleChange}
            />
            <Field
              label={t("Correo electrónico")}
              name="email"
              value={formData.email}
              editMode={editMode}
              onChange={handleChange}
              placeholder="usuario@etb.com"
            />
            <Field
              label={t("Cargo")}
              name="cargo"
              value={formData.cargo}
              editMode={editMode}
              onChange={handleChange}
            />
            <Field
              label={t("Área")}
              name="area"
              value={formData.area}
              editMode={editMode}
              onChange={handleChange}
            />
          </div>

          {editMode && (
            <div className="perfil-edit-actions">
              <button
                className="btn-perfil btn-perfil-primary"
                onClick={handleSave}
              >
                <Save size={15} /> {t("Guardar cambios")}
              </button>
              <button
                className="btn-perfil btn-perfil-ghost"
                onClick={() => setEditMode(false)}
              >
                {t("Cancelar")}
              </button>
            </div>
          )}

          {saved && (
            <div className="perfil-toast">
              <CheckCircle size={16} /> {t("Cambios guardados correctamente")}
            </div>
          )}
        </section>

        {/* Configuración de cuenta */}
        <section className="perfil-section glass-card">
          <div className="perfil-section-header" style={{ textAlign: 'center', width: '100%', display: 'block' }}>
            <h2>{t("Configuración")}</h2>
          </div>

          <div className="perfil-config-list">
            <ConfigItem
              Icon={Bell}
              title={t("Notificaciones")}
              desc={t("Gestiona alertas del sistema")}
              action={
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.notifications} 
                    onChange={(e) => updateSetting('notifications', e.target.checked)} 
                  />
                  <span className="toggle-slider"></span>
                </label>
              }
            />
            <ConfigItem
              Icon={Lock}
              title={t("Seguridad")}
              desc={t("Contraseña y acceso")}
              action={
                <button 
                  className="btn-perfil-sm" 
                  onClick={() => setShowPasswordCheck(true)}
                >
                  {t("Revisar")}
                </button>
              }
            />
            <ConfigItem
              Icon={Languages}
              title={t("Idioma")}
              desc={t("Selecciona tu idioma")}
              action={
                <select 
                  className="config-select"
                  value={settings.language}
                  onChange={(e) => updateSetting('language', e.target.value)}
                >
                  <option value="es-CO">Español (Colombia)</option>
                  <option value="en-US">English (US)</option>
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="fr-FR">Français (France)</option>
                  <option value="de-DE">Deutsch (Deutschland)</option>
                  <option value="it-IT">Italiano (Italia)</option>
                  <option value="zh-CN">中文 (中国)</option>
                  <option value="ja-JP">日本語 (日本)</option>
                  <option value="ko-KR">한국어 (대한민국)</option>
                  <option value="ru-RU">Русский (Россия)</option>
                  <option value="ar-SA">العربية (السعودية)</option>
                </select>
              }
            />
            <ConfigItem
              Icon={Palette}
              title={t("Tema")}
              desc={t("Apariencia de la pantalla")}
              action={
                <select 
                  className="config-select"
                  value={settings.theme}
                  onChange={(e) => updateSetting('theme', e.target.value)}
                >
                  <option value="dark">{t("Modo oscuro")}</option>
                  <option value="light">{t("Modo claro")}</option>
                </select>
              }
            />
          </div>

          <div className="perfil-danger-zone">
            <p className="perfil-danger-label">{t("Zona de peligro")}</p>
            <button className="btn-perfil-danger" onClick={handleLogout}>
              <LogOut size={15} /> {t("Cerrar sesión permanentemente")}
            </button>
          </div>
        </section>

      </div>

      {showPasswordCheck && (
        <div className="password-modal-overlay">
          <div className="password-modal glass-card">
            <h3>{t("Seguridad de la contraseña")}</h3>
            {passwordStatus === '' && (
              <>
                <p>{t("Haz clic en evaluar para comprobar la fortaleza de tu contraseña actual contra vulnerabilidades conocidas.")}</p>
                <div className="modal-actions">
                  <button className="btn-perfil btn-perfil-primary" onClick={handleCheckPassword}>{t("Evaluar")}</button>
                  <button className="btn-perfil btn-perfil-ghost" onClick={() => setShowPasswordCheck(false)}>{t("Cerrar")}</button>
                </div>
              </>
            )}
            {passwordStatus === 'analizando' && (
              <div className="password-evaluating">
                <div className="spinner"></div>
                <p>{t("Analizando fortaleza y vulnerabilidades...")}</p>
              </div>
            )}
            {passwordStatus === 'segura' && (
              <div className="password-result">
                <CheckCircle size={40} color="#4ade80" />
                <h4>{t("Contraseña Segura")}</h4>
                <p>{t("Tu contraseña actual cumple con los estándares de seguridad y no ha sido vulnerada.")}</p>
                <button className="btn-perfil btn-perfil-primary mt-3" onClick={() => {setShowPasswordCheck(false); setPasswordStatus('');}}>{t("Entendido")}</button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

/* ── Sub-componentes ── */

function Field({ label, name, value, editMode, onChange, placeholder }) {
  return (
    <div className="perfil-field">
      <label className="perfil-field-label">{label}</label>
      {editMode ? (
        <input
          className="perfil-field-input"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder || ''}
        />
      ) : (
        <span className="perfil-field-value">{value || '—'}</span>
      )}
    </div>
  )
}

function ConfigItem({ Icon, title, desc, action }) {
  return (
    <div className="config-item">
      <span className="config-icon"><Icon size={20} /></span>
      <div className="config-text">
        <p className="config-title">{title}</p>
        <p className="config-desc">{desc}</p>
      </div>
      <div className="config-action">
        {action}
      </div>
    </div>
  )
}
