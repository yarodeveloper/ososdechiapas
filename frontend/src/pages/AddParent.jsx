import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AddParent = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/users/parents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al guardar el padre');
      }

      // Success
      navigate('/admin/payments'); // Redirect to payments as that's where the user was stuck
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Shared styles (matching AddPlayer.jsx) ──────────────────────────────────
  const inputCls = `w-full bg-[#1e1212] border border-[#3a2222]/60 text-white placeholder-zinc-600
    rounded-xl px-4 py-3.5 text-sm outline-none focus:border-red-700/60 focus:bg-[#221515]
    transition-all duration-200`;
  const labelCls = `block text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500 mb-1.5 ml-0.5`;

  return (
    <div className="bg-[#0d0d0d] text-white min-h-screen flex flex-col pb-24 font-outfit">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="border-b border-white/5">
        <div className="max-w-md mx-auto px-5 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="font-black text-sm tracking-wide text-white uppercase italic">Alta de Papá / Tutor</span>
          </button>
          <span className="font-black italic text-sm tracking-[0.2em] text-zinc-500">OSOS</span>
        </div>
      </header>

      <main className="flex-grow px-5 py-6 max-w-md mx-auto w-full">
        <div className="mb-8">
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">Nuevo Miembro</h1>
            <p className="text-zinc-500 text-xs font-medium leading-relaxed">
                Registra la información del padre o tutor legal para poder gestionar pagos y vinculación de jugadores.
            </p>
        </div>

        {error && (
            <div className="bg-red-900/20 border border-red-900/50 rounded-xl p-4 mb-6 flex items-start gap-3">
                <svg className="text-red-500 shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-xs font-bold text-red-500 uppercase tracking-wide">{error}</p>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Avatar Circle ─────────────────────────────────────────────── */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1e1212] to-[#0d0d0d] border border-[#3a2222]/40 flex items-center justify-center shadow-2xl relative group">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5" className="opacity-60">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
                <div className="absolute inset-0 rounded-full bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>

          {/* ── Nombre ──────────────────────────────────────────────────── */}
          <div>
            <label className={labelCls}>Nombre Completo</label>
            <input
              type="text" name="name" required
              className={inputCls}
              placeholder="Ej. Ricardo Morales"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          {/* ── Email ───────────────────────────────────────────────────── */}
          <div>
            <label className={labelCls}>Correo Electrónico</label>
            <input
              type="email" name="email" required
              className={inputCls}
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          {/* ── Teléfono ────────────────────────────────────────────────── */}
          <div>
            <label className={labelCls}>Número Celular (Opcional)</label>
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.06 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-.76a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 15.92z"/>
              </svg>
              <input
                type="tel" name="phone"
                className={`${inputCls} pl-11`}
                placeholder="961 000 0000"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* ── Password ────────────────────────────────────────────────── */}
          <div className="bg-[#130d0d] border border-[#2a1515]/60 rounded-2xl p-4 mt-2">
            <div className="flex items-center gap-2 mb-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <span className="text-[8px] font-black uppercase tracking-widest text-red-600">Acceso a Plataforma</span>
            </div>
            <label className={labelCls}>Contraseña Temporal</label>
            <input
              type="text" name="password"
              className={inputCls}
              placeholder="Por defecto: osos2026"
              value={formData.password}
              onChange={handleInputChange}
            />
            <p className="text-[9px] text-zinc-600 mt-2 italic font-medium">
              El usuario podrá cambiar su contraseña al iniciar sesión por primera vez.
            </p>
          </div>

          {/* ── Submit Button ─────────────────────────────────────────────── */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-2xl font-black text-white text-sm uppercase tracking-[0.15em] transition-all
                ${isSubmitting
                  ? 'bg-red-900/50 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 active:scale-95 shadow-lg shadow-red-900/40'
                }`}
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Papá'}
            </button>
          </div>
        </form>
      </main>

      {/* ── Bottom Navigation ─────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0d0d0d]/95 backdrop-blur-xl border-t border-white/5 z-50">
        <div className="max-w-md mx-auto px-6 h-16 flex justify-between items-center">
          <Link to="/admin/dashboard" className="flex flex-col items-center gap-1 text-zinc-600 hover:text-white transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <path d="M9 22V12h6v10"/>
            </svg>
            <span className="text-[8px] font-bold uppercase tracking-widest">Inicio</span>
          </Link>

          <Link to="/admin/payments" className="flex flex-col items-center gap-1 text-zinc-600 hover:text-white transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
              <rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
            <span className="text-[8px] font-bold uppercase tracking-widest text-red-500">Caja</span>
          </Link>

          <Link to="/players/list" className="flex flex-col items-center gap-1 text-zinc-600 hover:text-white transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
            <span className="text-[8px] font-bold uppercase tracking-widest">Roster</span>
          </Link>

          <button className="flex flex-col items-center gap-1 text-zinc-600 hover:text-white transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="text-[8px] font-bold uppercase tracking-widest">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default AddParent;
