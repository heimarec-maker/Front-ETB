import { useTranslation } from 'react-i18next'
import './Footer.css'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="footer">
      <p>{t('© 2026 ETB · Todos los derechos reservados')}</p>
    </footer>
  )
}
