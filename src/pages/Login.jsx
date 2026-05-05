import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Login.css';

// Mini base de datos simulada — roles: 'admin' | 'user'
const USERS_DB = [
  {
    username: 'heimar',
    email: 'heimar@etb.com.co',
    password: 'Heimar123!', // Cumple con protocolos: 8+ chars, mayúscula, minúscula, número y especial
    role: 'user'
  },
  {
    username: 'Wendy',
    email: 'wendy@etb.com.co',
    password: 'Wendy123!',
    role: 'admin'
  }
];

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Al cargar la página de login, limpiamos la sesión anterior si existiera
  // y cargamos los datos si el usuario seleccionó "Recordarme"
  React.useEffect(() => {
    localStorage.removeItem('currentUser');
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    if (savedPassword) {
      setPassword(savedPassword);
    }
  }, []);

  const validatePassword = (pass) => {
    // Protocolo de seguridad: Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    return pass.length >= minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // Validar protocolos de seguridad de la contraseña ingresada
    if (!validatePassword(password)) {
      setError(t('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.'));
      return;
    }

    // Buscar en la "mini base de datos" (acepta tanto username como email)
    const user = USERS_DB.find(
      u => (u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === email.toLowerCase()) && u.password === password
    );

    if (user) {
      // Manejar la opción "Recordarme"
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', user.email);
        localStorage.setItem('rememberedPassword', user.password);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }

      // Guardar sesión activa ("los datos del usuario en el momento") en el navegador
      localStorage.setItem('currentUser', JSON.stringify({
        username: user.username,
        email: user.email,
        role: user.role || 'user'
      }));
      // Simular login exitoso y redirigir al Dashboard /home
      navigate('/home');
    } else {
      setError(t('Credenciales incorrectas. Verifique su correo/usuario y contraseña.'));
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass-card">
        <div className="login-header">
          <h1 className="login-logo">{t('Iniciar Sesión')}</h1>
          <p className="login-subtitle">{t('Accede para gestionar los equipos y limpieza')}</p>
        </div>

        {error && (
          <div className="login-error" style={{ color: '#ff4d4f', backgroundColor: 'rgba(255, 77, 79, 0.1)', padding: '10px 15px', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', textAlign: 'center', border: '1px solid rgba(255, 77, 79, 0.3)' }}>
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">{t('Correo Electrónico o Usuario')}</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input 
                type="text" 
                id="email"
                className="login-input" 
                placeholder="heimar@etb.com.co "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">{t('Contraseña')}</label>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input 
                type={showPassword ? "text" : "password"} 
                id="password"
                className="login-input" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '40px' }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '5px'
                }}
                aria-label={showPassword ? t('Ocultar contraseña') : t('Mostrar contraseña')}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>{t('Recordarme')}</span>
            </label>
            <a href="#" className="forgot-password">{t('¿Olvidaste tu contraseña?')}</a>
          </div>

          <button type="submit" className="btn btn-primary login-btn">
            {t('Iniciar Sesión')}
          </button>
        </form>

        <div className="login-footer">
          {t('¿No tienes una cuenta?')} <a href="#">{t('Solicitar acceso')}</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
