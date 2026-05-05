import { Navigate } from 'react-router-dom'

/**
 * Componente de protección de rutas basado en roles.
 * Si el usuario no está autenticado, redirige al login.
 * Si el usuario no tiene el rol requerido, redirige al home.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente a renderizar si el acceso es válido.
 * @param {string} [props.requiredRole] - Rol requerido (ej: 'admin'). Si no se especifica, solo valida autenticación.
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const savedUser = localStorage.getItem('currentUser')
  const currentUser = savedUser ? JSON.parse(savedUser) : null

  // Sin sesión → redirigir al login
  if (!currentUser) {
    return <Navigate to="/" replace />
  }

  // Si requiere un rol específico y no lo tiene → redirigir al home
  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/home" replace />
  }

  return children
}
