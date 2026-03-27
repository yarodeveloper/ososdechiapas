import React, { useState, useEffect, useRef } from 'react';
import SvgIcon from '../components/SvgIcon';
import { useNavigate } from 'react-router-dom';

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
    emergency_phone: ''
  });
  
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  // Catalogs
  const [positions, setPositions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bloodTypes, setBloodTypes] = useState([]);
  
  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [curpError, setCurpError] = useState('');

  useEffect(() => {
    // Fetch catalogs in parallel
    const loadCatalogs = async () => {
      try {
        const [posRes, catRes, bloodRes] = await Promise.all([
          fetch('/api/catalogs/positions'),
          fetch('/api/categories'),
          fetch('/api/catalogs/blood-types')
        ]);
        
        setPositions(await posRes.json());
        setCategories(await catRes.json());
        setBloodTypes(await bloodRes.json());
      } catch (err) {
        console.error("Failed to load catalogs", err);
      }
    };
    loadCatalogs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Live CURP Validation
    if (name === 'curp') {
      const curpVal = value.toUpperCase();
      setFormData(prev => ({ ...prev, [name]: curpVal }));
      if (curpVal.length > 0 && curpVal.length !== 18) {
        setCurpError('La CURP debe tener exactamente 18 caracteres');
      } else {
        setCurpError('');
      }
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if(file.size > 5 * 1024 * 1024) {
         alert('El archivo excede el límite de 5MB');
         return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.curp.length !== 18) {
      setCurpError('Invalid CURP length');
      return;
    }
    
    setIsSubmitting(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (photoFile) data.append('photo', photoFile);

    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        body: data
      });
      if (!res.ok) throw new Error(await res.text());
      navigate('/players/list');
    } catch (err) {
      alert("Error al guardar: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#101010] text-[#e5e5e5] font-body min-h-screen flex flex-col pb-24">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-5 max-w-md mx-auto w-full border-b border-[#2a2a2a]/30">
        <button onClick={() => navigate(-1)} className="flex items-center text-primary-container hover:text-white transition-colors">
          <SvgIcon src="/icons/arrow-open-left-svgrepo-com.svg" className="w-5 h-5 mr-3" />
          <span className="font-headline font-bold text-base tracking-wide text-white relative top-0.5">Alta de Jugador</span>
        </button>
        <span className="font-headline font-extrabold italic text-sm tracking-widest text-[#a3a3a3]">OSOS</span>
      </header>

      <main className="flex-grow flex flex-col px-6 py-8 max-w-md mx-auto w-full space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="flex flex-col items-center justify-center mb-10">
            <div className="relative cursor-pointer group" onClick={handlePhotoClick}>
              <div className={`w-36 h-36 rounded-full border-2 border-dashed ${photoPreview ? 'border-primary-container' : 'border-[#3a3a3a]'} flex flex-col items-center justify-center bg-[#151515] group-hover:bg-[#1a1111] transition-colors overflow-hidden`}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Jugador" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <SvgIcon src="/icons/admin-svgrepo-com.svg" className="w-8 h-8 text-[#737373] mb-2" />
                    <span className="font-label text-[8px] tracking-[0.2em] font-bold text-[#a3a3a3] uppercase">Subir Foto</span>
                  </>
                )}
              </div>
              <div className="absolute bottom-1 right-1 w-10 h-10 bg-primary-container rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(227,5,20,0.5)] transform translate-x-2 translate-y-2 group-hover:scale-110 transition-transform">
                <SvgIcon src="/icons/add-svgrepo-com.svg" className="w-5 h-5 text-white" />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoChange} 
              className="hidden" 
              accept="image/jpeg, image/png"
              capture="environment"
            />
            <p className="font-label text-[8px] uppercase tracking-widest text-primary-container mt-6 font-bold">Formato JPG o PNG (Max 5MB)</p>
          </div>

          {/* Nombre Completo */}
          <div className="space-y-2">
            <label className="font-label text-[10px] font-bold uppercase tracking-[0.15em] text-[#e5e5e5] block ml-1">Nombre Completo</label>
            <input
              type="text"
              name="name"
              className="w-full bg-[#362727] border-0 text-[#e5e5e5] placeholder-[#a3a3a3] rounded-xl px-4 py-4 font-body outline-none focus:ring-1 focus:ring-primary-container transition-all"
              placeholder="Ej. Juan Pérez García"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Fecha de Nacimiento */}
          <div className="space-y-2">
            <label className="font-label text-[10px] font-bold uppercase tracking-[0.15em] text-[#e5e5e5] block ml-1">Fecha de Nacimiento</label>
            <div className="relative">
              <input
                type="date"
                name="birth_date"
                className="w-full bg-[#362727] border-0 text-[#e5e5e5] placeholder-[#a3a3a3] rounded-xl px-4 py-4 font-body outline-none focus:ring-1 focus:ring-primary-container transition-all"
                value={formData.birth_date}
                onChange={handleInputChange}
                required
              />
              <SvgIcon src="/icons/calendar-days-svgrepo-com.svg" className="w-5 h-5 text-[#a3a3a3] absolute right-4 top-4 pointer-events-none" />
            </div>
          </div>

          {/* CURP */}
          <div className="space-y-2">
            <label className="font-label text-[10px] font-bold uppercase tracking-[0.15em] text-[#e5e5e5] block ml-1">CURP</label>
            <input
              type="text"
              name="curp"
              maxLength="18"
              className={`w-full ${curpError ? 'bg-[#401818] ring-1 ring-primary-container' : 'bg-[#362727]'} border-0 text-[#e5e5e5] placeholder-[#a3a3a3] rounded-xl px-4 py-4 font-body outline-none focus:ring-1 focus:ring-primary-container transition-all uppercase`}
              placeholder="18 CARACTERES"
              value={formData.curp}
              onChange={handleInputChange}
              required
            />
            {curpError && <p className="text-[10px] text-primary-container font-label tracking-wide uppercase mt-1">{curpError}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Posición */}
            <div className="space-y-2">
              <label className="font-label text-[10px] font-bold uppercase tracking-[0.15em] text-[#e5e5e5] block ml-1">Posición</label>
              <select
                name="position_id"
                value={formData.position_id}
                onChange={handleInputChange}
                className="w-full bg-[#362727] border-0 text-[#e5e5e5] rounded-xl px-4 py-4 font-body outline-none appearance-none"
                required
              >
                <option value="" disabled>Elegir...</option>
                {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            
            {/* Categoría */}
            <div className="space-y-2">
              <label className="font-label text-[10px] font-bold uppercase tracking-[0.15em] text-[#e5e5e5] block ml-1">Categoría</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full bg-[#362727] border-0 text-[#e5e5e5] rounded-xl px-4 py-4 font-body outline-none appearance-none"
                required
              >
                <option value="" disabled>Elegir...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Tipo de Sangre */}
          <div className="space-y-2">
            <label className="font-label text-[10px] font-bold uppercase tracking-[0.15em] text-[#e5e5e5] block ml-1">Tipo de Sangre</label>
            <select
              name="blood_type_id"
              value={formData.blood_type_id}
              onChange={handleInputChange}
              className="w-full bg-[#362727] border-0 text-[#e5e5e5] rounded-xl px-4 py-4 font-body outline-none appearance-none"
              required
            >
              <option value="" disabled>Seleccionar</option>
              {bloodTypes.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          {/* Contacto Emergencia */}
          <div className="space-y-2">
            <label className="font-label text-[10px] font-bold uppercase tracking-[0.15em] text-[#e5e5e5] block ml-1">Contacto de Emergencia</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SvgIcon src="/icons/phone-call-svgrepo-com.svg" className="w-5 h-5 text-[#a3a3a3]" />
              </div>
              <input
                type="tel"
                name="emergency_phone"
                className="w-full bg-[#362727] border-0 text-[#e5e5e5] placeholder-[#a3a3a3] rounded-xl pl-12 pr-4 py-4 font-body outline-none focus:ring-1 focus:ring-primary-container transition-all"
                placeholder="961 000 0000"
                value={formData.emergency_phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting || !!curpError}
              className={`w-full py-4 rounded-xl font-headline font-extrabold text-white text-[15px] tracking-wide uppercase transition-all shadow-[0_4px_20px_rgba(227,5,20,0.3)] ${isSubmitting || !!curpError ? 'bg-primary-container/50' : 'bg-primary-container hover:bg-red-700 active:scale-95'}`}
            >
              {isSubmitting ? 'GUARDANDO...' : 'GUARDAR REGISTRO'}
            </button>
          </div>
        </form>

        {/* Privacy Notice */}
        <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-5 mt-8">
          <div className="flex items-center space-x-2 mb-3">
             <SvgIcon src="/icons/user-shield-alt-1-svgrepo-com.svg" className="w-5 h-5 text-primary-container" />
             <span className="font-label text-[9px] uppercase tracking-widest text-primary-container font-extrabold">Aviso de Privacidad</span>
          </div>
          <p className="font-body text-[10px] leading-relaxed text-[#737373]">
            Al registrar este perfil, confirmas que los datos proporcionados son verídicos y que el club Osos de Chiapas podrá utilizarlos para fines administrativos y deportivos de acuerdo a la normativa vigente.
          </p>
        </div>
      </main>

      {/* Bottom Sub-Navigation Navbar */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#111111] border-t border-[#2a2a2a] z-50">
         <div className="max-w-md mx-auto px-6 h-16 flex justify-between items-center">
            <Link to="/admin/dashboard" className="flex flex-col items-center justify-center group w-16 opacity-60 hover:opacity-100 transition-opacity">
               <SvgIcon src="/icons/home-svgrepo-com.svg" className="w-5 h-5 text-white mb-1" />
               <span className="text-[8px] font-label font-bold text-[#a3a3a3] uppercase tracking-widest">Inicio</span>
            </Link>
            <Link to="/players/list" className="flex flex-col items-center justify-center group w-16 opacity-60 hover:opacity-100 transition-opacity">
               <SvgIcon src="/icons/group-svgrepo-com.svg" className="w-6 h-6 text-white mb-1" />
               <span className="text-[8px] font-label font-bold text-[#a3a3a3] uppercase tracking-widest">Roster</span>
            </Link>
            <button className="flex flex-col items-center justify-center group w-16 relative">
               <SvgIcon src="/icons/admin-tools-svgrepo-com.svg" className="w-6 h-6 text-primary-container mb-1" />
               <span className="text-[8px] font-label font-bold text-primary-container uppercase tracking-widest">Registro</span>
            </button>
            <button className="flex flex-col items-center justify-center group w-16 opacity-60 hover:opacity-100 transition-opacity">
               <SvgIcon src="/icons/admin-svgrepo-com.svg" className="w-5 h-5 text-white mb-1" />
               <span className="text-[8px] font-label font-bold text-[#a3a3a3] uppercase tracking-widest">Perfil</span>
            </button>
         </div>
      </nav>
    </div>
  );
};

export default AddPlayer;
