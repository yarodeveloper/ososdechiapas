import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: 'coach@osos.com', password: 'password123' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Mock login logic
    setTimeout(() => {
      localStorage.setItem('token', 'mock-token');
      navigate('/admin/dashboard');
    }, 1000);
  };

  return (
    <div className="bg-black min-h-screen flex flex-col items-center justify-center px-6">
      <Link to="/" className="absolute top-10 left-6 text-zinc-500 hover:text-white flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        Volver
      </Link>

      <div className="w-full max-w-md animate-fade">
        <header className="text-center mb-12">
          <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-900/20 rotate-3 p-4">
            <img src="/logo_osos.webp" alt="Logo Osos" className="w-full h-full object-contain drop-shadow-2xl" />
          </div>
          <h1 className="text-4xl font-display font-black uppercase italic tracking-tighter">
            Osos <span className="text-red-600 italic">deChiapas</span>
          </h1>
          <p className="text-zinc-400 text-sm font-medium mt-3 tracking-wide">Portal exclusivo para Staff y Jugadores</p>
        </header>

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
              <a href="#" className="text-[10px] font-bold text-red-600 uppercase tracking-widest hover:text-red-500 transition-colors">¿Olvidaste?</a>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-red-600 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
              </div>
              <input
                type="password" required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-12 pr-12 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600/20 outline-none transition-all placeholder:text-zinc-700"
                placeholder="••••••••"
                value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
              <button type="button" className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-600 hover:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
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

        <footer className="mt-12 text-center">
          <p className="text-zinc-600 text-xs font-medium">¿Aun no eres un Oso? <Link to="/" className="text-red-600 font-bold hover:underline">Únete a las pruebas</Link></p>
        </footer>
      </div>
    </div>
  );
};

export default Login;
