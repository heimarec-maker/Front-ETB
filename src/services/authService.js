/**
 * Servicio de autenticación (mock con localStorage).
 * Simula login/logout sin backend real.
 */

// Usuarios de prueba predefinidos
const MOCK_USERS = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@etb.com.co',
    password: 'Admin123*',
    role: 'admin',
    cargo: 'Administrador ETB',
    area: 'Operaciones',
  },
  {
    id: '2',
    username: 'heimar',
    email: 'heimar@etb.com.co',
    password: 'Heimar123*',
    role: 'user',
    cargo: 'Técnico ETB',
    area: 'Operaciones',
  },
  {
    id: '3',
    username: 'wendy',
    email: 'wendy@etb.com.co',
    password: 'Wendy123*',
    role: 'admin',
    cargo: 'Administradora ETB',
    area: 'Operaciones',
  },
]

// ─── Login ────────────────────────────────────────────────────────────────────
/**
 * Simula un login buscando en la lista de usuarios mock.
 * Acepta email o username.
 * @param {string} identifier - Email o username.
 * @param {string} password
 * @returns {{ user: object }}
 */
export const loginBackend = async (identifier, password) => {
  // Simular latencia de red
  await new Promise(resolve => setTimeout(resolve, 600))

  const user = MOCK_USERS.find(
    u =>
      (u.email === identifier || u.username === identifier) &&
      u.password === password
  )

  if (!user) {
    throw new Error('Credenciales incorrectas. Verifica tu usuario y contraseña.')
  }

  // Devolver sin el password
  const { password: _, ...safeUser } = user
  return { user: safeUser }
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logoutBackend = async () => {
  // Nada que hacer en un mock
}
