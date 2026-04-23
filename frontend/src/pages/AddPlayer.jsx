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
  const [successData, setSuccessData] = useState(null); // Para mostrar las credenciales al final

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
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    if (photoFile) data.append('photo', photoFile);

    try {
      const res = await fetch('/api/players', { method: 'POST', body: data });
      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();
      setSuccessData(result.credentials); // Guardamos credenciales para el botón de copiar
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

  const inputCls = `w-full bg-[#1e1212] border border-[#3a2222]/60 text-white placeholder-zinc-600 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-red-700/60 focus:bg-[#221515] transition-all`;
  const selectCls = `w-full bg-[#1e1212] border border-[#3a2222]/60 text-white rounded-xl px-4 py-3.5 text-sm outline-none appearance-none focus:border-red-700/60 transition-all`;
  const labelCls = `block text-[9px] font-black uppercase tracking-[0.18em] text-red-600 mb-1.5 ml-0.5`;

  if (successData) {
    return (
      <div className="bg-[#0d0d0d] min-h-screen text-white flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-zinc-950 border border-zinc-900 rounded-[3rem] p-10 text-center space-y-8 shadow-2xl animate-in fade-in zoom-in duration-500">
           <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
           </div>
           <h2 className="text-3xl font-black italic uppercase tracking-tighter">¡Registro Exitoso!</h2>
           <p className="text-zinc-500 text-sm font-medium uppercase italic leading-relaxed">El jugador y su tutor han sido vinculados. Copia los accesos para compartirlos por WhatsApp.</p>
           
           <div className="bg-black border border-zinc-900 rounded-2xl p-6 text-left space-y-3">
             <div className="flex justify-between items-center"><span className="text-[10px] font-black text-zinc-600 uppercase">Usuario:</span><span className="text-xs font-black italic">{successData.email}</span></div>
             <div className="flex justify-between items-center"><span className="text-[10px] font-black text-zinc-600 uppercase">Password:</span><span className="text-xs font-black italic">{successData.password}</span></div>
           </div>

           <button onClick={copyToClipboard} className="w-full bg-red-600 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-900/20 active:scale-95 transition-all">COPIAR ACCESOS</button>
           <button onClick={() => navigate('/players/list')} className="w-full py-4 text-zinc-600 font-black uppercase tracking-widest text-[10px]">VER ROSTER</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0d0d0d] text-white min-h-screen pb-20">
      <header className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-md mx-auto px-5 py-5 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7" /></svg></button>
          <span className="font-black text-sm tracking-[0.2em] italic uppercase">Alta <span className="text-red-600">Familiar</span></span>
          <div className="w-6"></div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* FOTO */}
          <div className="flex flex-col items-center">
             <div onClick={() => fileInputRef.current?.click()} className="w-32 h-32 rounded-[2.5rem] bg-zinc-950 border-2 border-dashed border-zinc-800 flex items-center justify-center overflow-hidden relative group cursor-pointer">
                {photoPreview ? <img src={photoPreview} className="w-full h-full object-cover" /> : <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>}
                <div className="absolute inset-0 bg-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             </div>
             <input ref={fileInputRef} type="file" className="hidden" onChange={handlePhotoChange} />
             <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-4">Foto del Jugador</span>
          </div>

          {/* SECCION TUTOR */}
          <div className="space-y-6">
            <h3 className="text-xs font-black italic tracking-[0.3em] uppercase text-zinc-300 border-l-4 border-red-600 pl-4">Información del Tutor</h3>
            <div className="grid gap-5">
               <div><label className={labelCls}>Nombre del Padre / Tutor</label><input type="text" name="parent_name" required className={inputCls} placeholder="Ej. Pedro García" value={formData.parent_name} onChange={handleInputChange} /></div>
               <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Email de Acceso</label><input type="email" name="parent_email" required className={inputCls} placeholder="correo@gmail.com" value={formData.parent_email} onChange={handleInputChange} /></div>
                  <div><label className={labelCls}>Celular (Whats)</label><input type="tel" name="parent_phone" required className={inputCls} placeholder="9610000000" value={formData.parent_phone} onChange={handleInputChange} /></div>
               </div>
            </div>
          </div>

          {/* SECCION JUGADOR */}
          <div className="space-y-6">
            <h3 className="text-xs font-black italic tracking-[0.3em] uppercase text-zinc-300 border-l-4 border-zinc-800 pl-4">Datos del Jugador</h3>
            <div className="grid gap-5">
               <div><label className={labelCls}>Nombre del Jugador</label><input type="text" name="name" required className={inputCls} placeholder="Ej. Juanito García" value={formData.name} onChange={handleInputChange} /></div>
               <div className="grid grid-cols-2 gap-4">
                 <div><label className={labelCls}>Fecha Nacimiento</label><input type="date" name="birth_date" required className={inputCls} value={formData.birth_date} onChange={handleInputChange} /></div>
                 <div><label className={labelCls}>Categoría</label>
                    <select name="category_id" required className={selectCls} value={formData.category_id} onChange={handleInputChange}>
                       <option value="">Elegir...</option>
                       {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                 </div>
               </div>
               <div className="grid grid-cols-3 gap-4">
                  <div><label className={labelCls}>Jersey #</label><input type="number" name="jersey_number" className={inputCls} placeholder="00" value={formData.jersey_number} onChange={handleInputChange} /></div>
                  <div className="col-span-2"><label className={labelCls}>Posición</label>
                    <select name="position_id" className={selectCls} value={formData.position_id} onChange={handleInputChange}>
                       <option value="">Elegir...</option>
                       {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
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
