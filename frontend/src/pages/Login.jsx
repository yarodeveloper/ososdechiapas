import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Forced password change states
  const [forcePasswordChange, setForcePasswordChange] = useState(false);
  const [newPasswordData, setNewPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [tempToken, setTempToken] = useState(null);
  const [tempUser, setTempUser] = useState(null);

  // Password Recovery states
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState(null);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // DETECT FORCED PASSWORD RESET
        // Removed as requested: no forced password change on first login
        /*
        if (data.user.is_first_login) {
          setForcePasswordChange(true);
          setTempToken(data.token);
          setTempUser(data.user);
          return; // Do not navigate yet
        }
        */

        // NORMAL LOGIN
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirection based on role
        if (data.user.role === 'admin' || data.user.role === 'coach') {
          navigate('/admin/dashboard');
        } else {
          navigate('/portal'); 
        }
      } else {
        setError(data.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPasswordData.newPassword !== newPasswordData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (newPasswordData.newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/update-first-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: tempUser.id, newPassword: newPasswordData.newPassword })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', tempToken);
        localStorage.setItem('user', JSON.stringify({ ...tempUser, is_first_login: false }));
        if (tempUser.role === 'admin' || tempUser.role === 'coach') {
          navigate('/admin/dashboard');
        } else {
          navigate('/portal');
        }
      } else {
        setError(data.message || 'Error al actualizar contraseña');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    setRecoveryLoading(true);
    setRecoveryMessage(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: recoveryEmail })
      });

      const data = await response.json();

      if (response.ok) {
        setRecoveryMessage({
          type: 'success',
          text: data.message || 'Se ha enviado la contraseña temporal.'
        });
        if (data.tempPassword) {
          console.log('TEMPORARY PASSWORD FOR TESTING:', data.tempPassword);
        }
      } else {
        setRecoveryMessage({
          type: 'error',
          text: data.message || 'Error al procesar la solicitud'
        });
      }
    } catch (err) {
      setRecoveryMessage({
        type: 'error',
        text: 'Error de conexión con el servidor'
      });
      console.error(err);
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen flex flex-col items-center justify-center px-6">
      {!forcePasswordChange && (
        <Link to="/" className="absolute top-10 left-6 text-zinc-500 hover:text-white flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Volver
        </Link>
      )}

      <div className="w-full max-w-md animate-fade">
        <header className="text-center mb-12">
          {!forcePasswordChange ? (
            <>
              <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-900/20 rotate-3 p-4">
                <img src="/logo_osos.webp" alt="Logo Osos" className="w-full h-full object-contain drop-shadow-2xl" />
              </div>
              <h1 className="text-4xl font-display font-black uppercase italic tracking-tighter">
                Osos <span className="text-red-600 italic">deChiapas</span>
              </h1>
              <p className="text-zinc-400 text-sm font-medium mt-3 tracking-wide">Portal exclusivo para Staff y Jugadores</p>
            </>
          ) : (
            <div className="animate-fade-up">
              <div className="w-24 h-24 bg-red-600/10 border-2 border-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-900/40 text-red-600">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              </div>
              <h1 className="text-3xl font-display font-black uppercase italic tracking-tighter mb-2">Seguridad</h1>
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">Crea tu contraseña privada</p>
              <p className="text-zinc-500 text-xs mt-2">Para proteger tu cuenta, requerimos que cambies la contraseña temporal por una personalizada.</p>
            </div>
          )}
        </header>

        {error && (
            <div className="bg-red-900/20 border border-red-900/50 rounded-xl p-4 mb-6 flex items-start gap-3 animate-shake">
                <svg className="text-red-500 shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-xs font-bold text-red-500 uppercase tracking-wide">{error}</p>
            </div>
        )}

        {!forcePasswordChange ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Email / Usuario</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-red-600 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
                <input
                  type="text" required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600/20 outline-none transition-all placeholder:text-zinc-700"
                  placeholder="ejemplo@osos.com"
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Contraseña</label>
                <button 
                  type="button" 
                  onClick={() => setShowRecoveryModal(true)} 
                  className="text-[10px] font-bold text-red-600 uppercase tracking-widest hover:text-red-500 transition-colors"
                >
                  ¿Olvidaste?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-red-600 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"} required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-12 pr-12 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600/20 outline-none transition-all placeholder:text-zinc-700"
                  placeholder="••••••••"
                  value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-600 hover:text-white transition-colors"
                  title={showPassword ? "Ocultar Contraseña" : "Mostrar Contraseña"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full btn-primary py-4 rounded-xl text-lg flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
              {loading ? 'Validando...' : (
                <>
                  Entrar <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-6 animate-fade-in-up">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-red-600 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                  </div>
                  <input
                    type="password" required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600/20 outline-none transition-all placeholder:text-zinc-700"
                    placeholder="Escribe tu nueva clave"
                    value={newPasswordData.newPassword} onChange={e => setNewPasswordData({ ...newPasswordData, newPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Confirmar Contraseña</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-red-600 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  <input
                    type="password" required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600/20 outline-none transition-all placeholder:text-zinc-700"
                    placeholder="Repite la clave"
                    value={newPasswordData.confirmPassword} onChange={e => setNewPasswordData({ ...newPasswordData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full btn-primary py-4 rounded-xl text-lg flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
              {loading ? 'Guardando...' : (
                <>
                  Actualizar y Entrar <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </>
              )}
            </button>
          </form>
        )}

        {!forcePasswordChange && (
          <footer className="mt-12 text-center">
            <p className="text-zinc-600 text-xs font-medium">¿Aun no eres un Oso? <Link to="/" className="text-red-600 font-bold hover:underline">Únete a las pruebas</Link></p>
          </footer>
        )}
      </div>

      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 animate-fade">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-3xl p-8 shadow-2xl relative space-y-6">
            <button 
              onClick={() => {
                setShowRecoveryModal(false);
                setRecoveryMessage(null);
                setRecoveryEmail('');
              }}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>

            <header className="text-center space-y-2">
              <div className="w-16 h-16 bg-red-600/10 border border-red-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-600 shadow-xl shadow-red-950/20">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              </div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Recuperar <span className="text-red-600">Acceso</span></h2>
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest leading-relaxed">Ingresa tu correo para recibir una clave temporal</p>
            </header>

            <form onSubmit={handleRecoverySubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 px-5 text-white focus:border-red-600 outline-none transition-all placeholder:text-zinc-700 text-sm font-semibold"
                  placeholder="ejemplo@osos.com"
                  value={recoveryEmail}
                  onChange={e => setRecoveryEmail(e.target.value)}
                />
              </div>

              {recoveryMessage && (
                <div className={`p-4 rounded-xl text-center text-[10px] font-black uppercase tracking-widest animate-shake
                  ${recoveryMessage.type === 'success' ? 'bg-green-600/10 text-green-500 border border-green-600/20' : 'bg-red-600/10 text-red-500 border border-red-600/20'}
                `}>
                  {recoveryMessage.text}
                </div>
              )}

              <button 
                type="submit"
                disabled={recoveryLoading}
                className="w-full bg-red-600 text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-red-500 active:scale-95 transition-all disabled:opacity-50"
              >
                {recoveryLoading ? 'ENVIANDO...' : 'RECUPERAR CONTRASEÑA'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
