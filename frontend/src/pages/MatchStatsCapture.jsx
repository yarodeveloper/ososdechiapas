import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const MatchStatsCapture = () => {
    const { matchId } = useParams();
    const navigate = useNavigate();
    
    const [match, setMatch] = useState(null);
    const [players, setPlayers] = useState([]);
    const [stats, setStats] = useState({}); // { playerId: { touchdowns: 0, ... } }
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                // 1. Get Match Info
                const mRes = await fetch(`/api/matches/${matchId}`);
                if (!mRes.ok) throw new Error('Match not found');
                const mData = await mRes.json();
                setMatch(mData);

                // 2. Get Roster for that category
                const pRes = await fetch(`/api/players/category/${mData.category_id}`);
                const pData = await pRes.json();
                
                // 3. Get Existing stats if any
                const perfRes = await fetch(`/api/stats/match/${matchId}/performances`);
                const perfData = await perfRes.json();
                const perfMap = {};
                perfData.forEach(p => {
                    perfMap[p.player_id] = p;
                });

                // 4. Filter: Only show active players OR players who already have stats for this match
                const filteredPlayers = pData.filter(p => (p.status || 'active') === 'active' || perfMap[p.id]);
                setPlayers(filteredPlayers);

                // 5. Initialize stats map with existing data or zeros
                const initialStats = {};
                filteredPlayers.forEach(p => {
                    if (perfMap[p.id]) {
                        initialStats[p.id] = {
                            ...perfMap[p.id],
                            is_mvp: !!perfMap[p.id].is_mvp // force boolean
                        };
                    } else {
                        initialStats[p.id] = {
                            player_id: p.id,
                            touchdowns: 0,
                            yards_rushing: 0,
                            yards_passing: 0,
                            yards_receiving: 0,
                            tackles: 0,
                            interceptions: 0,
                            is_mvp: false
                        };
                    }
                });
                setStats(initialStats);

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [matchId]);

    const handleStatChange = (playerId, field, value) => {
        setStats(prev => ({
            ...prev,
            [playerId]: {
                ...prev[playerId],
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/stats/match/${matchId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ performances: Object.values(stats) })
            });
            if (res.ok) {
                alert('Estadísticas guardadas con éxito');
                navigate('/admin/dashboard');
            } else {
                const err = await res.json();
                alert('Error al guardar: ' + err.message);
            }
        } catch (error) {
            console.error(error);
            alert('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="bg-black min-h-screen flex flex-col items-center justify-center text-white">
            <div className="w-12 h-12 border-t-2 border-red-600 rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Sincronizando Roster...</p>
        </div>
    );

    return (
        <div className="bg-black text-white min-h-screen pb-32">
            <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-900 px-6 py-4">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-zinc-900 rounded-full">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <div className="text-center">
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Planilla Digital</p>
                        <h1 className="text-sm font-black uppercase italic">VS {match?.opponent || match?.visitor_name || 'Rival'}</h1>
                    </div>
                    <button 
                        onClick={handleSave} 
                        disabled={saving || players.length === 0}
                        className="text-xs font-black uppercase tracking-widest text-red-600 disabled:opacity-50"
                    >
                        {saving ? '...' : 'Save'}
                    </button>
                </div>
            </header>

            <main className="max-w-md mx-auto px-5 pt-8">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1.5 h-6 bg-red-600"></div>
                        <h2 className="text-2xl font-display font-black uppercase italic tracking-tighter">Registro de Desempeño</h2>
                    </div>
                    <p className="text-zinc-500 text-xs">Ingresa las estadísticas clave para cada jugador del roster.</p>
                </div>

                <div className="space-y-6">
                    {players.map(player => (
                        <div key={player.id} className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5">
                            <div className="flex items-center gap-4 mb-5 pb-4 border-b border-zinc-900/50">
                                <div className="w-12 h-12 rounded-xl bg-zinc-900 overflow-hidden flex-shrink-0">
                                    {player.photo_url ? (
                                        <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-700 font-bold">{player.name[0]}</div>
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-black text-sm uppercase tracking-wide truncate">{player.name}</h3>
                                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">#{player.jersey_number || '00'} • {player.position_name || 'JDR'}</p>
                                </div>
                                <button 
                                    onClick={() => handleStatChange(player.id, 'is_mvp', !stats[player.id]?.is_mvp)}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${stats[player.id]?.is_mvp ? 'bg-red-600 text-white' : 'bg-zinc-900 text-zinc-700 border border-zinc-800'}`}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill={stats[player.id]?.is_mvp ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Touchdowns</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm font-black outline-none focus:border-red-600 transition-colors"
                                        value={stats[player.id]?.touchdowns || 0}
                                        onChange={(e) => handleStatChange(player.id, 'touchdowns', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Yardas Totales</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm font-black outline-none focus:border-red-600 transition-colors"
                                        value={stats[player.id]?.yards_rushing || 0}
                                        onChange={(e) => handleStatChange(player.id, 'yards_rushing', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Tackles</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm font-black outline-none focus:border-red-600 transition-colors"
                                        value={stats[player.id]?.tackles || 0}
                                        onChange={(e) => handleStatChange(player.id, 'tackles', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Intercepciones</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm font-black outline-none focus:border-red-600 transition-colors"
                                        value={stats[player.id]?.interceptions || 0}
                                        onChange={(e) => handleStatChange(player.id, 'interceptions', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    {players.length === 0 && (
                        <div className="text-center py-20 bg-zinc-950 border border-dashed border-zinc-900 rounded-[2.5rem]">
                            <p className="text-zinc-600 font-black uppercase text-[10px] tracking-[0.2em] mb-4">No hay jugadores en esta categoría</p>
                            <Link to="/players/new" className="text-red-600 font-bold text-xs uppercase tracking-widest underline underline-offset-4">
                                Ir a Alta de Jugador
                            </Link>
                        </div>
                    )}
                </div>

                <div className="mt-12">
                    <button 
                        onClick={handleSave}
                        disabled={saving || players.length === 0}
                        className="w-full bg-red-600 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-red-900/40 active:scale-95 transition-all"
                    >
                        {saving ? 'Procesando...' : 'Finalizar Estadísticas'}
                    </button>
                    <p className="text-center text-[10px] text-zinc-600 uppercase font-bold mt-4 tracking-widest">Al finalizar, los totales se reflejarán en las Player Cards.</p>
                </div>
            </main>
        </div>
    );
};

export default MatchStatsCapture;
