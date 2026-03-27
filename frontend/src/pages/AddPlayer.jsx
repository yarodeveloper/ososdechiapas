import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AddPlayer = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    curp: '',
    position_id: '',
    category_id: '',
    blood_type_id: '',
    emergency_phone: '',
    allergies: ''
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [positions, setPositions]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [bloodTypes, setBloodTypes] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [curpError, setCurpError]       = useState('');

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [posRes, catRes, bloodRes] = await Promise.all([
          fetch('/api/catalogs/positions'),
          fetch('/api/categories'),
          fetch('/api/catalogs/blood-types'),
        ]);
        setPositions(await posRes.json());
        setCategories(await catRes.json());
        setBloodTypes(await bloodRes.json());
      } catch (err) {
        console.error('Error cargando catálogos', err);
      }
    };
    loadCatalogs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'curp') {
      const upper = value.toUpperCase();
      setFormData(p => ({ ...p, curp: upper }));
      setCurpError(upper.length > 0 && upper.length !== 18 ? 'La CURP debe tener exactamente 18 caracteres' : '');
    } else {
      setFormData(p => ({ ...p, [name]: value }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('El archivo excede el límite de 5MB'); return; }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.curp.length !== 18) { setCurpError('CURP inválida'); return; }
    setIsSubmitting(true);
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    if (photoFile) data.append('photo', photoFile);
    try {
      const res = await fetch('/api/players', { method: 'POST', body: data });
      if (!res.ok) throw new Error(await res.text());
      navigate('/players/list');
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Shared styles ──────────────────────────────────────────────────────────
  const inputCls = `w-full bg-[#1e1212] border border-[#3a2222]/60 text-white placeholder-zinc-600
    rounded-xl px-4 py-3.5 text-sm outline-none focus:border-red-700/60 focus:bg-[#221515]
    transition-all duration-200`;
  const selectCls = `w-full bg-[#1e1212] border border-[#3a2222]/60 text-white
    rounded-xl px-4 py-3.5 text-sm outline-none appearance-none
    focus:border-red-700/60 transition-all duration-200`;
  const labelCls = `block text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500 mb-1.5 ml-0.5`;

  return (
    <div className="bg-[#0d0d0d] text-white min-h-screen flex flex-col pb-24">

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
            <span className="font-black text-sm tracking-wide text-white">Alta de Jugador</span>
          </button>
          <span className="font-black italic text-sm tracking-[0.2em] text-zinc-500">OSOS</span>
        </div>
      </header>

      <main className="flex-grow px-5 py-6 max-w-md mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Photo Upload ─────────────────────────────────────────────── */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="relative cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={`w-32 h-32 rounded-full border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-colors
                ${photoPreview ? 'border-red-700' : 'border-zinc-700 group-hover:border-zinc-500'} bg-zinc-900`}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Jugador" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mt-2">Subir Foto</span>
                  </>
                )}
              </div>
              {/* Red camera button */}
              <div className="absolute bottom-0 right-0 w-9 h-9 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-900/50 group-hover:scale-110 transition-transform">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
            </div>
            <input
              ref={fileInputRef} type="file" className="hidden"
              accept="image/jpeg,image/png" onChange={handlePhotoChange}
            />
            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mt-4">
              Formato JPG o PNG (Max 5MB)
            </p>
          </div>

          {/* ── Nombre Completo ──────────────────────────────────────────── */}
          <div>
            <label className={labelCls}>Nombre Completo</label>
            <input
              type="text" name="name" required
              className={inputCls}
              placeholder="Ej. Juan Pérez García"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          {/* ── Fecha de Nacimiento ──────────────────────────────────────── */}
          <div>
            <label className={labelCls}>Fecha de Nacimiento</label>
            <input
              type="date" name="birth_date" required
              className={inputCls}
              value={formData.birth_date}
              onChange={handleInputChange}
            />
          </div>

          {/* ── CURP ─────────────────────────────────────────────────────── */}
          <div>
            <label className={labelCls}>CURP</label>
            <input
              type="text" name="curp" maxLength={18} required
              className={`${inputCls} uppercase ${curpError ? 'border-red-700 bg-[#250e0e]' : ''}`}
              placeholder="18 CARACTERES"
              value={formData.curp}
              onChange={handleInputChange}
            />
            {curpError && (
              <p className="text-[9px] text-red-500 font-bold uppercase tracking-wide mt-1 ml-0.5">{curpError}</p>
            )}
          </div>

          {/* ── Posición + Categoría ─────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Posición</label>
              <div className="relative">
                <select
                  name="position_id" required
                  className={selectCls}
                  value={formData.position_id}
                  onChange={handleInputChange}
                >
                  <option value="" disabled>Elegir...</option>
                  {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </div>
            </div>
            <div>
              <label className={labelCls}>Categoría</label>
              <div className="relative">
                <select
                  name="category_id" required
                  className={selectCls}
                  value={formData.category_id}
                  onChange={handleInputChange}
                >
                  <option value="" disabled>Elegir...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </div>
            </div>
          </div>

          {/* ── Tipo de Sangre ───────────────────────────────────────────── */}
          <div>
            <label className={labelCls}>Tipo de Sangre</label>
            <div className="relative">
              <select
                name="blood_type_id" required
                className={selectCls}
                value={formData.blood_type_id}
                onChange={handleInputChange}
              >
                <option value="" disabled>Seleccionar</option>
                {bloodTypes.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
          </div>

          {/* ── Alergias ─────────────────────────────────────────────────────── */}
          <div>
            <label className={labelCls}>Alergias / Padecimientos</label>
            <input
              type="text" name="allergies"
              className={inputCls}
              placeholder="Ej. Alérgico a la penicilina, Asma..."
              value={formData.allergies}
              onChange={handleInputChange}
            />
          </div>

          {/* ── Contacto de Emergencia ───────────────────────────────────── */}
          <div>
            <label className={labelCls}>Contacto de Emergencia</label>
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.06 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-.76a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 15.92z"/>
              </svg>
              <input
                type="tel" name="emergency_phone" required
                className={`${inputCls} pl-11`}
                placeholder="961 000 0000"
                value={formData.emergency_phone}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* ── Submit Button ─────────────────────────────────────────────── */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !!curpError}
              className={`w-full py-4 rounded-2xl font-black text-white text-sm uppercase tracking-[0.15em] transition-all
                ${isSubmitting || !!curpError
                  ? 'bg-red-900/50 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 active:scale-95 shadow-lg shadow-red-900/40'
                }`}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Registro'}
            </button>
          </div>

          {/* ── Privacy Notice ────────────────────────────────────────────── */}
          <div className="bg-[#130d0d] border border-[#2a1515]/80 rounded-2xl p-4 mt-2">
            <div className="flex items-center gap-2 mb-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span className="text-[8px] font-black uppercase tracking-widest text-red-600">Aviso de Privacidad</span>
            </div>
            <p className="text-[9px] leading-relaxed text-zinc-600">
              Al registrar este perfil, confirmas que los datos proporcionados son verídicos y que el club Osos de Chiapas podrá utilizarlos para fines administrativos y deportivos de acuerdo a la normativa vigente.
            </p>
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

          <Link to="/players/list" className="flex flex-col items-center gap-1 text-zinc-600 hover:text-white transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
            <span className="text-[8px] font-bold uppercase tracking-widest">Roster</span>
          </Link>

          <button className="flex flex-col items-center gap-1 text-red-500">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M20 8v6M23 11h-6" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
            <span className="text-[8px] font-bold uppercase tracking-widest">Registro</span>
          </button>

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

export default AddPlayer;
