import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StatsCenter = () => {
    const navigate = useNavigate();
    const [leagues, setLeagues] = useState([]);
    const [selectedLeague, setSelectedLeague] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [sortBy, setSortBy] = useState('touchdowns'); // touchdowns, yards, tackles
    const [leaderboard, setLeaderboard] = useState([]);
    const [globalMvps, setGlobalMvps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCatalogs = async () => {
             setLoading(true);
             try {
                const res = await fetch('/api/stats/catalogs');
                const data = await res.json();
                setLeagues(data);
                if (data.length > 0) {
                    setSelectedLeague(data[0]);
                    if (data[0].categories.length > 0) {
                        setSelectedCategory(data[0].categories[0]);
                    }
                }
             } catch(e) { console.error(e); }
             finally { setLoading(false); }
        };
        loadCatalogs();
        fetch('/api/stats/leaderboard/global/mvps').then(res => res.json()).then(data => setGlobalMvps(data)).catch(()=>{});
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            setLoading(true);
            fetch(`/api/stats/leaderboard/${selectedCategory.id}?sortBy=${sortBy}`)
                .then(res => res.json())
                .then(data => setLeaderboard(data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [selectedCategory, sortBy]);

    const handleLeagueChange = (league) => {
        setSelectedLeague(league);
        if (league.categories.length > 0) {
            setSelectedCategory(league.categories[0]);
        } else {
            setSelectedCategory(null);
        }
    };

    return (
        <div className="min-h-screen pb-20 selection:bg-red-600 selection:text-white transition-colors duration-300" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
            {/* Header Sticky */}
            <header className="sticky top-0 z-50 backdrop-blur-md border-b px-6 py-4 transition-colors" style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-main)' }}>
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <button onClick={() => navigate('/')} className="w-10 h-10 flex items-center justify-center rounded-full active:scale-95 transition-transform" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-dim)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <h1 className="font-display font-black text-lg uppercase italic tracking-tighter">Estadísticas</h1>
                    <div className="w-10 h-10"></div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 pt-8 animate-fade pb-32">
                
                {/* MVP Spotlight (Wall of Fame) */}
                <section className="mb-12">
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-dim)' }}>Spotlight: MVP's {leaderboard.filter(p => p.mvp_count > 0).length === 0 && 'Globales'}</h3>
                      <div className="flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-red-600"></div>
                        <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
                      </div>
                   </div>
                   <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6">
                      {(leaderboard.filter(p => p.mvp_count > 0).length > 0 ? leaderboard.filter(p => p.mvp_count > 0) : globalMvps).slice(0, 5).map(p => (
                         <div key={p.id} onClick={() => navigate(`/players/${p.id}`)} className="min-w-[120px] flex flex-col items-center gap-3 cursor-pointer active:scale-95 transition-transform">
                            <div className="relative">
                               <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-amber-600 to-amber-300 shadow-[0_0_20px_rgba(217,119,6,0.3)]">
                                  <div className="w-full h-full rounded-full overflow-hidden border-2" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--bg-main)' }}>
                                       {p.photo_url ? (
                                         <img src={p.photo_url} className="w-full h-full object-cover" />
                                       ) : (
                                         <div className="w-full h-full flex items-center justify-center font-display font-black text-xl text-amber-500">{p.name[0]}</div>
                                       )}
                                  </div>
                               </div>
                               <div className="absolute -top-1 -right-1 bg-amber-500 text-black text-[7px] font-black px-1.5 py-0.5 rounded shadow-lg border border-amber-400">MVP x{p.mvp_count}</div>
                            </div>
                            <div className="text-center">
                                <span className="text-[10px] font-black uppercase tracking-tight text-amber-500 block leading-none">{p.name.split(' ')[0]}</span>
                                {leaderboard.filter(p => p.mvp_count > 0).length === 0 && <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>{p.category_name}</span>}
                            </div>
                         </div>
                      ))}
                      {(leaderboard.filter(p => p.mvp_count > 0).length === 0 && globalMvps.length === 0) && (
                        <div className="w-full py-8 border border-dashed rounded-3xl flex flex-col items-center justify-center opacity-40" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                             <span className="text-[8px] font-black uppercase tracking-widest mt-2">Próximos MVP's aquí</span>
                        </div>
                      )}
                   </div>
                </section>

                {/* League Selector */}
                <div className="mb-8">
                    <span className="text-[10px] font-black uppercase tracking-widest block mb-4" style={{ color: 'var(--text-dim)' }}>Seleccionar Liga</span>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                        {leagues.map(league => (
                            <button
                                key={league.id}
                                onClick={() => handleLeagueChange(league)}
                                className={`px-6 py-3 rounded-2xl whitespace-nowrap font-display text-xs uppercase tracking-widest transition-all border ${
                                    selectedLeague?.id === league.id 
                                    ? 'bg-red-600 border-red-500 shadow-lg shadow-red-900/40 text-white' 
                                    : ''
                                }`}
                                style={{ 
                                    backgroundColor: selectedLeague?.id === league.id ? '' : 'var(--bg-card)',
                                    borderColor: selectedLeague?.id === league.id ? '' : 'var(--border-main)',
                                    color: selectedLeague?.id === league.id ? '' : 'var(--text-dim)'
                                }}
                            >
                                {league.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category Selector */}
                {selectedLeague && (
                    <div className="mb-10">
                        <span className="text-[10px] font-black uppercase tracking-widest block mb-4" style={{ color: 'var(--text-dim)' }}>Categoría</span>
                        <div className="flex flex-wrap gap-2">
                            {selectedLeague.categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-tight transition-all border ${
                                        selectedCategory?.id === cat.id 
                                        ? 'bg-red-600 text-white' 
                                        : ''
                                    }`}
                                    style={{ 
                                        backgroundColor: selectedCategory?.id === cat.id ? '' : 'var(--bg-card)',
                                        color: selectedCategory?.id === cat.id ? '' : 'var(--text-dim)',
                                        borderColor: selectedCategory?.id === cat.id ? '' : 'var(--border-main)'
                                    }}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Metric Selector (Sort By) */}
                <div className="flex gap-2 mb-8 p-1.5 rounded-2xl border transition-colors" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                    {[
                        { id: 'touchdowns', label: 'TDs', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
                        { id: 'yards', label: 'Yardas', icon: 'M12 2L4 5v11l8 3 8-3V5l-8-3z' },
                        { id: 'tackles', label: 'Tackles', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2' }
                    ].map(metric => (
                        <button
                            key={metric.id}
                            onClick={() => setSortBy(metric.id)}
                            className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${
                                sortBy === metric.id 
                                ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' 
                                : ''
                            }`}
                            style={{ color: sortBy === metric.id ? '' : 'var(--text-dim)' }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d={metric.icon}/></svg>
                            <span className="text-[9px] font-black uppercase tracking-widest">{metric.label}</span>
                        </button>
                    ))}
                </div>

                {/* Leaderboard Section */}
                <section>
                    <div className="flex justify-between items-end mb-6">
                        <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter">Top Players</h2>
                        <img src="/icons/award-svgrepo-com.svg" className="w-6 h-6 opacity-40" alt="Award" style={{ filter: 'var(--icon-filter)' }} />
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 animate-pulse rounded-3xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}></div>
                            ))}
                        </div>
                    ) : leaderboard.length > 0 ? (
                        <div className="space-y-4">
                            {leaderboard.map((player, index) => (
                                <div 
                                    key={player.id} 
                                    onClick={() => navigate(`/players/${player.id}`)}
                                    className="relative group active:scale-[0.98] transition-all cursor-pointer"
                                >
                                    <div className="card backdrop-blur-md border rounded-[2rem] p-4 flex items-center gap-4 overflow-hidden" style={{ borderColor: 'var(--border-main)' }}>
                                        {/* Rank */}
                                        <div className="absolute top-0 right-0 p-4 opacity-10 font-display font-black text-5xl italic" style={{ color: 'var(--text-dim)' }}>
                                            #{index + 1}
                                        </div>

                                        {/* Player Photo */}
                                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden border flex-shrink-0" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)' }}>
                                            {player.photo_url ? (
                                                <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-display text-xl" style={{ color: 'var(--text-dim)' }}>
                                                    {player.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-grow">
                                            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-0.5">{player.position || 'PLAYER'}</p>
                                            <h3 className="font-display font-black text-lg leading-none mb-1 group-active:text-red-500 transition-colors uppercase italic truncate max-w-[150px]">
                                                {player.name}
                                            </h3>
                                            <div className="flex gap-3 mt-2 items-center">
                                                {sortBy === 'touchdowns' && (
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black text-red-500 uppercase tracking-widest leading-none mb-1">Touchdowns</span>
                                                        <span className="text-xl leading-none font-display font-black">{player.total_touchdowns || 0}</span>
                                                        <div className="flex gap-1.5 mt-1 text-[7px] font-black text-zinc-500 uppercase tracking-tighter">
                                                            <span>OF: {player.total_td_offense || 0}</span>
                                                            <span className="text-zinc-800">|</span>
                                                            <span>DF: {player.total_td_defense || 0}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {sortBy === 'yards' && (
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Yardas Tot.</span>
                                                        <span className="text-xl leading-none font-display font-black">{player.total_yards || 0}</span>
                                                    </div>
                                                )}
                                                {sortBy === 'tackles' && (
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Tackles</span>
                                                        <span className="text-xl leading-none font-display font-black">{player.total_tackles || 0}</span>
                                                    </div>
                                                )}
                                                
                                                <div className="h-6 w-px mt-1" style={{ backgroundColor: 'var(--border-main)' }}></div>
                                                
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>{sortBy === 'touchdowns' ? 'Yardas' : 'TDs'}</span>
                                                    <span className="text-xs font-display font-black" style={{ color: 'var(--text-dim)' }}>{sortBy === 'touchdowns' ? (player.total_yards || 0) : (player.total_touchdowns || 0)}</span>
                                                </div>
                                                {(sortBy === 'touchdowns' || sortBy === 'yards') && (
                                                    <>
                                                        <div className="h-4 w-px mt-1" style={{ backgroundColor: 'var(--border-main)' }}></div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>Tck</span>
                                                            <span className="text-xs font-display font-black" style={{ color: 'var(--text-dim)' }}>{player.total_tackles || 0}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* MVP Badge */}
                                        {player.mvp_count > 0 && (
                                            <div className="absolute top-2 left-2">
                                                <div className="bg-red-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg shadow-red-900/40 translate-x-[-10px] translate-y-[-10px] rotate-[-15deg] text-white">
                                                    MVP
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 border border-dashed rounded-3xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-dim)' }}>No hay estadísticas registradas <br/>para esta categoría aún.</p>
                        </div>
                    )}
                </section>
            </main>

            {/* Float Menu or Home Link */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                <button 
                   onClick={() => navigate('/')}
                   className="bg-red-600 text-white px-8 py-4 rounded-full font-display text-xs uppercase tracking-widest shadow-xl shadow-red-900/20 active:scale-90 transition-all flex items-center gap-3"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                    Volver al Inicio
                </button>
            </div>
        </div>
    );
};

export default StatsCenter;
