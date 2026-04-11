import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminAnnouncements = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        tag: 'AVISO',
        tag_color: 'zinc',
        expires_at: '',
        image: null
    });
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch('/api/announcements');
            const data = await res.json();
            setAnnouncements(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('content', formData.content);
        data.append('tag', formData.tag);
        data.append('tag_color', formData.tag_color);
        data.append('expires_at', formData.expires_at);
        if (formData.image) data.append('image', formData.image);

        try {
            const res = await fetch('/api/announcements', {
                method: 'POST',
                body: data
            });
            if (res.ok) {
                setShowForm(false);
                fetchAnnouncements();
                setFormData({ title: '', content: '', tag: 'AVISO', tag_color: 'zinc', expires_at: '', image: null });
                setPreview(null);
            }
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este aviso?')) return;
        try {
            const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
            if (res.ok) fetchAnnouncements();
        } catch (err) { console.error(err); }
    };

    // Estilos por tipo de aviso
    const types = [
        { label: 'GENERAL', color: 'zinc', bg: 'bg-zinc-600' },
        { label: 'URGENTE', color: 'red', bg: 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' },
        { label: 'EVENTO', color: 'amber', bg: 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' },
        { label: 'RESULTADO', color: 'green', bg: 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' }
    ];

    if (loading) return <div className="bg-black min-h-screen flex items-center justify-center text-white italic">Cargando Cartelera...</div>;

    return (
        <div className="bg-[#050505] min-h-screen text-white font-outfit pb-20 overflow-x-hidden">
            <header className="fixed top-0 left-0 w-full bg-black/90 backdrop-blur-xl border-b border-white/5 z-50">
                <div className="max-w-md mx-auto px-6 py-5 flex justify-between items-center">
                    <button onClick={() => navigate('/admin/dashboard')} className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="text-xs font-black uppercase tracking-[0.3em] italic">Comunicados <span className="text-red-600">Osos</span></span>
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showForm ? 'bg-red-600 text-white shadow-xl shadow-red-900/40 rotate-45' : 'bg-zinc-900 text-zinc-400'}`}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                    </button>
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 pt-24 space-y-8">
                
                {/* Create Form */}
                {showForm && (
                    <section className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 animate-slide-up shadow-2xl">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8 leading-none">Publicar en<br/><span className="text-red-600">Cartelera</span></h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                {types.map(t => (
                                    <button 
                                        key={t.label} type="button" 
                                        onClick={() => setFormData({...formData, tag: t.label, tag_color: t.color})}
                                        className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${formData.tag === t.label ? `${t.bg} border-transparent text-white` : 'bg-transparent border-zinc-900 text-zinc-600'}`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Título del Aviso</label>
                                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-black border border-zinc-900 rounded-2xl py-4 px-5 text-sm outline-none focus:border-red-600 font-bold" placeholder="Ej. Cambio de horarios" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Contenido / Mensaje</label>
                                <textarea required rows="4" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-black border border-zinc-900 rounded-2xl py-4 px-5 text-sm outline-none focus:border-red-600 font-medium leading-relaxed" placeholder="Escribe el mensaje aquí..." />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Expira el</label>
                                    <div 
                                        className="relative group cursor-pointer"
                                        onClick={() => {
                                            const el = document.getElementById('expires_at_input');
                                            if (el) {
                                                if (el.showPicker) el.showPicker();
                                                else el.click();
                                            }
                                        }}
                                    >
                                        <input 
                                            id="expires_at_input"
                                            type="date" 
                                            value={formData.expires_at} 
                                            onChange={e => setFormData({...formData, expires_at: e.target.value})} 
                                            className="w-full bg-black border border-zinc-900 rounded-2xl py-4 pl-5 pr-12 text-[10px] outline-none focus:border-red-600 font-black text-zinc-400 uppercase cursor-pointer" 
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-600 pointer-events-none group-hover:scale-110 transition-transform">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Flyer / Imagen</label>
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full bg-zinc-900/50 border border-zinc-900 rounded-2xl py-4 flex items-center justify-center text-zinc-600 hover:text-white transition-colors">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                                    </button>
                                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </div>
                            </div>

                            {preview && (
                                <div className="relative rounded-2xl overflow-hidden aspect-video border border-zinc-800">
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => setPreview(null)} className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
                                </div>
                            )}

                            <button type="submit" className="w-full bg-red-600 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-red-900/50 active:scale-95 transition-all">PUBLICAR COMUNICADO</button>
                        </form>
                    </section>
                )}

                {/* List */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic px-2">Historial de Publicaciones</h3>
                    {announcements.map(ann => (
                        <div key={ann.id} className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all">
                            {ann.image_url && <img src={ann.image_url} alt="" className="w-full h-48 object-cover border-b border-zinc-900" />}
                            <div className="p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col gap-2">
                                        <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest w-fit 
                                            ${ann.tag_color === 'red' ? 'bg-red-600 text-white' : 
                                              ann.tag_color === 'amber' ? 'bg-amber-500 text-black' : 
                                              ann.tag_color === 'green' ? 'bg-green-500 text-black' : 'bg-zinc-800 text-zinc-400'}
                                        `}>{ann.tag}</span>
                                        <h4 className="text-xl font-black italic tracking-tighter uppercase leading-none">{ann.title}</h4>
                                    </div>
                                    <button onClick={() => handleDelete(ann.id)} className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-md active:scale-95">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                    </button>
                                </div>
                                <p className="text-xs text-zinc-500 font-medium leading-relaxed italic">{ann.content}</p>
                                <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                                    <span>Publicado: {new Date(ann.created_at).toLocaleDateString()}</span>
                                    {ann.expires_at && <span className="text-red-600">Expira: {new Date(ann.expires_at).toLocaleDateString()}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                    {announcements.length === 0 && (
                        <div className="text-center py-20 italic text-zinc-700 text-xs font-black uppercase tracking-[0.3em]">No hay comunicados activos</div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminAnnouncements;
