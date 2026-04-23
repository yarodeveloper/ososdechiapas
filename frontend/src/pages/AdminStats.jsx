import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AdminStats = () => {
    const { id } = useParams(); // game_id
    const navigate = useNavigate();
    const [match, setMatch] = useState(null);
    const [players, setPlayers] = useState([]);
    const [stats, setStats] = useState({}); // player_id -> { yards_passing, etc }
    const [loading, setLoading] = useState(true);
    const [allCategories, setAllCategories] = useState([]);
    const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);
    const [matchScoreOsos, setMatchScoreOsos] = useState(0);
    const [matchScoreRival, setMatchScoreRival] = useState(0);

    useEffect(() => {
        fetchData();
        fetch('/api/categories').then(res => res.json()).then(data => setAllCategories(data));
    }, [id]);

    const fetchData = async () => {
        try {
            const matchRes = await fetch(`/api/calendar`);
            const calData = await matchRes.json();
            const currentMatch = calData.find(m => m.id === parseInt(id));
            setMatch(currentMatch);
            if (currentMatch) {
                setMatchScoreOsos(currentMatch.score_osos || 0);
                setMatchScoreRival(currentMatch.score_rival || 0);
            }

            if (currentMatch) {
                const playersRes = await fetch(`/api/players/category/${currentMatch.category_id}`);
                setPlayers(await playersRes.json());
                
                const statsRes = await fetch(`/api/stats/match/${id}`);
                const statsData = await statsRes.json();
                const statsMap = {};
                statsData.forEach(s => {
                    statsMap[s.player_id] = {
                        ...s,
                        is_mvp: s.is_mvp === 1
                    };
                });
                setStats(statsMap);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const updateMatchCategory = async (newCatId) => {
        setIsUpdatingCategory(true);
        try {
            const res = await fetch(`/api/calendar/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category_id: newCatId })
            });
            if (res.ok) {
                await fetchData();
                alert('Categoría de partido actualizada');
            }
        } catch (e) { console.error(e); }
        finally { setIsUpdatingCategory(false); }
    };

    const saveMatchScore = async () => {
        try {
            const res = await fetch(`/api/calendar/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score_osos: matchScoreOsos, score_rival: matchScoreRival })
            });
            if (res.ok) {
                alert('Marcador Oficial Guardado Exitosamente');
            }
        } catch (e) { console.error(e); }
    };

    const handleStatChange = (playerId, field, value) => {
        setStats(prev => ({
            ...prev,
            [playerId]: {
                ...prev[playerId],
                [field]: field === 'is_mvp' ? value : (parseInt(value) || 0)
            }
        }));
    };

    const saveStats = async (playerId) => {
        const playerStats = stats[playerId] || {};
        try {
            const res = await fetch('/api/stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    player_id: playerId,
                    event_id: id,
                    yards_passing: playerStats.yards_passing || 0,
                    yards_rushing: playerStats.yards_rushing || 0,
                    yards_receiving: playerStats.yards_receiving || 0,
                    touchdowns: playerStats.touchdowns || 0,
                    tackles: playerStats.tackles || 0,
                    interceptions: playerStats.interceptions || 0,
                    sacks: playerStats.sacks || 0,
                    points_extra: playerStats.points_extra || 0,
                    is_mvp: playerStats.is_mvp
                })
            });
            if (res.ok) {
                const btn = document.getElementById(`btn-${playerId}`);
                if(btn) {
                    const originalText = btn.innerText;
                    btn.innerText = '✅ OK';
                    btn.classList.replace('bg-red-600', 'bg-green-600');
                    setTimeout(() => {
                        btn.innerText = originalText;
                        btn.classList.replace('bg-green-600', 'bg-red-600');
                    }, 2000);
                }
            } else {
                const errorData = await res.json();
                alert(`Error al guardar: ${errorData.error || errorData.message}\nSQL: ${errorData.sqlMessage || 'N/A'}`);
            }
        } catch (err) { 
            console.error(err);
            alert('Error crítico de conexión al servidor');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-red-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen pb-20 selection:bg-red-600 transition-colors duration-300" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
            <header className="fixed top-0 left-0 w-full backdrop-blur-xl border-b z-50 transition-colors" style={{ backgroundColor: 'var(--nav-bg)', borderColor: 'var(--border-main)' }}>
                <div className="max-w-md mx-auto px-6 py-5 flex justify-between items-center">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors active:scale-90 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-dim)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="text-xs font-black uppercase tracking-[0.3em] italic">Captura de <span className="text-red-600">Stats</span></span>
                    <div className="w-10"></div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 pt-24 space-y-8 animate-fade-in">
                <section className="card p-7 shadow-2xl relative overflow-hidden group border-2" style={{ borderColor: 'var(--border-main)' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl rounded-full"></div>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-red-600 tracking-widest italic leading-none mb-2">{match?.category_name || 'SIN CATEGORÍA'}</p>
                            <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none">{match?.title || 'PARTIDO'}</h2>
                        </div>
                        {players.length === 0 && (
                            <select 
                                disabled={isUpdatingCategory}
                                onChange={(e) => updateMatchCategory(e.target.value)}
                                className="bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1 text-[8px] font-black uppercase text-zinc-400 outline-none focus:border-red-600"
                            >
                                <option value="">Corregir Categoria</option>
                                {allCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        )}
                    </div>
                    
                    <div className="mt-6 flex flex-col gap-4">
                        <div className="flex justify-between items-center p-4 rounded-2xl border" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)' }}>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Osos</span>
                                <input type="number" value={matchScoreOsos} onChange={e => setMatchScoreOsos(parseInt(e.target.value)||0)} className="w-16 rounded-xl py-2 text-center text-xl font-display font-black outline-none focus:border-red-600 focus:text-red-500 transition-colors border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }} />
                            </div>
                            <span className="text-sm font-black italic opacity-20">VS</span>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40 truncate max-w-[80px] text-center">{match?.rival_name || 'RIVAL'}</span>
                                <input type="number" value={matchScoreRival} onChange={e => setMatchScoreRival(parseInt(e.target.value)||0)} className="w-16 rounded-xl py-2 text-center text-xl font-display font-black outline-none focus:border-red-600 focus:text-red-500 transition-colors border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }} />
                            </div>
                        </div>
                        <button onClick={saveMatchScore} className="w-full py-3 bg-red-600/10 border border-red-600/30 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
                            Guardar Marcador Oficial
                        </button>
                    </div>
                </section>

                <div className="space-y-4">
                    {players.length > 0 ? (
                        players.map(player => (
                            <div key={player.id} className="card p-6 shadow-xl space-y-6 border-2 transition-colors" style={{ borderColor: 'var(--border-main)' }}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-red-600 font-black text-lg italic shadow-inner border" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)' }}>
                                            #{player.jersey_number || '00'}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black italic uppercase leading-none tracking-tight" style={{ color: 'var(--text-main)' }}>{player.name}</h4>
                                            <p className="text-[9px] font-black uppercase tracking-widest mt-1" style={{ color: 'var(--text-dim)' }}>{player.position_name || 'JUGADOR'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => handleStatChange(player.id, 'is_mvp', !stats[player.id]?.is_mvp)}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${stats[player.id]?.is_mvp ? 'bg-amber-500 text-black scale-110 shadow-lg shadow-amber-900/40' : 'text-zinc-600 border'}`}
                                            style={{ backgroundColor: stats[player.id]?.is_mvp ? '' : 'var(--bg-main)', borderColor: 'var(--border-main)' }}
                                            title="MVP del Partido"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>
                                        </button>
                                        <button 
                                            id={`btn-${player.id}`}
                                            onClick={() => saveStats(player.id)} 
                                            className="bg-red-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-900/20 active:scale-95 transition-all"
                                        >
                                            Guardar
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3 p-4 rounded-2xl border" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)' }}>
                                         <span className="block text-[8px] font-black uppercase tracking-widest text-center border-b pb-2 mb-2" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-main)' }}>Ataque (Yardas)</span>
                                         <div className="grid grid-cols-3 gap-2">
                                            <div className="text-center">
                                                <p className="text-[7px] font-bold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Pass</p>
                                                <input type="number" value={stats[player.id]?.yards_passing || 0} onChange={e => handleStatChange(player.id, 'yards_passing', e.target.value)} className="w-full rounded-lg py-2 text-center text-xs font-black outline-none focus:ring-1 ring-red-600 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[7px] font-bold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Rush</p>
                                                <input type="number" value={stats[player.id]?.yards_rushing || 0} onChange={e => handleStatChange(player.id, 'yards_rushing', e.target.value)} className="w-full rounded-lg py-2 text-center text-xs font-black outline-none focus:ring-1 ring-red-600 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[7px] font-bold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Rec</p>
                                                <input type="number" value={stats[player.id]?.yards_receiving || 0} onChange={e => handleStatChange(player.id, 'yards_receiving', e.target.value)} className="w-full rounded-lg py-2 text-center text-xs font-black outline-none focus:ring-1 ring-red-600 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }} />
                                            </div>
                                         </div>
                                    </div>

                                    <div className="space-y-3 p-4 rounded-2xl border" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)' }}>
                                         <span className="block text-[8px] font-black uppercase tracking-widest text-center border-b pb-2 mb-2" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-main)' }}>Defensa y Otros</span>
                                         <div className="grid grid-cols-2 gap-2">
                                            <div className="text-center">
                                                <p className="text-[7px] font-bold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>TDs</p>
                                                <input type="number" value={stats[player.id]?.touchdowns || 0} onChange={e => handleStatChange(player.id, 'touchdowns', e.target.value)} className="w-full border border-red-600/30 rounded-lg py-2 text-center text-xs font-black text-red-600 outline-none" style={{ backgroundColor: 'var(--bg-card)' }} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[7px] font-bold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>TCK</p>
                                                <input type="number" value={stats[player.id]?.tackles || 0} onChange={e => handleStatChange(player.id, 'tackles', e.target.value)} className="w-full rounded-lg py-2 text-center text-xs font-black outline-none focus:ring-1 ring-red-600 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[7px] font-bold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>INT</p>
                                                <input type="number" value={stats[player.id]?.interceptions || 0} onChange={e => handleStatChange(player.id, 'interceptions', e.target.value)} className="w-full rounded-lg py-2 text-center text-xs font-black outline-none focus:ring-1 ring-red-600 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[7px] font-bold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Ext</p>
                                                <input type="number" value={stats[player.id]?.points_extra || 0} onChange={e => handleStatChange(player.id, 'points_extra', e.target.value)} className="w-full rounded-lg py-2 text-center text-xs font-black outline-none focus:ring-1 ring-red-600 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }} />
                                            </div>
                                         </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="card border-dashed rounded-[2.2rem] p-12 text-center space-y-4 border-2" style={{ borderColor: 'var(--border-main)' }}>
                            <p className="text-sm font-black uppercase tracking-widest italic" style={{ color: 'var(--text-dim)' }}>No hay jugadores en esta categoría</p>
                            <p className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>Verifica si el partido tiene asignada la categoría correcta.</p>
                            <button onClick={() => navigate('/admin/players/add')} className="text-red-600 text-[10px] font-black uppercase underline tracking-widest">Ir a Alta de Jugador</button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminStats;
