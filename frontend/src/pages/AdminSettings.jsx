import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AdminSettings = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('menu'); // 'menu' or 'bank'
    const [settings, setSettings] = useState({
        bank_name: '',
        bank_holder: '',
        bank_clabe: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    // Security state
    const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });

    // Social Links state
    const [socialPosts, setSocialPosts] = useState([]);
    const [newSocialUrl, setNewSocialUrl] = useState('');

    useEffect(() => {
        fetchSettings();
        fetchSocialPosts();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            setSettings(data);
        } catch (err) {
            console.error('Error fetching settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSocialPosts = async () => {
        try {
            const res = await fetch('/api/social');
            const data = await res.json();
            setSocialPosts(data);
        } catch (e) { console.error('Error fetching social:', e); }
    };

    const addSocialPost = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/social', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: newSocialUrl })
            });
            if (res.ok) {
                setNewSocialUrl('');
                await fetchSocialPosts();
                setMessage({ type: 'success', text: '¡Post de Instagram destacado!' });
                setTimeout(()=>setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: 'Error procesando la URL de Instagram' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error de conexión' });
        } finally {
            setSaving(false);
        }
    };

    const deleteSocialPost = async (id) => {
        if (!window.confirm('¿Seguro de remover este post del muro?')) return;
        try {
            await fetch(`/api/social/${id}`, { method: 'DELETE' });
            await fetchSocialPosts();
        } catch(e) {}
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage(null);
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Mínimo 6 caracteres' });
            return;
        }
        
        setSaving(true);
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const res = await fetch('/api/auth/update-first-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, newPassword: passwordData.newPassword })
            });
            if (res.ok) {
                setMessage({ type: 'success', text: '¡Contraseña actualizada!' });
                setPasswordData({ newPassword: '', confirmPassword: '' });
                setTimeout(() => setView('menu'), 2000);
            } else {
                setMessage({ type: 'error', text: 'Error al cambiar contraseña' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error de conexión' });
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings })
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Configuración guardada correctamente' });
                setTimeout(() => setView('menu'), 1500);
            } else {
                setMessage({ type: 'error', text: 'Error al salvar la configuración' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error de conexión' });
        } finally {
            setSaving(false);
        }
    };

    const menuItems = [
        { 
            id: 'social', 
            title: 'Curador Social (Instagram)', 
            desc: 'Añade fotos/reels al muro principal',
            icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm8 4a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4zm5-1.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z', 
            action: () => setView('social'), 
            color: 'text-pink-500' 
        },
        { 
            id: 'teams', 
            title: 'Gestión de Rivales', 
            desc: 'Administra equipos y logos externos',
            icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 11-8 0 4 4 0 018 0z', 
            path: '/teams/list', 
            color: 'text-blue-500' 
        },
        { 
            id: 'categories', 
            title: 'Ligas y Categorías', 
            desc: 'Configura las divisiones del club',
            icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', 
            path: '/admin/categories', 
            color: 'text-purple-500' 
        },
        { 
            id: 'bank', 
            title: 'Datos Bancarios (SPEI)', 
            desc: 'Información para pagos de padres',
            icon: 'M3 21h18M3 10h18M5 10v11M19 10v11M12 10v11M2 10l10-7 10 7', 
            action: () => setView('bank'), 
            color: 'text-green-500' 
        },
        { 
            id: 'calendar', 
            title: 'Agenda Maestra', 
            desc: 'Juegos, entrenos y logística',
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', 
            path: '/admin/calendar', 
            color: 'text-amber-500' 
        },
        { 
            id: 'security', 
            title: 'Seguridad', 
            desc: 'Cambiar mi clave de acceso',
            icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', 
            action: () => setView('security'), 
            color: 'text-zinc-400' 
        }
    ];

    if (loading) return <div className="bg-black min-h-screen flex items-center justify-center text-white">Cargando...</div>;

    return (
        <div className="bg-[#050505] min-h-screen text-white font-outfit pb-20 overflow-x-hidden">
            <header className="p-6 border-b border-white/5 sticky top-0 bg-black/80 backdrop-blur-md z-50">
                <div className="max-w-md mx-auto flex items-center gap-4">
                    <button onClick={() => view === 'menu' ? navigate('/admin/dashboard') : setView('menu')} className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-white transition-all">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    </button>
                    <h1 className="text-xl font-black uppercase italic tracking-tighter">
                        {view === 'menu' ? 'Configuración' : view === 'social' ? 'Curador Social' : view === 'security' ? 'Seguridad' : 'Datos Bancarios'} <span className="text-red-600">Global</span>
                    </h1>
                </div>
            </header>

            <main className="max-w-md mx-auto p-6 pt-10">
                
                {view === 'menu' ? (
                    <div className="space-y-4 animate-fade">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-6 italic px-2">Mantenimiento del Sistema</p>
                        
                        {menuItems.map(item => (
                            <div 
                                key={item.id}
                                onClick={() => item.path ? navigate(item.path) : item.action()}
                                className="group bg-zinc-950 border border-zinc-900 rounded-[2rem] p-6 flex items-center justify-between hover:border-red-600/50 transition-all cursor-pointer active:scale-95 shadow-xl"
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center ${item.color} group-hover:bg-red-600/10 group-hover:text-red-500 transition-colors`}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={item.icon}/></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-sm uppercase tracking-wide group-hover:text-red-600 transition-colors">{item.title}</h3>
                                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{item.desc}</p>
                                    </div>
                                </div>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-zinc-800 group-hover:text-red-600 transition-colors"><path d="M9 18l6-6-6-6"/></svg>
                            </div>
                        ))}

                        <div className="pt-10 text-center">
                            <p className="text-[8px] font-black text-zinc-800 uppercase tracking-[0.5em] italic italic">Club Osos v2.0</p>
                        </div>
                    </div>
                ) : view === 'bank' ? (
                    <form onSubmit={handleSave} className="space-y-8 animate-fade">
                        <section className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Banco</label>
                                <input 
                                    className="w-full bg-black border border-zinc-900 rounded-2xl py-4 px-5 text-sm focus:border-red-600 outline-none transition-all font-bold"
                                    value={settings.bank_name || ''}
                                    onChange={e => setSettings({...settings, bank_name: e.target.value})}
                                    placeholder="Ej. BBVA"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Titular</label>
                                <input 
                                    className="w-full bg-black border border-zinc-900 rounded-2xl py-4 px-5 text-sm focus:border-red-600 outline-none transition-all font-bold"
                                    value={settings.bank_holder || ''}
                                    onChange={e => setSettings({...settings, bank_holder: e.target.value})}
                                    placeholder="Ej. Club Osos de Chiapas AC"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">CLABE</label>
                                <input 
                                    className="w-full bg-black border border-zinc-900 rounded-2xl py-4 px-5 text-lg font-mono tracking-widest focus:border-red-600 outline-none transition-all font-black text-red-600"
                                    value={settings.bank_clabe || ''}
                                    onChange={e => setSettings({...settings, bank_clabe: e.target.value})}
                                    placeholder="0000..."
                                />
                            </div>
                        </section>

                        {message && (
                            <div className={`p-5 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest animate-shake
                                ${message.type === 'success' ? 'bg-green-600/10 text-green-500 border border-green-600/20' : 'bg-red-600/10 text-red-500 border border-red-600/20'}
                            `}>
                                {message.text}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={saving}
                            className="w-full bg-red-600 text-white py-5 rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl shadow-red-900/40 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {saving ? 'PROCESANDO...' : 'GUARDAR CONFIGURACIÓN'}
                        </button>
                    </form>
                ) : view === 'social' ? (
                    <div className="space-y-8 animate-fade">
                        <section className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 space-y-6">
                            <h2 className="text-base font-black italic uppercase tracking-widest text-zinc-400">Nuevo Highlight de Instagram</h2>
                            <form onSubmit={addSocialPost} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Enlace Oficial de IG</label>
                                    <input 
                                        className="w-full bg-black border border-zinc-900 rounded-2xl py-4 px-5 text-xs focus:border-pink-600 outline-none transition-all font-bold text-pink-500"
                                        value={newSocialUrl}
                                        onChange={e => setNewSocialUrl(e.target.value)}
                                        placeholder="https://www.instagram.com/p/..."
                                        required
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    disabled={saving || !newSocialUrl}
                                    className="w-full bg-pink-600 text-white py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-lg shadow-pink-900/40 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {saving ? 'Analizando...' : 'Anexar al Muro'}
                                </button>
                                {message && (
                                    <div className={`p-4 rounded-xl text-center text-[9px] font-black uppercase tracking-widest
                                        ${message.type === 'success' ? 'bg-green-600/10 text-green-500 border border-green-600/20' : 'bg-red-600/10 text-red-500 border border-red-600/20'}
                                    `}>
                                        {message.text}
                                    </div>
                                )}
                            </form>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] px-2">Activos en el Portal</h2>
                            {socialPosts.map(post => (
                                <div key={post.id} className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 flex items-center justify-between shadow-xl">
                                    <div className="overflow-hidden flex-1 mr-4">
                                        <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest truncate">{post.url}</p>
                                        <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
                                            Añadido: {new Date(post.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => deleteSocialPost(post.id)}
                                        className="w-10 h-10 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                    </button>
                                </div>
                            ))}
                            {socialPosts.length === 0 && (
                                <div className="text-center w-full py-10 bg-zinc-900/20 border-dashed border border-zinc-800 rounded-3xl">
                                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] italic">No hay contenido de IG activo</p>
                                </div>
                            )}
                        </section>
                    </div>
                ) : view === 'security' ? (
                    <form onSubmit={handlePasswordChange} className="space-y-8 animate-fade">
                        <section className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 space-y-6">
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Actualiza tu acceso administrativo</p>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                                    <input 
                                        type="password"
                                        required
                                        className="w-full bg-black border border-zinc-900 rounded-2xl py-4 px-5 text-sm focus:border-red-600 outline-none transition-all text-white font-bold tracking-widest placeholder:text-zinc-800"
                                        placeholder="••••••••"
                                        value={passwordData.newPassword}
                                        onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Confirmar Contraseña</label>
                                    <input 
                                        type="password"
                                        required
                                        className="w-full bg-black border border-zinc-900 rounded-2xl py-4 px-5 text-sm focus:border-red-600 outline-none transition-all text-white font-bold tracking-widest placeholder:text-zinc-800"
                                        placeholder="••••••••"
                                        value={passwordData.confirmPassword}
                                        onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                    />
                                </div>
                            </div>
                        </section>

                        {message && (
                            <div className={`p-4 rounded-xl text-center text-[10px] font-black uppercase tracking-widest animate-shake
                                ${message.type === 'success' ? 'bg-green-600/10 text-green-500 border border-green-600/20' : 'bg-red-600/10 text-red-500 border border-red-600/20'}
                            `}>
                                {message.text}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={saving}
                            className="w-full bg-red-600 text-white py-5 rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl shadow-red-900/40 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {saving ? 'PROCESANDO...' : 'ACTUALIZAR CONTRASEÑA'}
                        </button>
                    </form>
                ) : null}

            </main>
        </div>
    );
};

export default AdminSettings;
