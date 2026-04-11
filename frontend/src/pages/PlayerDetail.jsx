import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PlayerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    const [player, setPlayer] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('stats'); // 'stats' or 'info'
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showPoster, setShowPoster] = useState(false);
    
    // Catalogs for editing
    const [positions, setPositions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [bloodTypes, setBloodTypes] = useState([]);
    
    // Form state
    const [formData, setFormData] = useState({});
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isStaff = user.role === 'admin' || user.role === 'coach';

    useEffect(() => {
        const load = async () => {
            try {
                const [statsRes, historyRes, posRes, catRes, bloodRes] = await Promise.all([
                    fetch(`/api/stats/player/${id}`),
                    fetch(`/api/stats/player/${id}/history`),
                    fetch('/api/catalogs/positions'),
                    fetch('/api/categories'),
                    fetch('/api/catalogs/blood-types')
                ]);
                const statsData = await statsRes.json();
                
                setPlayer(statsData);
                setHistory(statsData.history || []);
                setPositions(await posRes.json());
                setCategories(await catRes.json());
                setBloodTypes(await bloodRes.json());

                setFormData({
                    name: statsData.name || '',
                    birth_date: statsData.birth_date ? statsData.birth_date.split('T')[0] : '',
                    curp: statsData.curp || '',
                    position_id: statsData.position_id || '',
                    category_id: statsData.category_id || '',
                    blood_type_id: statsData.blood_type_id || '',
                    emergency_phone: statsData.emergency_phone || '',
                    allergies: statsData.allergies || '',
                    jersey_number: statsData.jersey_number || '',
                    parent_name: statsData.parent_name || '',
                    parent_email: statsData.parent_email || '',
                    parent_phone: statsData.parent_phone || ''
                });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const data = new FormData();
            Object.entries(formData).forEach(([k, v]) => data.append(k, v));
            if (photoFile) data.append('photo', photoFile);

            const res = await fetch(`/api/players/${id}`, { method: 'PUT', body: data });
            if (!res.ok) throw new Error(await res.text());

            // Refresh
            const updated = await fetch(`/api/stats/player/${id}?t=${Date.now()}`); // force reload
            const updatedData = await updated.json();
            setPlayer(updatedData);
            setFormData({
                ...formData,
                parent_name: updatedData.parent_name || '',
                parent_email: updatedData.parent_email || '',
                parent_phone: updatedData.parent_phone || ''
            });
            setEditing(false);
            setPhotoFile(null);
            setPhotoPreview(null);
        } catch (err) {
            alert('Error al guardar: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result);
        reader.readAsDataURL(file);
    };

    if (loading) return (
        <div className="bg-black min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
    );

    if (!player) return <div className="p-10 text-center text-zinc-500">Jugador no encontrado</div>;

    const initials = player.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
    const currentPhoto = photoPreview || player.photo_url;

    // Styles
    const inputCls = "w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-red-600 transition-colors";
    const labelCls = "text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-1.5 ml-1";

    return (
        <div className="bg-black text-white min-h-screen pb-20 selection:bg-red-600 selection:text-white">
            {/* Header Sticky */}
            <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-900 px-6 py-4">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <button onClick={() => editing ? setEditing(false) : navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-zinc-900 rounded-full active:scale-95 transition-transform">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={editing ? "M18 6L6 18M6 6l12 12" : "M15 18l-6-6 6-6"} /></svg>
                    </button>
                    <span className="font-display font-black text-xs uppercase tracking-widest text-zinc-500">
                        {editing ? 'Editar Jugador' : 'Player Card'}
                    </span>
                    {isStaff ? (
                        <button 
                            onClick={() => editing ? handleSave() : setEditing(true)}
                            disabled={saving}
                            className="text-xs font-black uppercase tracking-widest text-red-600 hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                            {editing ? (saving ? '...' : 'OK') : 'Edit'}
                        </button>
                    ) : <div className="w-10 h-10"></div>}
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 pt-6 animate-fade">
                
                {editing ? (
                    /* ── EDIT MODE ── */
                    <div className="space-y-6">
                        <div className="flex flex-col items-center mb-8">
                             <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-32 h-32 rounded-[2rem] bg-zinc-900 border-2 border-red-600/30 overflow-hidden">
                                     {currentPhoto ? <img src={currentPhoto} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">{initials}</div>}
                                </div>
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                                </div>
                             </div>
                             <input ref={fileInputRef} type="file" className="hidden" onChange={handlePhotoChange} />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className={labelCls}>Nombre Completo</label>
                                <input className={inputCls} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Número Jersey</label>
                                    <input type="number" className={inputCls} value={formData.jersey_number} onChange={e => setFormData({...formData, jersey_number: e.target.value})} />
                                </div>
                                <div>
                                    <label className={labelCls}>Fecha Nacimiento</label>
                                    <input type="date" className={inputCls} value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>CURP</label>
                                <input className={inputCls} value={formData.curp} maxLength={18} onChange={e => setFormData({...formData, curp: e.target.value.toUpperCase()})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Posición</label>
                                    <select className={inputCls} value={formData.position_id} onChange={e => setFormData({...formData, position_id: e.target.value})}>
                                        {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Categoría</label>
                                    <select className={inputCls} value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Tipo Sangre</label>
                                    <select className={inputCls} value={formData.blood_type_id} onChange={e => setFormData({...formData, blood_type_id: e.target.value})}>
                                         <option value="">Seleccionar</option>
                                         {bloodTypes.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Tel. Emergencia</label>
                                    <input className={inputCls} value={formData.emergency_phone} onChange={e => setFormData({...formData, emergency_phone: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Alergias</label>
                                <textarea className={`${inputCls} h-24`} value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} />
                            </div>

                            <div className="pt-4 mt-4 border-t border-zinc-900 border-dashed">
                                <h3 className="text-sm font-black italic uppercase text-zinc-500 mb-4">Datos del Tutor</h3>
                                <div>
                                    <label className={labelCls}>Nombre del Tutor</label>
                                    <input className={inputCls} value={formData.parent_name} onChange={e => setFormData({...formData, parent_name: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className={labelCls}>Correo Electrónico</label>
                                        <input type="email" className={inputCls} value={formData.parent_email} onChange={e => setFormData({...formData, parent_email: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Teléfono</label>
                                        <input className={inputCls} value={formData.parent_phone} onChange={e => setFormData({...formData, parent_phone: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleSave}
                            className="w-full bg-red-600 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-red-900/40 active:scale-95 transition-transform"
                        >
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                ) : (
                    /* ── VIEW MODE ── */
                    <>
                        <section className="relative group mb-10">
                            <div className="absolute -inset-1 bg-red-600/20 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                            <div className="relative bg-zinc-950 border border-zinc-800 rounded-[2.5rem] overflow-hidden p-8 flex flex-col items-center">
                                <div className="absolute top-6 left-6 flex flex-col items-center">
                                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-0.5">POS</span>
                                    <span className="text-xl font-display font-black text-white uppercase italic">{player.position_name?.match(/\(([^)]+)\)/)?.[1] || 'JDR'}</span>
                                </div>
                                <div className="absolute top-6 right-6 flex flex-col items-center">
                                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">NUM</span>
                                    <span className="text-xl font-display font-black text-white italic">#{player.jersey_number || '00'}</span>
                                </div>
                                <div className="w-40 h-40 rounded-[2rem] bg-zinc-900 border-2 border-zinc-800 shadow-2xl overflow-hidden mb-6 mt-4">
                                    {player.photo_url ? <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl font-display font-black text-zinc-700">{initials}</div>}
                                </div>
                                <h1 className="text-3xl font-display font-black uppercase italic tracking-tighter text-center leading-none mb-2">{player.name}</h1>
                                <span className="bg-red-600/10 text-red-500 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-red-600/20">Osos {player.category_name}</span>
                            </div>
                        </section>

                        <div className="flex bg-zinc-950 p-1 rounded-2xl border border-zinc-900 mb-8">
                            <button onClick={() => setActiveTab('stats')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${activeTab === 'stats' ? 'bg-red-600 border border-red-500 text-white shadow-xl shadow-red-900/20' : 'text-zinc-600'}`}>Estadísticas</button>
                            <button onClick={() => setActiveTab('info')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${activeTab === 'info' ? 'bg-red-600 border border-red-500 text-white shadow-xl shadow-red-900/20' : 'text-zinc-600'}`}>Información</button>
                        </div>

                        {activeTab === 'stats' ? (
                            <div className="space-y-8 animate-fade">
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-3xl flex flex-col items-center">
                                        <span className="text-[11px] font-black text-zinc-600 uppercase tracking-widest mb-2">TDs</span>
                                        <span className="text-2xl font-display font-black text-red-600">{player.total_tds || 0}</span>
                                    </div>
                                    <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-3xl flex flex-col items-center">
                                        <span className="text-[11px] font-black text-zinc-600 uppercase tracking-widest mb-2">Yards</span>
                                        <span className="text-2xl font-display font-black text-white">{(player.total_rushing || 0) + (player.total_passing || 0) + (player.total_receiving || 0)}</span>
                                    </div>
                                    <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-3xl flex flex-col items-center">
                                        <span className="text-[11px] font-black text-zinc-600 uppercase tracking-widest mb-2">Tackles</span>
                                        <span className="text-2xl font-display font-black text-white">{player.total_tackles || 0}</span>
                                    </div>
                                </div>

                                <section>
                                    <div className="flex items-center gap-3 mb-4">
                                       <div className="w-1.5 h-6 bg-red-600"></div>
                                       <h3 className="text-lg font-display font-black uppercase italic tracking-tighter">Historial de Temporada</h3>
                                    </div>
                                    {history.length > 0 ? (
                                        <div className="space-y-3">
                                            {history.map(match => (
                                                <div key={match.id} className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-5 flex flex-col gap-4">
                                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-600">
                                                        <span>{new Date(match.match_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                                                        <span className="text-red-600">VS {match.visitor_team_name}</span>
                                                    </div>
                                                    <div className="grid grid-cols-4 gap-2">
                                                        <div className="flex flex-col"><span className="text-[8px] font-bold text-zinc-600 uppercase mb-0.5">TD</span><span className="text-sm font-display font-black">{match.touchdowns}</span></div>
                                                        <div className="flex flex-col"><span className="text-[8px] font-bold text-zinc-600 uppercase mb-0.5">YDS</span><span className="text-sm font-display font-black">{match.yards_rushing + match.yards_passing + match.yards_receiving}</span></div>
                                                        <div className="flex flex-col"><span className="text-[8px] font-bold text-zinc-600 uppercase mb-0.5">TCK</span><span className="text-sm font-display font-black">{match.tackles}</span></div>
                                                        <div className="flex flex-col"><span className="text-[8px] font-bold text-zinc-600 uppercase mb-0.5">MVP</span><span className="text-sm font-display font-black">{match.is_mvp ? '★' : '—'}</span></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <div className="text-center py-10 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl text-zinc-600 text-[10px] font-black uppercase tracking-widest">No hay partidos registrados aún</div>}
                                </section>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-fade pb-10">
                                <section className="bg-zinc-950 border border-zinc-800/60 rounded-3xl overflow-hidden divide-y divide-zinc-900/50">
                                    {[
                                        { label: 'Nombre Completo', value: player.name || 'N/A', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2' },
                                        { label: 'Jersey', value: player.jersey_number ? `#${player.jersey_number}` : 'N/A', icon: 'M12 2L4 5v11l8 3 8-3V5l-8-3z' },
                                        { label: 'Fecha de Nacimiento', value: player.birth_date ? new Date(player.birth_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A', icon: 'M16 2v4M8 2v4M3 10h18' },
                                        { label: 'CURP', value: player.curp || 'N/A', icon: 'M15 7h3a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h3' },
                                        { label: 'Sangre', value: player.blood_type_name || 'N/A', icon: 'M12 2C6 8 4 12 4 15a8 8 0 0016 0c0-3-2-7-8-13z' },
                                        { label: 'Posición Principal', value: player.position_name || 'N/A', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
                                        { label: 'Categoría', value: player.category_name || 'N/A', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2' },
                                        { label: 'Emergencia', value: player.emergency_phone || 'N/A', icon: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.06 1.18 2 2 0 012 0h3a2 2 0 012 1.72' },
                                        { label: 'Tutor / Padre', value: player.parent_name || 'N/A', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M16 3.13a4 4 0 010 7.75' },
                                        { label: 'Contacto Tutor', value: player.parent_phone || player.parent_email || 'N/A', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                                    ].map((info, i) => (
                                        <div key={i} className="flex items-center gap-4 p-5 group transition-colors hover:bg-zinc-900/50">
                                            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-red-500 transition-colors">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={info.icon}/></svg>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">{info.label}</p>
                                                <p className="text-sm font-bold text-white">{info.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </section>
                                <div className="bg-red-600/5 border border-red-900/20 p-6 rounded-3xl">
                                     <div className="flex items-center gap-2 mb-2">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>
                                        <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Alergias / Padecimientos</p>
                                     </div>
                                     <p className="text-sm font-bold text-zinc-300 ml-1">{player.allergies || 'Sin alertas médicas registradas.'}</p>
                                </div>
                            </div>
                        )}

                        {/* Botón Compartir Tarjeta */}
                        <div className="mt-8 flex justify-center">
                            <button 
                                onClick={() => setShowPoster(true)}
                                className="flex items-center gap-3 px-8 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-red-600 transition-all active:scale-95"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
                                Compartir Tarjeta Elite
                            </button>
                        </div>

                        {/* ── DIGITAL POSTER OVERLAY ── */}
                        {showPoster && (
                            <div className="fixed inset-0 z-[100] bg-black animate-fade flex flex-col items-center justify-center p-6">
                                <button 
                                    onClick={() => setShowPoster(false)}
                                    className="absolute top-8 right-8 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-xl border border-white/10"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                </button>

                                <div className="w-full max-w-[340px] aspect-[9/16] bg-zinc-950 rounded-[3rem] border-8 border-zinc-900 relative overflow-hidden shadow-[0_0_80px_rgba(220,38,38,0.3)]">
                                    {/* Poster Background effects */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-red-600/20 to-black"></div>
                                    <div className="absolute top-0 left-0 w-full h-1/2 bg-[url('/logo_osos.webp')] bg-no-repeat bg-center bg-contain opacity-5 scale-150"></div>
                                    
                                    <div className="relative h-full flex flex-col items-center p-8">
                                        {/* Club Name */}
                                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-red-600 mb-8 italic">Club Osos de Chiapas</p>
                                        
                                        {/* Player Image with Glow */}
                                        <div className="relative mb-8 group">
                                            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-red-600 to-transparent blur-3xl opacity-30"></div>
                                            <div className="w-48 h-48 rounded-full border-4 border-red-600 p-1.5 shadow-2xl relative z-10">
                                                <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden border-2 border-black">
                                                    {player.photo_url ? (
                                                        <img src={player.photo_url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-5xl font-display font-black text-zinc-800">{initials}</div>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Jersey Number Badge */}
                                            <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center border-4 border-black text-white font-display font-black text-xl italic shadow-2xl">
                                                #{player.jersey_number || '00'}
                                            </div>
                                        </div>

                                        {/* Player Name */}
                                        <h2 className="text-4xl font-display font-black uppercase italic tracking-tighter text-center leading-none mb-2 text-white drop-shadow-lg">
                                            {player.name.split(' ').slice(0, 2).join('\n')}
                                        </h2>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-10 italic">Posición: {player.position_name?.match(/\(([^)]+)\)/)?.[1] || 'JDR'}</p>

                                        {/* Stats Grid Highlight */}
                                        <div className="grid grid-cols-3 gap-1 w-full mt-auto">
                                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex flex-col items-center">
                                                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">TDs</span>
                                                <span className="text-xl font-display font-black text-red-600 italic">{player.total_tds || 0}</span>
                                            </div>
                                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center scale-110 shadow-xl">
                                                <span className="text-[8px] font-black text-white uppercase tracking-widest mb-1 italic">Yards</span>
                                                <span className="text-xl font-display font-black text-white italic">{(player.total_rushing || 0) + (player.total_passing || 0)}</span>
                                            </div>
                                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex flex-col items-center">
                                                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Tackles</span>
                                                <span className="text-xl font-display font-black text-red-600 italic">{player.total_tackles || 0}</span>
                                            </div>
                                        </div>

                                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em] mt-10 italic">¡Grita Oso!</p>
                                    </div>
                                </div>
                                <p className="mt-8 text-zinc-500 text-[10px] font-black uppercase tracking-widest animate-pulse">Captura de pantalla para compartir</p>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default PlayerDetail;
