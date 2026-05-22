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
    position_ids: [],
    category_id: '',
    blood_type_id: '',
    emergency_phone: '',
    allergies: '',
    jersey_number: '',
    // Datos del Tutor
    parent_name: '',
    parent_email: '',
    parent_phone: ''
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [positions, setPositions]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [bloodTypes, setBloodTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

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
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        v.forEach(val => data.append(`${k}[]`, val));
      } else {
        data.append(k, v || '');
      }
    });
    if (photoFile) data.append('photo', photoFile);

    try {
      const res = await fetch('/api/players', { method: 'POST', body: data });
      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();
      // Backend devuelve { id, message } — usamos los datos del formulario para mostrar credenciales
      setSuccessData({
        email: formData.parent_email,
        password: 'osos' + new Date().getFullYear(),
        playerId: result.id
      });
    } catch (err) {
      alert('Error al guardar: ' + err.message);
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    const text = `Club Osos de Chiapas\n\nBienvenido a la familia. Se ha creado tu cuenta:\n\nEmail: ${successData.email}\nPass: ${successData.password}\nEntra aquí: ${window.location.origin}/login\n\n¡Te esperamos en el campo! 🏈🐾`;
    navigator.clipboard.writeText(text);
    alert('¡Credenciales copiadas al portapapeles!');
  };

  const inputCls = `w-full border rounded-xl px-4 py-3.5 text-sm outline-none focus:border-red-600 transition-all`;
  const inputStyle = { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-main)' };
  const selectCls = `w-full border rounded-xl px-4 py-3.5 text-sm outline-none appearance-none focus:border-red-600 transition-all`;
  const labelCls = `block text-[9px] font-black uppercase tracking-[0.18em] text-red-600 mb-1.5 ml-0.5`;

  if (successData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
        <div className="max-w-md w-full border rounded-[3rem] p-10 text-center space-y-8 shadow-2xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
           <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
           </div>
           <h2 className="text-3xl font-black italic uppercase tracking-tighter">¡Registro Exitoso!</h2>
           <p className="text-sm font-medium uppercase italic leading-relaxed" style={{ color: 'var(--text-dim)' }}>El jugador y su tutor han sido vinculados. Copia los accesos para compartirlos por WhatsApp.</p>
           
           <div className="border rounded-2xl p-6 text-left space-y-3" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)' }}>
             <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase" style={{ color: 'var(--text-dim)' }}>Usuario:</span><span className="text-xs font-black italic">{successData.email}</span></div>
             <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase" style={{ color: 'var(--text-dim)' }}>Password:</span><span className="text-xs font-black italic">{successData.password}</span></div>
           </div>

           <button onClick={copyToClipboard} className="w-full bg-red-600 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-900/20 active:scale-95 transition-all text-white">COPIAR ACCESOS</button>
           <button onClick={() => navigate(successData.playerId ? `/players/${successData.playerId}` : '/players/list')} className="w-full py-4 font-black uppercase tracking-widest text-[10px]" style={{ color: 'var(--text-dim)' }}>VER FICHA DEL JUGADOR</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
      <header className="border-b backdrop-blur-xl sticky top-0 z-50" style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-main)' }}>
        <div className="max-w-md mx-auto px-5 py-5 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2" style={{ color: 'var(--text-dim)' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7" /></svg></button>
          <span className="font-black text-sm tracking-[0.2em] italic uppercase">Alta <span className="text-red-600">Familiar</span></span>
          <div className="w-6"></div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} className="space-y-10">
          
          <div className="flex flex-col items-center">
             <div onClick={() => fileInputRef.current?.click()} className="w-32 h-32 rounded-[2.5rem] bg-zinc-950 border-2 border-dashed border-zinc-800 flex items-center justify-center overflow-hidden relative group cursor-pointer">
                {photoPreview ? <img src={photoPreview} className="w-full h-full object-cover" /> : <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>}
                <div className="absolute inset-0 bg-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             </div>
             <input ref={fileInputRef} type="file" className="hidden" onChange={handlePhotoChange} />
             <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-4">Foto del Jugador</span>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black italic tracking-[0.3em] uppercase border-l-4 border-red-600 pl-4" style={{ color: 'var(--text-main)' }}>Información del Tutor</h3>
            <div className="grid gap-5">
               <div><label className={labelCls}>Nombre del Padre / Tutor</label><input type="text" name="parent_name" required className={inputCls} style={inputStyle} placeholder="Ej. Pedro García" value={formData.parent_name} onChange={handleInputChange} /></div>
               <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Email de Acceso</label><input type="email" name="parent_email" required className={inputCls} style={inputStyle} placeholder="correo@gmail.com" value={formData.parent_email} onChange={handleInputChange} /></div>
                  <div><label className={labelCls}>Celular (Whats)</label><input type="tel" name="parent_phone" required className={inputCls} style={inputStyle} placeholder="9610000000" value={formData.parent_phone} onChange={handleInputChange} /></div>
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black italic tracking-[0.3em] uppercase text-zinc-300 border-l-4 border-zinc-800 pl-4">Datos del Jugador</h3>
            <div className="grid gap-5">
               <div><label className={labelCls}>Nombre del Jugador</label><input type="text" name="name" required className={inputCls} placeholder="Ej. Juanito García" value={formData.name} onChange={handleInputChange} /></div>
               <div className="grid grid-cols-2 gap-4">
                 <div><label className={labelCls}>Fecha Nacimiento</label><input type="date" name="birth_date" required className={inputCls} value={formData.birth_date} onChange={handleInputChange} /></div>
                 <div><label className={labelCls}>Número de Jersey</label><input type="number" name="jersey_number" className={inputCls} placeholder="00" value={formData.jersey_number} onChange={handleInputChange} /></div>
               </div>
               <div><label className={labelCls}>Categoría</label>
                  <select name="category_id" required className={selectCls} value={formData.category_id} onChange={handleInputChange}>
                     <option value="">Elegir...</option>
                     {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
               </div>
               <div>
                  <label className={labelCls}>Posiciones</label>
                  <div className="grid grid-cols-2 gap-2 bg-[#1e1212] p-4 rounded-xl border border-[#3a2222]/60">
                      {positions.map(p => {
                          const isSelected = formData.position_ids?.includes(p.id);
                          const isPrimary = formData.position_id == p.id;
                          return (
                              <div 
                                  key={p.id} 
                                  onClick={() => {
                                      let newIds = [...(formData.position_ids || [])];
                                      let primaryId = formData.position_id;
                                      if (newIds.includes(p.id)) {
                                          newIds = newIds.filter(id => id !== p.id);
                                          if (primaryId == p.id) primaryId = newIds[0] || '';
                                      } else {
                                          newIds.push(p.id);
                                          if (!primaryId) primaryId = p.id;
                                      }
                                      setFormData({...formData, position_ids: newIds, position_id: primaryId});
                                  }}
                                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-red-600/10 border-red-600/40' : 'border opacity-60'}`}
                                  style={!isSelected ? { backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)' } : {}}
                              >
                                  <span className="text-[9px] font-black uppercase truncate mr-1" style={{ color: 'var(--text-main)' }}>{p.name.replace(/\s*\([^)]*\)/, '')}</span>
                                  {isSelected && (
                                      <div 
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              setFormData({...formData, position_id: p.id});
                                          }}
                                          className={`w-4 h-4 rounded flex items-center justify-center border ${isPrimary ? 'bg-red-600 border-red-500' : 'bg-zinc-800 border-zinc-700'}`}
                                      >
                                          {isPrimary && <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>}
                                      </div>
                                  )}
                              </div>
                          );
                      })}
                  </div>
               </div>
               <div><label className={labelCls}>CURP (Opcional)</label><input type="text" name="curp" maxLength={18} className={inputCls + " uppercase"} value={formData.curp} onChange={handleInputChange} /></div>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-red-900/30 active:scale-95 transition-all">
            {isSubmitting ? 'PROCESANDO VÍNCULO...' : 'GUARDAR FICHA FAMILIAR'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default AddPlayer;
