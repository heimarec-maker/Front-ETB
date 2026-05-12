import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../context/UserContext';
import './Login.css';

import { loginBackend } from '../services/authService';

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, currentUser } = useUser();

  React.useEffect(() => {
    if (currentUser) {
      navigate('/home');
    }
  }, [currentUser, navigate]);

  // Cargar datos de "Recordarme"
  React.useEffect(() => {
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

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email) {
      setError(t('El correo o usuario es obligatorio.'));
      setIsLoading(false);
      return;
    }
    
    if (!password) {
      setError(t('La contraseña es obligatoria.'));
      setIsLoading(false);
      return;
    }

    try {
      const { user } = await loginBackend(email, password);

      // Manejar la opción "Recordarme"
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedPassword', password);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }

      // Guardar sesión activa en el context
      login({
        username: user.username || email.split('@')[0],
        email: user.email || email,
        role: user.role || 'user',
        cargo: user.cargo || 'Técnico ETB',
        area: user.area || 'Operaciones',
        ...user
      });

      // Redirigir al Dashboard /home
      navigate('/home');

    } catch (err) {
      setError(err.message || t('Error al conectar con el servidor.'));
    } finally {
      setIsLoading(false);
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
                onPaste={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
                autoComplete="email"
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
                onPaste={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
                autoComplete="off"
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

          <button type="submit" className="btn btn-primary login-btn" disabled={isLoading}>
            {isLoading ? t('Conectando...') : t('Iniciar Sesión')}
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
