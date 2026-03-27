import React, { useState, useRef } from 'react';
import SvgIcon from './SvgIcon';

const AddTeamModal = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [stadium, setStadium] = useState('');
  const [color, setColor] = useState('#e30514');
  const [logoBase64, setLogoBase64] = useState(null); // Just for preview
  const [logoFile, setLogoFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const colors = ['#e30514', '#3b82f6', '#10b981', '#facc15', '#44403c'];

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !logoFile) {
      alert("Nombre y Logo son obligatorios");
      return;
    }
    setIsSubmitting(true);
    
    // FormData para enviar archivos
    const formData = new FormData();
    formData.append('name', name);
    formData.append('home_stadium', stadium);
    formData.append('jersey_color_hex', color);
    formData.append('logo', logoFile);

    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Error al guardar el equipo');
      
      onSuccess();
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center">
      <div className="bg-[#151515] w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-y-auto animate-slide-up pb-10">
        {/* Header */}
        <div className="sticky top-0 bg-[#151515] px-6 py-6 border-b border-[#2a2a2a] flex justify-between items-center z-10">
          <h2 className="font-headline font-extrabold text-xl tracking-tight text-white uppercase">NUEVO RIVAL</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-[#a3a3a3] hover:text-white transition-colors">
            <SvgIcon src="/icons/arrow-open-right-svgrepo-com.svg" className="w-5 h-5 rotate-45 transform" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="font-label text-xs font-semibold uppercase tracking-[0.15em] text-[#e5e5e5] block ml-1">Nombre del equipo</label>
            <input
              type="text"
              className="w-full bg-[#2a1b1b] border-n text-[#e5e5e5] placeholder-[#a3a3a3] rounded-xl px-4 py-4 font-body outline-none focus:ring-2 focus:ring-primary-container transition-all"
              placeholder="Ej: Centuriones de Jalisco"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Target Logo */}
          <div className="space-y-2">
            <label className="font-label text-xs font-semibold uppercase tracking-[0.15em] text-[#e5e5e5] block ml-1">Logo del equipo</label>
            
            <div 
              onClick={handleFileClick}
              className="w-full border-2 border-dashed border-[#3a3a3a] hover:border-primary-container rounded-2xl p-8 bg-[#1a1111] flex flex-col items-center justify-center cursor-pointer transition-colors"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/png, image/jpeg, image/svg+xml"
              />
              {logoBase64 ? (
                <img src={logoBase64} alt="Preview" className="w-20 h-20 object-contain mb-4 animate-fade-in" />
              ) : (
                <div className="w-12 h-12 bg-primary-container/20 rounded-full flex items-center justify-center mb-4">
                  <SvgIcon src="/icons/cloud-upload-svgrepo-com.svg" className="w-6 h-6 text-primary-container" />
                </div>
              )}
              <p className="font-body text-xs text-[#a3a3a3] text-center">Sube el escudo oficial (.png, .svg)</p>
            </div>
          </div>

          {/* Stadium Field */}
          <div className="space-y-2">
            <label className="font-label text-xs font-semibold uppercase tracking-[0.15em] text-[#e5e5e5] block ml-1">Estadio local</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SvgIcon src="/icons/pin-svgrepo-com.svg" className="w-5 h-5 text-[#a3a3a3]" />
              </div>
              <input
                type="text"
                className="w-full bg-[#2a1b1b] border-none text-[#e5e5e5] placeholder-[#a3a3a3] rounded-xl pl-12 pr-4 py-4 font-body outline-none focus:ring-2 focus:ring-primary-container transition-all"
                placeholder="Nombre del recinto"
                value={stadium}
                onChange={(e) => setStadium(e.target.value)}
              />
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-3">
            <label className="font-label text-xs font-semibold uppercase tracking-[0.15em] text-[#e5e5e5] block ml-1">Color del uniforme</label>
            <div className="flex space-x-4 px-1">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${color === c ? 'ring-4 ring-offset-2 ring-offset-[#151515] ring-white scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <SvgIcon src="/icons/paint-svgrepo-com.svg" className="w-5 h-5 text-white/50" />}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-6">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl font-headline font-extrabold text-white text-base tracking-widest uppercase transition-all shadow-[0_4px_20px_rgba(227,5,20,0.3)] ${isSubmitting ? 'bg-primary-container/50' : 'bg-primary-container hover:bg-red-700 active:scale-95'}`}
            >
              {isSubmitting ? 'Guardando...' : 'GUARDAR RIVAL'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeamModal;
