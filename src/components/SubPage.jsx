
import './SubPage.css'

export default function SubPage({ icon, badge, title, description, children }) {
  return (
    <section className="page-hero">
      <div className="page-content">
        <div className="page-badge">{icon} {badge}</div>
        <h1 className="page-title">{title}</h1>
        <p className="page-desc">{description}</p>
        {children || (
          <div className="coming-soon">
            <div className="coming-soon-icon">🚧</div>
            <p>Contenido en construcción. Pronto estará disponible.</p>
          </div>
        )}
      </div>
    </section>
  )
}
