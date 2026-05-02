import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import etbLogo from '../assets/logo ETB-02.png'
import './Navbar.css'

const navItems = [
  { label: 'Limpieza de equipos',       path: '/limpieza-equipos' },
  { label: 'Creación de equipos',        path: '/creacion-equipos' },
  { label: 'Limpieza de direcciones smw', path: '/limpieza-smw'    },
  { label: 'Limpieza de ordenes MSS',    path: '/limpieza-mss'     },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="navbar">
      {/* Logo → vuelve al inicio */}
      <Link to="/" className="navbar-brand" onClick={() => setOpen(false)}>
        <img src={etbLogo} alt="Logo ETB" className="navbar-logo" />
      </Link>

      {/* Desktop links */}
      <ul className={`navbar-links ${open ? 'open' : ''}`}>
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Hamburger */}
      <button
        className={`hamburger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Abrir menú"
      >
        <span /><span /><span />
      </button>
    </nav>
  )
}
