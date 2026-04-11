import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminCategories = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [leagues, setLeagues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('categories'); // 'categories' or 'leagues'
    
    // Form States
    const [catForm, setCatForm] = useState({ id: null, name: '', league_id: '', description: '' });
    const [leagueForm, setLeagueForm] = useState({ id: null, name: '', season_year: new Date().getFullYear() });
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cRes, lRes] = await Promise.all([
                fetch('/api/categories'),
                fetch('/api/categories/leagues/all')
            ]);
            const cData = await cRes.json();
            const lData = await lRes.json();
            setCategories(cData);
            setLeagues(lData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCategory = async (e) => {
        e.preventDefault();
        const method = catForm.id ? 'PUT' : 'POST';
        const url = catForm.id ? `/api/categories/${catForm.id}` : '/api/categories';
        
        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(catForm)
            });
            if (res.ok) {
                setShowModal(false);
                fetchData();
            }
        } catch (err) { console.error(err); }
    };

    const handleSaveLeague = async (e) => {
        e.preventDefault();
        const method = leagueForm.id ? 'PUT' : 'POST';
        const url = leagueForm.id ? `/api/categories/leagues/${leagueForm.id}` : '/api/categories/leagues';
        
        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leagueForm)
            });
            if (res.ok) {
                setShowModal(false);
                fetchData();
            } else {
                const errData = await res.json();
                alert(errData.error || 'Error al guardar la liga');
            }
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm('¿Estás seguro? Esta acción puede afectar a jugadores y partidos.')) return;
        const url = type === 'cat' ? `/api/categories/${id}` : `/api/categories/leagues/${id}`;
        try {
            const res = await fetch(url, { method: 'DELETE' });
            if (res.ok) {
                fetchData();
            } else {
                const errData = await res.json();
                alert(errData.error || 'No se pudo eliminar el recurso.');
            }
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="bg-black min-h-screen flex items-center justify-center text-white">Sincronizando...</div>;

    return (
        <div className="bg-[#050505] min-h-screen text-white font-outfit pb-20">
            <header className="p-6 border-b border-white/5 sticky top-0 bg-black/80 backdrop-blur-md z-50">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin/settings')} className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-white transition-all">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                        </button>
                        <h1 className="text-xl font-black uppercase italic tracking-tighter">Ligas y <span className="text-red-600">Categorías</span></h1>
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto p-6 pt-10">
                {/* Tabs */}
                <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-900 mb-10 shadow-xl">
                    <button 
                        onClick={() => setView('categories')}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'categories' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-zinc-600'}`}
                    >
                        Categorías
                    </button>
                    <button 
                        onClick={() => setView('leagues')}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'leagues' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-zinc-600'}`}
                    >
                        Ligas
                    </button>
                </div>

                {view === 'categories' ? (
                    <div className="space-y-4 animate-fade">
                        <div className="flex justify-between items-center mb-6 px-2">
                             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">Lista de Divisiones</p>
                             <button onClick={() => { setCatForm({ id: null, name: '', league_id: '', description: '' }); setShowModal(true); }} className="text-[10px] font-black text-red-600 uppercase tracking-widest">+ Añadir</button>
                        </div>
                        {categories.map(cat => (
                            <div key={cat.id} className="bg-zinc-950 border border-zinc-900 rounded-[2rem] p-6 flex flex-col gap-4 shadow-xl">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-red-600 mb-1 italic">{cat.league_name || 'SIN LIGA'}</p>
                                        <h3 className="text-lg font-black uppercase italic tracking-tight">{cat.name}</h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setCatForm(cat); setShowModal(true); }} className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-500"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                                        <button onClick={() => handleDelete('cat', cat.id)} className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center text-red-500"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4 animate-fade">
                        <div className="flex justify-between items-center mb-6 px-2">
                             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">Lista de Ligas Registradas</p>
                             <button onClick={() => { setLeagueForm({ id: null, name: '', season_year: new Date().getFullYear() }); setShowModal(true); }} className="text-[10px] font-black text-red-600 uppercase tracking-widest">+ Añadir</button>
                        </div>
                        {leagues.map(l => (
                            <div key={l.id} className="bg-zinc-950 border border-zinc-900 rounded-[2rem] p-6 flex justify-between items-center shadow-xl">
                                <div>
                                    <h3 className="text-lg font-black uppercase italic tracking-tight">{l.name}</h3>
                                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Temporada: {l.season_year}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setLeagueForm(l); setShowModal(true); }} className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-500"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                                    <button onClick={() => handleDelete('league', l.id)} className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-500"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal de Formulario */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                    <div className="bg-zinc-950 border border-zinc-900 w-full max-w-md rounded-[2.5rem] p-8 animate-slide-up shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-black uppercase italic tracking-tighter">
                                {view === 'categories' ? (catForm.id ? 'Editar Categoría' : 'Nueva Categoría') : (leagueForm.id ? 'Editar Liga' : 'Nueva Liga')}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-zinc-600"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
                        </div>

                        {view === 'categories' ? (
                            <form onSubmit={handleSaveCategory} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Nombre</label>
                                    <input value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} className="w-full bg-black border border-zinc-900 rounded-2xl py-4 px-5 text-sm outline-none focus:border-red-600 font-bold" placeholder="Ej. Bantam A" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Liga Asociada</label>
                                    <select value={catForm.league_id} onChange={e => setCatForm({...catForm, league_id: e.target.value})} className="w-full bg-black border border-zinc-900 rounded-2xl py-4 px-5 text-sm outline-none focus:border-red-600 font-bold appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222.5%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_20px_center] bg-no-repeat" required>
                                        <option value="">Selecciona Liga...</option>
                                        {leagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                </div>
                                <button type="submit" className="w-full bg-red-600 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-red-900/40 active:scale-95 transition-all mt-4">GUARDAR CATEGORÍA</button>
                            </form>
                        ) : (
                            <form onSubmit={handleSaveLeague} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Nombre de la Liga</label>
                                    <input value={leagueForm.name} onChange={e => setLeagueForm({...leagueForm, name: e.target.value})} className="w-full bg-black border border-zinc-900 rounded-2xl py-4 px-5 text-sm outline-none focus:border-red-600 font-bold" placeholder="Ej. ACHFA" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Año Temporada</label>
                                    <input type="number" value={leagueForm.season_year} onChange={e => setLeagueForm({...leagueForm, season_year: e.target.value})} className="w-full bg-black border border-zinc-900 rounded-2xl py-4 px-5 text-sm outline-none focus:border-red-600 font-bold" required />
                                </div>
                                <button type="submit" className="w-full bg-red-600 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-red-900/40 active:scale-95 transition-all mt-4">
                                    {leagueForm.id ? 'GUARDAR LIGA' : 'CREAR LIGA'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
