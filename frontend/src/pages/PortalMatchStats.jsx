import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PortalMatchStats = () => {
    const { id: matchId } = useParams();
    const navigate = useNavigate();
    const [matchData, setMatchData] = useState(null);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch match details
                const resMatch = await fetch(`/api/matches/details/${matchId}`);
                const matchInfo = await resMatch.json();
                setMatchData(matchInfo);

                // Fetch match stats
                const resStats = await fetch(`/api/stats/match/${matchId}`);
                const statsData = await resStats.json();
                if (Array.isArray(statsData)) {
                    setStats(statsData);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [matchId]);

    if (loading) return <div className="min-h-screen flex items-center justify-center italic" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>Sincronizando Estadísticas...</div>;
    if (!matchData) return <div className="min-h-screen flex items-center justify-center italic" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>Partido no encontrado</div>;

    // Derived stats
    const mvpPlayer = stats.find(s => s.is_mvp === 1);
    
    // Ofensiva: Ordenado por Yardas Totales, luego Touchdowns
    const offensiveLeaders = [...stats]
        .filter(s => (s.yards_passing + s.yards_rushing + s.yards_receiving) > 0 || (s.touchdowns > 0))
        .sort((a, b) => {
            const ydsA = (a.yards_passing + a.yards_rushing + a.yards_receiving);
            const ydsB = (b.yards_passing + b.yards_rushing + b.yards_receiving);
            if (ydsB !== ydsA) return ydsB - ydsA;
            return b.touchdowns - a.touchdowns;
        })
        .slice(0, 5);

    // Defensiva: Ordenado por Tackleos, luego INTs, luego Sacks
    const defensiveLeaders = [...stats]
        .filter(s => s.tackles > 0 || s.interceptions > 0 || s.sacks > 0)
        .sort((a, b) => {
            if (b.tackles !== a.tackles) return b.tackles - a.tackles;
            if (b.interceptions !== a.interceptions) return b.interceptions - a.interceptions;
            return b.sacks - a.sacks;
        })
        .slice(0, 5);

    return (
        <div className="min-h-screen font-outfit pb-32 overflow-x-hidden uppercase transition-colors duration-300" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
            
            {/* 1. Header */}
            <header className="fixed top-0 left-0 w-full backdrop-blur-xl border-b z-50 transition-colors" style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-main)' }}>
                <div className="max-w-md mx-auto px-6 h-18 flex items-center justify-between py-6">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-90" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-dim)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                    <h1 className="text-xs font-black uppercase tracking-[0.3em] italic" style={{ color: 'var(--text-dim)' }}>Score<span className="text-red-600">board</span></h1>
                    <div className="w-10"></div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 pt-28 space-y-8">
                
                {/* 2. Scoreboard Principal */}
                <section className="rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border animate-slide-up" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                    <div className="absolute top-0 right-0 p-4 opacity-5"><svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/></svg></div>
                    
                    <div className="flex justify-between items-center relative z-10 mb-6">
                        <div className="flex flex-col items-center gap-3 flex-1 text-center">
                            <img src="/logo_osos.webp" alt="Osos" className="w-16 h-16 object-contain filter drop-shadow-lg" />
                            <span className="text-[10px] font-black tracking-widest" style={{ color: 'var(--text-main)' }}>OSOS</span>
                        </div>
                        
                        <div className="flex items-center gap-5 px-6 py-4 rounded-3xl border shadow-inner" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)' }}>
                            <span className={`text-4xl font-black italic tracking-tighter ${matchData.home_score > matchData.away_score ? 'text-red-600' : ''}`} style={matchData.home_score <= matchData.away_score ? { color: 'var(--text-main)' } : {}}>{matchData.home_score ?? 0}</span>
                            <span className="text-xs font-black italic opacity-20" style={{ color: 'var(--text-dim)' }}>VS</span>
                            <span className={`text-4xl font-black italic tracking-tighter ${matchData.away_score > matchData.home_score ? 'text-amber-500' : 'opacity-60'}`} style={matchData.away_score <= matchData.home_score ? { color: 'var(--text-dim)' } : {}}>{matchData.away_score ?? 0}</span>
                        </div>

                        <div className="flex flex-col items-center gap-3 flex-1 text-center">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 p-2 overflow-hidden shadow-lg" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)' }}>
                                {matchData.rival_logo ? <img src={matchData.rival_logo} className="w-full h-full object-contain" /> : <div className="text-2xl font-black opacity-20" style={{ color: 'var(--text-dim)' }}>{matchData.rival_name?.[0] || 'R'}</div>}
                            </div>
                            <span className="text-[10px] font-black tracking-widest truncate w-full" style={{ color: 'var(--text-dim)' }}>{matchData.rival_name || 'RIVAL'}</span>
                        </div>
                    </div>
                    <div className="pt-4 border-t text-center" style={{ borderColor: 'var(--border-main)' }}>
                        <p className="text-[9px] font-black tracking-[0.2em] uppercase italic opacity-60" style={{ color: 'var(--text-dim)' }}>
                            {new Date(matchData.start_time || new Date()).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                </section>

                {/* 3. MVP del Partido */}
                {mvpPlayer && (
                    <section className="animate-fade">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-xl">🏆</span>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] italic" style={{ color: 'var(--text-main)' }}>MVP del Partido</h3>
                        </div>
                        <div className="rounded-[2rem] p-6 shadow-xl border relative overflow-hidden group cursor-pointer" onClick={() => navigate(`/portal/player/${mvpPlayer.player_id}/playcard`)} style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[40px] -translate-y-10 translate-x-10"></div>
                            <div className="flex items-center gap-5 relative z-10">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-amber-600 to-amber-300 shadow-xl border-2 border-transparent group-hover:border-white transition-all overflow-hidden text-black font-display font-black text-2xl">
                                    {mvpPlayer.player_number || '#'}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-black italic tracking-tighter" style={{ color: 'var(--text-main)' }}>{mvpPlayer.player_name}</h4>
                                    <p className="text-[9px] font-bold tracking-widest uppercase mt-1 text-amber-500">
                                        Jugador Más Valioso
                                    </p>
                                </div>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-40" style={{ color: 'var(--text-dim)' }}><path d="M9 18l6-6-6-6"/></svg>
                            </div>
                        </div>
                    </section>
                )}

                {/* 4. Líderes Ofensivos */}
                {offensiveLeaders.length > 0 && (
                    <section className="animate-fade" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-6 h-6 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-500">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                            </div>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] italic" style={{ color: 'var(--text-main)' }}>Líderes Ofensivos</h3>
                        </div>
                        <div className="rounded-[2rem] border overflow-hidden shadow-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                            {offensiveLeaders.map((player, index) => {
                                const totalYards = player.yards_passing + player.yards_rushing + player.yards_receiving;
                                return (
                                    <div key={player.id} className={`flex items-center justify-between p-5 ${index !== offensiveLeaders.length - 1 ? 'border-b' : ''} cursor-pointer hover:bg-black/20 transition-colors`} style={{ borderColor: 'var(--border-main)' }} onClick={() => navigate(`/portal/player/${player.player_id}/playcard`)}>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-black w-4 text-center opacity-40" style={{ color: 'var(--text-dim)' }}>{index + 1}</span>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black tracking-tight" style={{ color: 'var(--text-main)' }}>{player.player_name}</span>
                                                <span className="text-[8px] font-bold tracking-widest uppercase opacity-60" style={{ color: 'var(--text-dim)' }}>#{player.player_number}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-black italic text-blue-500 leading-none">{totalYards}</span>
                                                <span className="text-[7px] font-black uppercase tracking-widest opacity-60" style={{ color: 'var(--text-dim)' }}>YDS TOT</span>
                                            </div>
                                            {player.touchdowns > 0 && (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-black italic text-green-500 leading-none">{player.touchdowns}</span>
                                                    <span className="text-[7px] font-black uppercase tracking-widest opacity-60" style={{ color: 'var(--text-dim)' }}>TDS</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* 5. Líderes Defensivos */}
                {defensiveLeaders.length > 0 && (
                    <section className="animate-fade" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-6 h-6 rounded-lg bg-red-600/20 flex items-center justify-center text-red-600">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            </div>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] italic" style={{ color: 'var(--text-main)' }}>Líderes Defensivos</h3>
                        </div>
                        <div className="rounded-[2rem] border overflow-hidden shadow-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                            {defensiveLeaders.map((player, index) => (
                                <div key={player.id} className={`flex items-center justify-between p-5 ${index !== defensiveLeaders.length - 1 ? 'border-b' : ''} cursor-pointer hover:bg-black/20 transition-colors`} style={{ borderColor: 'var(--border-main)' }} onClick={() => navigate(`/portal/player/${player.player_id}/playcard`)}>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black w-4 text-center opacity-40" style={{ color: 'var(--text-dim)' }}>{index + 1}</span>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black tracking-tight" style={{ color: 'var(--text-main)' }}>{player.player_name}</span>
                                            <span className="text-[8px] font-bold tracking-widest uppercase opacity-60" style={{ color: 'var(--text-dim)' }}>#{player.player_number}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-black italic text-red-500 leading-none">{player.tackles}</span>
                                            <span className="text-[7px] font-black uppercase tracking-widest opacity-60" style={{ color: 'var(--text-dim)' }}>TCK</span>
                                        </div>
                                        {player.sacks > 0 && (
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-black italic text-amber-500 leading-none">{player.sacks}</span>
                                                <span className="text-[7px] font-black uppercase tracking-widest opacity-60" style={{ color: 'var(--text-dim)' }}>SCK</span>
                                            </div>
                                        )}
                                        {player.interceptions > 0 && (
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-black italic text-purple-500 leading-none">{player.interceptions}</span>
                                                <span className="text-[7px] font-black uppercase tracking-widest opacity-60" style={{ color: 'var(--text-dim)' }}>INT</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {stats.length === 0 && (
                    <div className="text-center py-20 opacity-30 italic font-black tracking-widest text-xs" style={{ color: 'var(--text-dim)' }}>
                        Estadísticas aún no capturadas para este partido
                    </div>
                )}

            </main>
        </div>
    );
};

export default PortalMatchStats;
