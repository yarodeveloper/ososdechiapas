import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SvgIcon from '../components/SvgIcon';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

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
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [deactivationReason, setDeactivationReason] = useState('Cambio de equipo');
    
    // Catalogs for editing
    const [positions, setPositions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [bloodTypes, setBloodTypes] = useState([]);
    
    // Form state
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
        parent_name: '',
        parent_email: '',
        parent_phone: '',
        status: 'active'
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isStaff = user.role === 'admin' || user.role === 'coach';
    const isCoach = user.role === 'coach';
    const isAdmin = user.role === 'admin';

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
                    position_ids: statsData.position_ids || [],
                    category_id: statsData.category_id || '',
                    blood_type_id: statsData.blood_type_id || '',
                    emergency_phone: statsData.emergency_phone || '',
                    allergies: statsData.allergies || '',
                    jersey_number: statsData.jersey_number || '',
                    parent_name: statsData.parent_name || '',
                    parent_email: statsData.parent_email || '',
                    parent_phone: statsData.parent_phone || '',
                    status: statsData.status || 'active',
                    deactivation_reason: statsData.deactivation_reason || ''
                });

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);


    const handleSave = async (e, forceStatus = null, reason = null) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        setSaving(true);
        try {
            const data = new FormData();
            
            if (forceStatus) {
                data.append('status', forceStatus);
                if (reason) data.append('deactivation_reason', reason);
                else if (deactivationReason) data.append('deactivation_reason', deactivationReason);

                Object.entries(formData).forEach(([k, v]) => {
                    if (k !== 'status' && k !== 'deactivation_reason') {
                        if (Array.isArray(v)) {
                            v.forEach(val => data.append(`${k}[]`, val));
                        } else {
                            data.append(k, v || '');
                        }
                    }
                });
            } else {
                Object.entries(formData).forEach(([k, v]) => {
                    if (Array.isArray(v)) {
                        v.forEach(val => data.append(`${k}[]`, val));
                    } else {
                        data.append(k, v || '');
                    }
                });
            }
            if (photoFile) data.append('photo', photoFile);

            const res = await fetch(`/api/players/${id}`, { method: 'PUT', body: data });
            if (!res.ok) {
                const error = await res.text();
                throw new Error(error);
            }

            const updated = await fetch(`/api/stats/player/${id}?t=${Date.now()}`);
            const updatedData = await updated.json();
            
            setPlayer(updatedData);
            setFormData({
                name: updatedData.name || '',
                birth_date: updatedData.birth_date ? updatedData.birth_date.split('T')[0] : '',
                curp: updatedData.curp || '',
                position_id: updatedData.position_id || '',
                position_ids: updatedData.position_ids || [],
                category_id: updatedData.category_id || '',
                blood_type_id: updatedData.blood_type_id || '',
                emergency_phone: updatedData.emergency_phone || '',
                allergies: updatedData.allergies || '',
                jersey_number: updatedData.jersey_number || '',
                parent_name: updatedData.parent_name || '',
                parent_email: updatedData.parent_email || '',
                parent_phone: updatedData.parent_phone || '',
                status: updatedData.status || 'active',
                deactivation_reason: updatedData.deactivation_reason || ''
            });
            setEditing(false);
            setPhotoFile(null);
            setPhotoPreview(null);
            
            if (forceStatus === 'baja') {
                setShowDeactivateModal(false);
                alert('Jugador dado de baja correctamente.');
                window.location.reload();
            } else if (forceStatus) {
                alert('Estatus actualizado correctamente.');
            }
        } catch (err) {
            console.error(err);
            alert('Error al procesar: ' + err.message);
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

    const inputCls = "w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-red-600 transition-colors";
    const labelCls = "text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-1.5 ml-1";

    const chartData = {
        labels: [...history].reverse().map(s => {
            const d = new Date(s.event_date);
            return `${d.getDate()}/${d.getMonth()+1}`;
        }),
        datasets: []
    };

    if (player?.total_yards_passing > 0) {
        chartData.datasets.push({
            label: 'Yardas Pase',
            data: [...history].reverse().map(s => parseInt(s.yards_passing) || 0),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            borderWidth: 3,
            borderDash: [5, 5],
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#000',
            pointRadius: 4,
            fill: true,
            tension: 0.4
        });
    }

    if (player?.total_yards_rushing > 0 || player?.total_yards_receiving > 0 || player?.total_yards_passing === 0) {
        chartData.datasets.push({
            label: 'Yardas Scrimmage',
            data: [...history].reverse().map(s => (parseInt(s.yards_rushing)||0) + (parseInt(s.yards_receiving)||0)),
            borderColor: '#dc2626',
            backgroundColor: 'rgba(220, 38, 38, 0.15)',
            borderWidth: 3,
            pointBackgroundColor: '#dc2626',
            pointBorderColor: '#000',
            pointRadius: 4,
            fill: true,
            tension: 0.4
        });
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
            legend: { 
                display: true, 
                position: 'bottom',
                labels: {
                    color: '#71717a',
                    font: { size: 10, family: 'Inter', weight: 'bold' },
                    usePointStyle: true,
                    boxWidth: 8
                }
            },
            tooltip: {
                backgroundColor: '#18181b',
                titleColor: '#fff',
                bodyColor: '#ef4444',
                bodyFont: { weight: 'bold' },
                displayColors: false,
                padding: 12,
                cornerRadius: 8
            }
        },
        scales: { 
           x: { grid: { display: false }, ticks: { color: '#71717a', font: { size: 9, family: 'Inter', weight: 'bold' } } },
           y: { suggestedMax: 50, grid: { color: '#27272a', borderDash: [5, 5] }, ticks: { color: '#71717a', font: { size: 10, family: 'Inter', weight: 'bold' }, padding: 10 }, beginAtZero: true }
        }
    };

    return (
        <div className="min-h-screen pb-20 selection:bg-red-600 selection:text-white" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
            <header className="sticky top-0 z-50 backdrop-blur-md border-b px-6 py-4" style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-main)' }}>
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <button onClick={() => editing ? setEditing(false) : navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-zinc-900 rounded-full active:scale-95 transition-transform border border-zinc-800">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d={editing ? "M18 6L6 18M6 6l12 12" : "M15 18l-6-6 6-6"} /></svg>
                    </button>
                    <span className="font-display font-black text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--text-dim)' }}>
                        {editing ? 'Editar Jugador' : 'Player Card'}
                    </span>
                    {isAdmin ? (
                        <button 
                            onClick={() => editing ? handleSave() : setEditing(true)}
                            disabled={saving}
                            className="w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-90 disabled:opacity-50"
                            style={{ backgroundColor: editing ? 'var(--primary)' : 'var(--bg-card)', color: editing ? 'white' : 'var(--primary)', border: editing ? 'none' : '1px solid var(--border-main)' }}
                        >
                            {editing ? (
                                saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            )}
                        </button>
                    ) : <div className="w-10"></div>}
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 pt-6">
                {!editing && player?.status === 'baja' && (
                    <div className="mb-6 bg-red-950/20 border border-red-900/30 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-900/40">
                             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Baja Definitiva</p>
                            <p className="text-[9px] font-medium leading-tight mt-0.5" style={{ color: 'var(--text-dim)' }}>
                                <span className="opacity-50 uppercase text-[8px] font-black mr-1">Motivo:</span> 
                                {player?.deactivation_reason || 'No especificado'}
                            </p>
                        </div>
                    </div>
                )}

                {editing ? (
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
                            
                            <div>
                                <label className={labelCls}>Posiciones</label>
                                <div className="grid grid-cols-2 gap-2 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
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
                                                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-red-600/10 border-red-600/50' : 'border opacity-60'}`}
                                                style={!isSelected ? { backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)' } : {}}
                                            >
                                                <span className="text-[10px] font-black uppercase truncate mr-2" style={{ color: 'var(--text-main)' }}>{p.name.replace(/\s*\([^)]*\)/, '')}</span>
                                                {isSelected && (
                                                    <div 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFormData({...formData, position_id: p.id});
                                                        }}
                                                        className={`w-5 h-5 rounded-md flex items-center justify-center border ${isPrimary ? 'bg-red-600 border-red-500' : 'bg-zinc-800 border-zinc-700'}`}
                                                    >
                                                        {isPrimary ? (
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                                        ) : (
                                                            <div className="w-1 h-1 rounded-full bg-zinc-600"></div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Categoría</label>
                                    <select className={inputCls} value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                                        <option value="">Seleccionar</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Número Jersey</label>
                                    <input type="number" className={inputCls} value={formData.jersey_number} onChange={e => setFormData({...formData, jersey_number: e.target.value})} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Fecha Nacimiento</label>
                                    <input type="date" className={inputCls} value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} />
                                </div>
                                <div>
                                    <label className={labelCls}>CURP</label>
                                    <input className={inputCls} value={formData.curp} maxLength={18} onChange={e => setFormData({...formData, curp: e.target.value.toUpperCase()})} />
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
                            onClick={(e) => handleSave(e)}
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
                                    <span className="text-xl font-display font-black text-white uppercase italic">
                                        {player?.display_positions && player.display_positions.includes(',') ? 'MÚLT' : (player?.position_name?.match(/\(([^)]+)\)/)?.[1] || 'JDR')}
                                    </span>
                                </div>
                                <div className="absolute top-6 right-6 flex flex-col items-center">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">NUM</span>
                                    <span className="text-xl font-display font-black text-white italic">#{player?.jersey_number || '00'}</span>
                                </div>
                                <div 
                                    className={`relative w-44 h-44 rounded-[2rem] bg-zinc-900 border-2 border-zinc-800 shadow-2xl overflow-hidden mb-6 mt-6 shrink-0 aspect-square flex items-center justify-center ${player?.status !== 'active' ? 'grayscale opacity-60' : ''}`}
                                    style={{ isolation: 'isolate' }}
                                >
                                    {player.photo_url ? (
                                        <img 
                                            src={player.photo_url} 
                                            alt={player.name} 
                                            className="w-full h-full object-cover rounded-[2rem]" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl font-display font-black text-zinc-700 select-none">
                                            {initials}
                                        </div>
                                    )}
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-display font-black uppercase italic tracking-tighter text-center leading-tight mb-3 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                    {player?.name || '---'}
                                </h1>
                                <div className="flex items-center gap-2">
                                    <span className="bg-red-600/10 text-red-500 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-red-600/20">Osos {player.category_name}</span>
                                    {player?.status === 'inactive' && (
                                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border flex items-center gap-1.5 bg-amber-600/10 text-amber-500 border-amber-600/20">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                            En Pausa
                                        </span>
                                    )}
                                </div>
                            </div>
                        </section>

                        <div className="flex p-1 bg-zinc-950 border border-zinc-900 rounded-2xl mb-8">
                            <button onClick={() => setActiveTab('stats')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'stats' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-600'}`}>Estadísticas</button>
                            <button onClick={() => setActiveTab('info')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'info' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-600'}`}>Información</button>
                        </div>

                        {activeTab === 'stats' ? (
                            <div className="space-y-8 animate-fade pb-10">
                                <div className="grid grid-cols-3 gap-3">
                                    {(player.total_yards_passing > 0) && (
                                        <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-3xl flex flex-col items-center">
                                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Pass Yds</span>
                                            <span className="text-xl font-display font-black text-white italic">{player.total_yards_passing || 0}</span>
                                        </div>
                                    )}
                                    {(player.total_yards_rushing > 0 || player.total_yards_receiving > 0 || player.total_yards_passing === 0) && (
                                        <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-3xl flex flex-col items-center">
                                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Scrimmage Yds</span>
                                            <span className="text-xl font-display font-black text-white italic">{(parseInt(player.total_yards_rushing)||0) + (parseInt(player.total_yards_receiving)||0)}</span>
                                        </div>
                                    )}
                                    {(player.total_receptions > 0) && (
                                        <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-3xl flex flex-col items-center">
                                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Recepciones</span>
                                            <span className="text-xl font-display font-black text-white italic">{player.total_receptions || 0}</span>
                                        </div>
                                    )}
                                    <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-3xl flex flex-col items-center">
                                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Touchdowns</span>
                                        <span className="text-xl font-display font-black text-red-600 italic">{player.total_tds || 0}</span>
                                    </div>
                                    <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-3xl flex flex-col items-center">
                                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Intercep / Sacks</span>
                                        <span className="text-xl font-display font-black text-white">{(player.total_interceptions || 0)} / {(player.total_sacks || 0)}</span>
                                    </div>
                                </div>

                                {history.length > 0 && (
                                    <section className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-6 shadow-xl relative mb-8">
                                        <div className="flex justify-between items-center mb-6 px-2">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">Evolución de Yardas</h3>
                                        </div>
                                        <div className="h-48 w-full px-2">
                                            <Line data={chartData} options={chartOptions} />
                                        </div>
                                    </section>
                                )}

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
                                                        <span>{new Date(match.event_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                                                        <span className="text-red-600 font-bold">VS {match.event_title}</span>
                                                    </div>
                                                    <div className="grid grid-cols-4 gap-4 border-t border-zinc-800/50 pt-3">
                                                        <div className="flex flex-col"><span className="text-[7px] font-black text-zinc-600 uppercase mb-0.5 tracking-tighter">TD (OF/DF)</span><span className="text-xs font-black">{match.td_offense}/{match.td_defense}</span></div>
                                                        <div className="flex flex-col"><span className="text-[7px] font-black text-zinc-600 uppercase mb-0.5 tracking-tighter">YDS (P/SC) / REC</span><span className="text-xs font-black">{match.yards_passing}/{(parseInt(match.yards_rushing)||0)+(parseInt(match.yards_receiving)||0)} / {match.receptions||0}</span></div>
                                                        <div className="flex flex-col"><span className="text-[7px] font-black text-zinc-600 uppercase mb-0.5 tracking-tighter">DEF (T/I/S)</span><span className="text-xs font-black">{match.tackles}/{match.interceptions}/{match.sacks}</span></div>
                                                        <div className="flex flex-col items-end"><span className="text-[7px] font-black text-zinc-600 uppercase mb-0.5 tracking-tighter">MVP</span><span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${match.is_mvp ? 'bg-amber-500 text-black shadow-lg shadow-amber-900/40' : 'bg-zinc-800 text-zinc-600'}`}>{match.is_mvp ? '★' : '—'}</span></div>
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
                                        ...(!isCoach ? [{ label: 'CURP', value: player.curp || 'N/A', icon: 'M15 7h3a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h3' }] : []),
                                        { label: 'Sangre', value: player.blood_type_name || 'N/A', icon: 'M12 2C6 8 4 12 4 15a8 8 0 0016 0c0-3-2-7-8-13z' },
                                        { label: 'Posiciones', value: player.display_positions || player.position_name || 'N/A', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
                                        { label: 'Categoría', value: player.category_name || 'N/A', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2' },
                                        ...(!isCoach ? [
                                           { label: 'Emergencia', value: player.emergency_phone || 'N/A', icon: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.06 1.18 2 2 0 012 0h3a2 2 0 012 1.72' },
                                           { label: 'Tutor / Padre', value: player.parent_name || 'N/A', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M16 3.13a4 4 0 010 7.75' },
                                           { label: 'Contacto Tutor', value: player.parent_phone || player.parent_email || 'N/A', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }
                                        ] : [])
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
                                     <p className="text-sm font-bold ml-1" style={{ color: 'var(--text-main)' }}>{player.allergies || 'Sin alertas médicas registradas.'}</p>
                                </div>

                                {isAdmin && (
                                    <div className="mt-8 space-y-4">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-1.5 h-6 bg-blue-600"></div>
                                            <h3 className="text-lg font-display font-black uppercase italic tracking-tighter">Gestión de Accesos</h3>
                                        </div>
                                        <div className="bg-zinc-950 border border-blue-900/20 rounded-3xl p-6 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">Usuario / Email</p>
                                                    <p className="text-sm font-bold text-white">{player.parent_email || 'No asignado'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1 text-right">Contraseña</p>
                                                    <p className="text-sm font-bold text-white text-right">{player.parent_password || '********'}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-3 pt-4 border-t border-zinc-900">
                                                <button 
                                                    onClick={async () => {
                                                        if (!player?.user_id) {
                                                            alert("Este jugador no tiene un usuario de tutor vinculado.");
                                                            return;
                                                        }
                                                        const defaultTempPass = "osos" + new Date().getFullYear();
                                                        const newPass = window.prompt("Ingresa la nueva contraseña temporal:", defaultTempPass);
                                                        if (!newPass) return;
                                                        try {
                                                            const res = await fetch(`/api/users/${player.user_id}/password`, {
                                                                method: 'PUT',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ password: newPass })
                                                            });
                                                            if (res.ok) {
                                                                alert("Contraseña actualizada con éxito.");
                                                                setPlayer(prev => ({ ...prev, parent_password: newPass }));
                                                            } else {
                                                                const errData = await res.json().catch(() => ({}));
                                                                alert("Error al actualizar: " + (errData.message || "Error del servidor"));
                                                            }
                                                        } catch (e) { 
                                                            alert("Error al actualizar la contraseña."); 
                                                        }
                                                    }}
                                                    className="w-full bg-zinc-900 border border-zinc-800 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                                                >
                                                    Cambiar Contraseña
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        const pass = player.parent_password || '********';
                                                        const text = `Club Osos de Chiapas\n\nAccesos Portal de Padres:\nEmail: ${player.parent_email}\nPass: ${pass}\nLink: ${window.location.origin}/login`;
                                                        const cleanPhone = (rawPhone) => {
                                                            if (!rawPhone) return '';
                                                            const clean = rawPhone.replace(/\D/g, '');
                                                            if (clean.length === 10) {
                                                                return `52${clean}`;
                                                            }
                                                            return clean;
                                                        };
                                                        const phone = cleanPhone(player.parent_phone);
                                                        const wpUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
                                                        window.open(wpUrl, '_blank');
                                                    }}
                                                    className="w-full bg-green-600 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 shadow-xl shadow-green-900/20 active:scale-95 transition-all"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.102-1.339a9.916 9.916 0 004.91 1.3c5.507 0 9.99-4.478 9.99-9.984s-4.483-9.984-9.99-9.984zm5.721 14.123c-.247.691-1.224 1.285-1.681 1.369-.456.084-.91.134-2.82-.622-2.308-.911-3.793-3.256-3.908-3.41-.115-.153-.935-1.244-.935-2.392 0-1.148.601-1.711.815-1.942.214-.231.468-.289.625-.289.156 0 .312.001.447.007.143.006.336-.055.526.403.19.458.647 1.579.704 1.693.057.114.095.247.019.399-.076.152-.114.247-.228.38-.114.133-.24.298-.342.4-.114.114-.233.238-.101.465.132.227.587.967 1.26 1.564.867.77 1.597 1.01 1.825 1.124.228.114.361.095.495-.057.133-.152.57-.665.722-.892.152-.228.304-.19.513-.114.21.076 1.33.627 1.558.741.229.114.381.171.438.266.057.095.057.551-.19 1.242z"/></svg>
                                                    Enviar por WhatsApp
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {user.role === 'admin' && (
                                    <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--border-main)' }}>
                                        <div className="border rounded-3xl p-8 text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--primary)', borderOpacity: 0.1 }}>
                                            <h4 className="text-sm font-black uppercase italic tracking-widest mb-2" style={{ color: 'var(--primary)' }}>Zona de Control de Roster</h4>
                                            <p className="text-[10px] uppercase font-bold mb-6 tracking-widest leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                                                {player.status === 'active' 
                                                    ? 'Puedes pausar temporalmente al jugador o darle de baja definitiva del equipo.'
                                                    : player.status === 'inactive'
                                                    ? 'Jugador en pausa. Puedes reactivarlo o proceder con la baja definitiva.'
                                                    : 'Jugador dado de baja. Puedes reactivarlo si regresa al equipo.'}
                                            </p>

                                            {player.status === 'active' ? (
                                                <div className="flex flex-col gap-3 w-full">
                                                    <button 
                                                        onClick={async () => {
                                                            if(!window.confirm('¿Pausar temporalmente a este jugador? Seguirá en el roster pero sin acceso activo.')) return;
                                                            handleSave(null, 'inactive');
                                                        }}
                                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 w-full"
                                                        style={{ backgroundColor: 'transparent', borderColor: '#f59e0b', color: '#f59e0b' }}
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                                                        Pausar Jugador
                                                    </button>
                                                    <button 
                                                        onClick={() => setShowDeactivateModal(true)}
                                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 w-full"
                                                        style={{ backgroundColor: 'transparent', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                                                    >
                                                        <SvgIcon src="/icons/deactivate-user-svgrepo-com.svg" className="w-4 h-4" />
                                                        Dar de Baja del Equipo
                                                    </button>
                                                </div>
                                            ) : player.status === 'inactive' ? (
                                                <div className="flex flex-col gap-3 w-full">
                                                    <button 
                                                        onClick={async () => {
                                                            if(!window.confirm('¿Reactivar a este jugador y su acceso al portal?')) return;
                                                            handleSave(null, 'active');
                                                        }}
                                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 w-full"
                                                        style={{ backgroundColor: 'transparent', borderColor: 'green', color: 'green' }}
                                                    >
                                                        <SvgIcon src="/icons/check-mark-svgrepo-com.svg" className="w-4 h-4" />
                                                        Reactivar Jugador
                                                    </button>
                                                    <button 
                                                        onClick={() => setShowDeactivateModal(true)}
                                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 w-full"
                                                        style={{ backgroundColor: 'transparent', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                                                    >
                                                        <SvgIcon src="/icons/deactivate-user-svgrepo-com.svg" className="w-4 h-4" />
                                                        Dar de Baja Definitiva
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={async () => {
                                                        if(!window.confirm('¿Reactivar a este jugador y su acceso al portal?')) return;
                                                        handleSave(null, 'active');
                                                    }}
                                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 w-full"
                                                    style={{ backgroundColor: 'transparent', borderColor: 'green', color: 'green' }}
                                                >
                                                    <SvgIcon src="/icons/check-mark-svgrepo-com.svg" className="w-4 h-4" />
                                                    Reactivar Jugador
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {showDeactivateModal && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fade h-screen w-screen top-0 left-0">
                                <div className="absolute inset-0" onClick={() => setShowDeactivateModal(false)}></div>
                                <div className="relative border rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)' }}>
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-[var(--primary)]"></div>
                                    <h2 className="text-xl font-display font-black uppercase italic tracking-tighter mb-4" style={{ color: 'var(--text-main)' }}>Baja Definitiva</h2>
                                    <p className="text-xs mb-6 leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                                        Esta acción <b style={{ color: 'var(--primary)' }}>BLOQUEARÁ el acceso al portal</b> para el tutor y archivará al jugador permanentemente.
                                    </p>
                                    
                                    <div className="space-y-4 mb-8">
                                        <div className="relative">
                                            <label className="text-[9px] font-black uppercase tracking-widest block mb-2 ml-1" style={{ color: 'var(--text-muted)' }}>Motivo del Egreso</label>
                                            <select 
                                                className="w-full border rounded-xl px-4 py-3 text-xs outline-none focus:border-[var(--primary)] appearance-none"
                                                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                                                value={deactivationReason}
                                                onChange={e => setDeactivationReason(e.target.value)}
                                            >
                                                <option>Cambio de equipo</option>
                                                <option>Baja voluntaria</option>
                                                <option>Expulsión / Disciplina</option>
                                                <option>Mudanza</option>
                                                <option>Lesión larga duración</option>
                                                <option>Graduación / Edad</option>
                                                <option>Otro</option>
                                            </select>
                                            <div className="absolute right-4 top-[38px] pointer-events-none opacity-40">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
                                            </div>
                                        </div>
                                    </div>
        
                                    <div className="flex flex-col gap-3">
                                        <button 
                                            type="button"
                                            disabled={saving}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleSave(e, 'baja', deactivationReason);
                                            }}
                                            className="w-full bg-[var(--primary)] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-red-900/40 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {saving ? 'PROCESANDO...' : 'CONFIRMAR BAJA Y BLOQUEO'}
                                        </button>
                                        <button type="button" onClick={() => setShowDeactivateModal(false)} className="w-full py-3 text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>Cancelar</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 flex justify-center">
                            <button 
                                onClick={() => setShowPoster(true)}
                                className="flex items-center gap-3 px-8 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-red-600 transition-all active:scale-95"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
                                Compartir Tarjeta Elite
                            </button>
                        </div>

                        {showPoster && (
                            <div className="fixed inset-0 z-[100] bg-black animate-fade flex flex-col items-center justify-center p-6">
                                <button 
                                    onClick={() => setShowPoster(false)}
                                    className="absolute top-8 right-8 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-xl border border-white/10"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                </button>
                                <div className="w-full max-w-[340px] aspect-[9/16] bg-zinc-950 rounded-[3rem] border-8 border-zinc-900 relative overflow-hidden shadow-[0_0_80px_rgba(220,38,38,0.3)]">
                                    <div className="absolute inset-0 bg-gradient-to-b from-red-600/20 to-black"></div>
                                    <div className="absolute top-0 left-0 w-full h-1/2 bg-[url('/logo_osos.webp')] bg-no-repeat bg-center bg-contain opacity-5 scale-150"></div>
                                    <div className="relative h-full flex flex-col items-center p-8">
                                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-red-600 mb-8 italic">Club Osos de Chiapas</p>
                                        <div className="relative mb-8 group">
                                            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-red-600 to-transparent blur-3xl opacity-30"></div>
                                            <div className={`w-48 h-48 rounded-full border-4 border-red-600 p-1.5 shadow-2xl relative z-10 ${player.status === 'baja' ? 'grayscale opacity-60' : ''}`}>
                                                <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden border-2 border-black">
                                                    {player.photo_url ? (
                                                        <img src={player.photo_url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-5xl font-display font-black text-zinc-800">{initials}</div>
                                                    )}
                                                </div>
                                                {player.status === 'baja' && (
                                                    <div className="absolute inset-0 flex items-center justify-center z-20">
                                                        <div className="bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.5em] px-6 py-3 rounded-xl shadow-[0_0_40px_rgba(220,38,38,0.5)] rotate-[-12deg] border-4 border-white/20 backdrop-blur-sm">
                                                            FUERA DE ROSTER
                                                        </div>
                                                    </div>
                                                )}
                                                {player.status === 'inactive' && (
                                                    <div className="absolute inset-0 flex items-center justify-center z-20">
                                                        <div className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.5em] px-6 py-3 rounded-xl shadow-[0_0_40px_rgba(245,158,11,0.5)] rotate-[-12deg] border-4 border-white/20 backdrop-blur-sm">
                                                            EN PAUSA
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center border-4 border-black text-white font-display font-black text-xl italic shadow-2xl">
                                                #{player.jersey_number || '00'}
                                            </div>
                                        </div>
                                        <h2 className="text-4xl font-display font-black uppercase italic tracking-tighter text-center leading-none mb-2 text-white drop-shadow-lg whitespace-pre-line">
                                            {(player?.name || '').split(' ').slice(0, 2).join('\n')}
                                        </h2>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-10 italic">Posición: {player?.display_positions || player?.position_name || 'JDR'}</p>
                                        <div className="grid grid-cols-3 gap-1 w-full mt-auto">
                                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex flex-col items-center">
                                                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">TDs</span>
                                                <span className="text-xl font-display font-black text-red-600 italic">{player.total_tds || 0}</span>
                                            </div>
                                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center scale-110 shadow-xl">
                                                <span className="text-[8px] font-black text-white uppercase tracking-widest mb-1 italic">Yards</span>
                                                <span className="text-xl font-display font-black text-white italic">{(player.total_yards || 0)}</span>
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
