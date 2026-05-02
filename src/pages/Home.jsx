import { Link } from 'react-router-dom'
import './Home.css'

const cards = [
  { icon: '🖥️', title: 'Limpieza de equipos',        desc: 'Gestión y limpieza del inventario de equipos.',     path: '/limpieza-equipos' },
  { icon: '➕', title: 'Creación de equipos',         desc: 'Registro y alta de nuevos equipos en el sistema.',  path: '/creacion-equipos' },
  { icon: '📍', title: 'Limpieza de direcciones smw', desc: 'Depuración y normalización de direcciones SMW.',   path: '/limpieza-smw'    },
  { icon: '📋', title: 'Limpieza de ordenes MSS',     desc: 'Revisión y limpieza de órdenes del sistema MSS.',  path: '/limpieza-mss'    },
]

export default function Home() {
  return (
    <section className="hero">
      <div className="hero-content">
        <span className="hero-badge">Portal de Gestión</span>
        <h1 className="hero-title">Bienvenido</h1>
        <p className="hero-subtitle">
          Selecciona una opción del menú para comenzar a gestionar tus procesos ETB.
        </p>
        <div className="hero-cards">
          {cards.map((c) => (
            <Link to={c.path} key={c.path} className="card">
              <div className="card-icon">{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
