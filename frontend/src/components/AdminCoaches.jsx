import React, { useState, useEffect } from 'react';

const AdminCoaches = () => {
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', avatar: null });
    const [preview, setPreview] = useState(null);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        fetchCoaches();
    }, []);

    const fetchCoaches = async () => {
        try {
            const res = await fetch('/api/users/coaches');
            const data = await res.json();
            setCoaches(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Error fetching coaches:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, avatar: file });
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            if (formData.phone) data.append('phone', formData.phone);
            if (formData.password) data.append('password', formData.password);
            if (formData.avatar) data.append('avatar', formData.avatar);

            const res = await fetch('/api/users/coaches', {
                method: 'POST',
                body: data
            });
            const responseData = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Coach registrado exitosamente.' });
                setFormData({ name: '', email: '', phone: '', password: '', avatar: null });
                setPreview(null);
                await fetchCoaches();
            } else {
                setMessage({ type: 'error', text: responseData.message || 'Error al registrar.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error de red.' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        if (!window.confirm(`¿Seguro que deseas ${newStatus === 'active' ? 'activar' : 'inactivar'} este coach?`)) return;
        
        try {
            const res = await fetch(`/api/users/coaches/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) await fetchCoaches();
        } catch (err) {
            console.error('Error toggling status', err);
        }
    };

    const deleteCoach = async (id) => {
        if (!window.confirm('¿Seguro que deseas ELIMINAR por completo este coach? Esta acción es irreversible.')) return;
        
        try {
            const res = await fetch(`/api/users/coaches/${id}`, { method: 'DELETE' });
            if (res.ok) await fetchCoaches();
        } catch (err) {
            console.error('Error deleting coach', err);
        }
    };

    const handleSendWhatsApp = async (id) => {
        const newWin = window.open('', '_blank');
        if (!newWin) {
            setMessage({ type: 'error', text: 'Por favor habilita las ventanas emergentes (pop-ups) en tu navegador.' });
            setTimeout(() => setMessage(null), 3000);
            return;
        }

        try {
            const res = await fetch(`/api/users/coaches/${id}/credentials`);
            const data = await res.json();
            if (res.ok) {
                if (!data.phone) {
                    newWin.close();
                    setMessage({ type: 'error', text: 'El coach no tiene un celular registrado.' });
                    setTimeout(() => setMessage(null), 3000);
                    return;
                }
                const msg = `Hola ${data.name},\n\nBienvenido al cuerpo técnico de Osos de Chiapas. Aquí tienes tus credenciales para ingresar a la plataforma (https://clubosos.com):\n\n*Usuario:* ${data.email}\n*Contraseña:* ${data.password}`;
                
                let phoneNum = data.phone.replace(/\D/g, '');
                if(phoneNum.length === 10) phoneNum = '52' + phoneNum;

                newWin.location.href = `https://wa.me/${phoneNum}?text=${encodeURIComponent(msg)}`;
            } else {
                newWin.close();
                setMessage({ type: 'error', text: data.message || 'Error al obtener credenciales.' });
                setTimeout(() => setMessage(null), 3000);
            }
        } catch (err) {
            newWin.close();
            setMessage({ type: 'error', text: 'Error de red al obtener credenciales.' });
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleCopyCredentials = async (id) => {
        try {
            const res = await fetch(`/api/users/coaches/${id}/credentials`);
            const data = await res.json();
            if (res.ok) {
                const msg = `Hola ${data.name},\n\nBienvenido al cuerpo técnico de Osos de Chiapas. Aquí tienes tus credenciales para ingresar a la plataforma (https://clubosos.com):\n\n*Usuario:* ${data.email}\n*Contraseña:* ${data.password}`;
                await navigator.clipboard.writeText(msg);
                setMessage({ type: 'success', text: 'Credenciales copiadas al portapapeles.' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Error al obtener credenciales.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error de red.' });
        } finally {
            setTimeout(() => setMessage(null), 3000);
        }
    };

    if (loading) return <div className="text-center p-10 text-xs font-black uppercase tracking-widest text-zinc-500">Cargando...</div>;

    return (
        <div className="space-y-8 animate-fade">
            <section className="border rounded-[2.5rem] p-8 space-y-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                <h2 className="text-base font-black italic uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>Nuevo Entrenador</h2>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: 'var(--text-dim)' }}>Nombre Completo</label>
                        <input required className="w-full border rounded-2xl py-3 px-4 text-sm outline-none transition-all" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: 'var(--text-dim)' }}>Correo Electrónico</label>
                        <input required type="email" className="w-full border rounded-2xl py-3 px-4 text-sm outline-none transition-all" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: 'var(--text-dim)' }}>Celular (Opcional)</label>
                            <input type="tel" className="w-full border rounded-2xl py-3 px-4 text-sm outline-none transition-all" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: 'var(--text-dim)' }}>Contraseña</label>
                            <input className="w-full border rounded-2xl py-3 px-4 text-sm outline-none transition-all font-mono" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }} placeholder="coachOsos" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: 'var(--text-dim)' }}>Foto / Avatar (Opcional)</label>
                        <div className="flex items-center gap-4">
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 border rounded-2xl py-3 flex items-center justify-center transition-colors" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)', color: 'var(--text-dim)' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                                <span className="ml-2 text-xs font-bold">Subir Imagen</span>
                            </button>
                            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            
                            {preview && (
                                <div className="w-12 h-12 rounded-xl overflow-hidden border shrink-0 relative" style={{ borderColor: 'var(--border-main)' }}>
                                    <img src={preview} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => { setPreview(null); setFormData({...formData, avatar: null}); }} className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <button disabled={saving} type="submit" className="w-full bg-red-600 text-white py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-lg shadow-red-900/40 active:scale-95 transition-all disabled:opacity-50 mt-4">
                        {saving ? 'Registrando...' : 'Dar de Alta'}
                    </button>

                    {message && (
                        <div className={`p-4 rounded-xl text-center text-[9px] font-black uppercase tracking-widest ${message.type === 'success' ? 'bg-green-600/10 text-green-500 border border-green-600/20' : 'bg-red-600/10 text-red-500 border border-red-600/20'}`}>
                            {message.text}
                        </div>
                    )}
                </form>
            </section>

            <section className="space-y-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] px-2" style={{ color: 'var(--text-dim)' }}>Cuerpo Técnico Registrado</h2>
                <div className="space-y-3">
                    {coaches.length > 0 ? coaches.map(coach => (
                        <div key={coach.id} className={`border rounded-3xl p-5 flex items-center justify-between shadow-xl transition-all ${coach.status === 'inactive' ? 'opacity-50 grayscale' : ''}`} style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full border bg-zinc-900 overflow-hidden flex items-center justify-center shrink-0">
                                    {coach.avatar_url ? <img src={coach.avatar_url} className="w-full h-full object-cover"/> : <span className="text-[10px] font-black text-zinc-500 uppercase">{coach.name.slice(0,2)}</span>}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-black uppercase tracking-wide truncate" style={{ color: 'var(--text-main)' }}>{coach.name}</p>
                                    <p className="text-[9px] font-bold tracking-widest truncate" style={{ color: 'var(--text-dim)' }}>{coach.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => handleSendWhatsApp(coach.id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white transition-colors" title="Enviar por WhatsApp">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                                </button>
                                <button onClick={() => handleCopyCredentials(coach.id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white transition-colors" title="Copiar Credenciales">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                </button>
                                <button onClick={() => toggleStatus(coach.id, coach.status)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${coach.status === 'active' ? 'bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white' : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white'}`} title={coach.status === 'active' ? 'Inactivar' : 'Activar'}>
                                    {coach.status === 'active' ? (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>
                                    ) : (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
                                    )}
                                </button>
                                <button onClick={() => deleteCoach(coach.id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white transition-colors" title="Eliminar">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10 border-dashed border rounded-3xl" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)' }}>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] italic" style={{ color: 'var(--text-dim)' }}>No hay coaches registrados</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default AdminCoaches;
