import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Monitor, PlusCircle, MapPin, ClipboardList, ArrowRight,
  ShieldCheck, Activity, Users, FileBarChart, Settings, Database
} from 'lucide-react'
import './Home.css'

/* ── Cards para usuarios normales ── */
const userCards = [
  {
    Icon: Monitor,
    title: 'Limpieza de equipos',
    desc: 'Gestión y limpieza del inventario de equipos.',
    path: '/limpieza-equipos',
  },
  {
    Icon: PlusCircle,
    title: 'Creación de equipos',
    desc: 'Registro y alta de nuevos equipos en el sistema.',
    path: '/creacion-equipos',
  },
  {
    Icon: MapPin,
    title: 'Limpieza SMW',
    desc: 'Depuración y normalización de direcciones SMW.',
    path: '/limpieza-smw',
  },
  {
    Icon: ClipboardList,
    title: 'Limpieza MSS',
    desc: 'Revisión y limpieza de órdenes del sistema MSS.',
    path: '/limpieza-mss',
  },
]

/* ── Cards para administradores ── */
const adminCards = [
  {
    Icon: Activity,
    title: 'Registro de Actividad',
    desc: 'Consulta y auditoría de todas las operaciones realizadas por los usuarios.',
    path: '/admin/actividad',
    accent: 'purple',
  },
  {
    Icon: Users,
    title: 'Gestión de Usuarios',
    desc: 'Administración de cuentas, roles y permisos del sistema.',
    path: '/admin/usuarios',
    accent: 'blue',
  },
  {
    Icon: FileBarChart,
    title: 'Reportes y Estadísticas',
    desc: 'Métricas de rendimiento, tasas de éxito y errores por módulo.',
    path: '/admin/reportes',
    accent: 'emerald',
  },
  {
    Icon: Database,
    title: 'Respaldo de Datos',
    desc: 'Exportación de registros y gestión de la integridad de datos.',
    path: '/admin/respaldo',
    accent: 'amber',
  },
]

/* ── Configuración de acentos para cards admin ── */
const accentMap = {
  purple:  { bg: 'rgba(168, 85, 247, 0.10)', border: 'rgba(168, 85, 247, 0.25)', color: '#c084fc', glow: 'rgba(168, 85, 247, 0.35)' },
  blue:    { bg: 'rgba(56, 189, 248, 0.10)', border: 'rgba(56, 189, 248, 0.25)', color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.35)' },
  emerald: { bg: 'rgba(52, 211, 153, 0.10)', border: 'rgba(52, 211, 153, 0.25)', color: '#34d399', glow: 'rgba(52, 211, 153, 0.35)' },
  amber:   { bg: 'rgba(251, 191, 36, 0.10)', border: 'rgba(251, 191, 36, 0.25)', color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.35)' },
}

export default function Home() {
  const { t } = useTranslation()
  const savedUser = localStorage.getItem('currentUser')
  const currentUser = savedUser ? JSON.parse(savedUser) : null
  const isAdmin = currentUser?.role === 'admin'

  const cards = isAdmin 
    ? adminCards.map(c => ({ ...c, title: t(c.title), desc: t(c.desc) }))
    : userCards.map(c => ({ ...c, title: t(c.title), desc: t(c.desc) }))

  return (
    <section className="hero">
      <div className="hero-content">
        {/* ── Badge dinámico según rol ── */}
        {isAdmin ? (
          <span className="hero-badge hero-badge--admin">
            <ShieldCheck size={14} />
            {t('Panel de Administración')}
          </span>
        ) : (
          <span className="hero-badge">{t('Centro de Operaciones')}</span>
        )}

        <h1 className="hero-title">
          {isAdmin ? t('Administración') : t('Gestión Automatizada')}
        </h1>
        <p className="hero-subtitle">
          {isAdmin
            ? t('Supervisa, audita y gestiona todos los procesos y usuarios de la plataforma ETB.')
            : t('Plataforma centralizada para la optimización y control de procesos técnicos ETB.')}
        </p>

        <div className="hero-cards">
          {cards.map((c) => {
            const accent = c.accent ? accentMap[c.accent] : null
            return (
              <Link
                to={c.path}
                key={c.title}
                className={`card glass-card ${c.accent ? 'card--admin' : ''}`}
                style={accent ? {
                  '--admin-bg': accent.bg,
                  '--admin-border': accent.border,
                  '--admin-color': accent.color,
                  '--admin-glow': accent.glow,
                } : undefined}
              >
                <div
                  className="card-icon-wrapper"
                  style={accent ? {
                    background: accent.bg,
                    borderColor: accent.border,
                    color: accent.color,
                  } : undefined}
                >
                  <c.Icon size={24} />
                </div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
                <div className="card-arrow" style={accent ? { color: accent.color } : undefined}>
                  <ArrowRight size={16} />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
