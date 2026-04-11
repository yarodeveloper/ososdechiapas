import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminCalendar = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_type: 'match',
        start_time: '',
        location_name: '',
        location_url: '',
        rival_id: '',
        category_id: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [eventsRes, catsRes, teamsRes] = await Promise.all([
                fetch('/api/calendar'),
                fetch('/api/categories'),
                fetch('/api/teams')
            ]);
            
            setEvents(await eventsRes.json());
            setCategories(await catsRes.json());
            const teamsData = await teamsRes.json();
            setTeams(teamsData.filter(t => t.is_club_oso === 0));
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingEvent ? `/api/calendar/${editingEvent.id}` : '/api/calendar';
        const method = editingEvent ? 'PUT' : 'POST';
        
        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowForm(false);
                setEditingEvent(null);
                fetchData();
                setFormData({ title: '', description: '', event_type: 'match', start_time: '', location_name: '', location_url: '', rival_id: '', category_id: '' });
                alert(editingEvent ? '¡Evento actualizado!' : '¡Evento notificado exitosamente!');
            }
        } catch (err) { console.error(err); }
    };

    const handleEdit = (ev) => {
        // Convert ISO date to datetime-local format
        const date = new Date(ev.start_time);
        const formattedDate = date.toISOString().slice(0, 16);
        
        setEditingEvent(ev);
        setFormData({
            title: ev.title,
            description: ev.description || '',
            event_type: ev.event_type,
            start_time: formattedDate,
            location_name: ev.location_name,
            location_url: ev.location_url || '',
            rival_id: ev.rival_id || '',
            category_id: ev.category_id || ''
        });
        setShowForm(true);
    };

    const updateScore = async (id, sOsos, sRival) => {
        try {
            const res = await fetch(`/api/calendar/${id}/score`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score_osos: sOsos, score_rival: sRival })
            });
            if (res.ok) fetchData();
        } catch (err) { console.error(err); }
    };

    const deleteEvent = async (id) => {
        if (!window.confirm('¿Eliminar este evento?')) return;
        try {
            const res = await fetch(`/api/calendar/${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (err) { console.error(err); }
    };

    const getTypeStyle = (type) => {
        switch (type) {
            case 'match': return 'bg-red-600 text-white';
            case 'training': return 'bg-amber-500 text-black';
            case 'travel': return 'bg-zinc-100 text-black';
            default: return 'bg-zinc-800 text-zinc-400';
        }
    };

    if (loading) return <div className="bg-black min-h-screen flex items-center justify-center text-white italic">Sincronizando Agenda...</div>;

    return (
        <div className="bg-[#050505] min-h-screen text-white font-outfit pb-20 overflow-x-hidden">
            <header className="fixed top-0 left-0 w-full bg-black/90 backdrop-blur-xl border-b border-white/5 z-50">
                <div className="max-w-md mx-auto px-6 py-5 flex justify-between items-center">
                    <button onClick={() => navigate('/admin/dashboard')} className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-500">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="text-xs font-black uppercase tracking-[0.3em] italic">Agenda <span className="text-red-600">Osos</span></span>
                    <button onClick={() => { setShowForm(!showForm); if(showForm) setEditingEvent(null); }} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showForm ? 'bg-red-600 text-white rotate-45' : 'bg-zinc-900 text-zinc-400'}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                    </button>
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 pt-24 space-y-8">
                
                {showForm && (
                    <section className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 animate-slide-up shadow-2xl">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8 leading-none">
                            {editingEvent ? 'Editar' : 'Nueva'}<br/>
                            <span className="text-red-600">{editingEvent ? 'Actividad' : 'Actividad'}</span>
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-3 gap-2">
                                {['match', 'training', 'travel'].map(t => (
                                    <button 
                                        key={t} type="button" 
                                        onClick={() => setFormData({...formData, event_type: t})}
                                        className={`py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border ${formData.event_type === t ? 'bg-red-600 text-white' : 'border-zinc-900 text-zinc-600'}`}
                                    >
                                        {t.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                            <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-black border border-zinc-900 rounded-2xl py-4 px-5 text-sm outline-none focus:border-red-600 font-bold" placeholder="Título del evento" />
                            <div className="grid grid-cols-2 gap-4">
                                <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="bg-black border border-zinc-900 rounded-2xl py-4 px-4 text-[10px] font-black uppercase outline-none focus:border-red-600 text-zinc-400">
                                    <option value="">CATEGORÍA</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <input required type="datetime-local" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="bg-black border border-zinc-900 rounded-2xl py-4 px-4 text-[10px] outline-none focus:border-red-600 font-black text-zinc-400" />
                            </div>

                            {formData.event_type === 'match' && (
                                <select required value={formData.rival_id} onChange={e => setFormData({...formData, rival_id: e.target.value})} className="w-full bg-black border border-zinc-900 rounded-2xl py-4 px-5 text-[10px] font-black uppercase outline-none focus:border-red-600 text-zinc-400">
                                    <option value="">SELECCIONAR RIVAL</option>
                                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            )}

                            <input required value={formData.location_name} onChange={e => setFormData({...formData, location_name: e.target.value})} className="w-full bg-black border border-zinc-900 rounded-2xl py-4 px-5 text-sm outline-none focus:border-red-600 font-bold" placeholder="Lugar (Ej: Estadio Central)" />
                            
                            <button type="submit" className="w-full bg-red-600 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest active:scale-95 transition-all shadow-xl shadow-red-900/20">
                                {editingEvent ? 'GUARDAR CAMBIOS' : 'PUBLICAR Y NOTIFICAR'}
                            </button>
                        </form>
                    </section>
                )}

                <div className="space-y-6">
                    {events.map(ev => (
                        <div key={ev.id} className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-7 shadow-xl relative group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${getTypeStyle(ev.event_type)}`}>{ev.event_type}</span>
                                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{ev.category_name || 'GENERAL'}</span>
                                    </div>
                                    <h4 className="text-lg font-black italic tracking-tighter uppercase leading-none">{ev.title}</h4>
                                    <p className="text-[9px] font-bold text-red-600 uppercase italic">{new Date(ev.start_time).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour12: false, hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => handleEdit(ev)} className="text-zinc-600 hover:text-white transition-colors">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </button>
                                    <button onClick={() => deleteEvent(ev.id)} className="text-zinc-800 hover:text-red-500 transition-colors">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                    </button>
                                </div>
                            </div>

                            {ev.event_type === 'match' && (
                                <div className="mt-4 pt-5 border-t border-white/5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <input 
                                                type="number" 
                                                value={ev.score_osos ?? ''} 
                                                placeholder="OSOS"
                                                onChange={(e) => updateScore(ev.id, e.target.value, ev.score_rival)}
                                                className="w-14 bg-black border border-zinc-800 rounded-xl py-2 text-center text-xs font-black text-red-600 outline-none focus:border-red-600"
                                            />
                                            <span className="text-zinc-700 text-[10px] font-black italic">VS</span>
                                            <input 
                                                type="number" 
                                                value={ev.score_rival ?? ''} 
                                                placeholder="RIVAL"
                                                onChange={(e) => updateScore(ev.id, ev.score_osos, e.target.value)}
                                                className="w-14 bg-black border border-zinc-800 rounded-xl py-2 text-center text-xs font-black text-zinc-400 outline-none focus:border-zinc-600"
                                            />
                                        </div>
                                        <button 
                                            onClick={() => navigate(`/admin/matches/${ev.id}/stats`)}
                                            className="bg-red-600/10 text-red-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                                        >
                                            Captura Stats 🏈
                                        </button>
                                    </div>
                                    <p className="text-[7px] font-black text-zinc-700 uppercase tracking-[0.2em] text-center italic">Registra marcadores y desempeño individual para el ranking</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default AdminCalendar;
