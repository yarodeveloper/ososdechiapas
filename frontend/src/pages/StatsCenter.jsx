import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const StatsCenter = () => {
    const navigate = useNavigate();
    const [leagues, setLeagues] = useState([]);
    const [selectedLeague, setSelectedLeague] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [sortBy, setSortBy] = useState('touchdowns');
    const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'detail'
    const [leaderboard, setLeaderboard] = useState([]);
    const [summaries, setSummaries] = useState({ touchdowns: [], yards: [], tackles: [] });
    const [globalMvps, setGlobalMvps] = useState([]);
    const [loading, setLoading] = useState(true);

    const mvpCarouselRef = useRef(null);
    const [activeMvpIndex, setActiveMvpIndex] = useState(0);

    const scrollToMvp = (index) => {
        if (!mvpCarouselRef.current) return;
        const container = mvpCarouselRef.current;
        const cardWidth = 164; // 140px width + 24px gap
        container.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
        setActiveMvpIndex(index);
    };

    const handleMvpScroll = (e) => {
        const cardWidth = 164;
        const index = Math.round(e.target.scrollLeft / cardWidth);
        setActiveMvpIndex(index);
    };

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
        fetch('/api/stats/leaderboard/global/mvps')
            .then(res => res.json())
            .then(data => {
                if(Array.isArray(data)) setGlobalMvps(data);
            })
            .catch(()=>{});
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            if (viewMode === 'detail') {
                setLoading(true);
                fetch(`/api/stats/leaderboard/${selectedCategory.id}?sortBy=${sortBy}`)
                    .then(res => res.json())
                    .then(data => setLeaderboard(data))
                    .catch(err => console.error(err))
                    .finally(() => setLoading(false));
            } else {
                // Fetch summaries for the 3 main metrics
                setLoading(true);
                Promise.all([
                    fetch(`/api/stats/leaderboard/${selectedCategory.id}?sortBy=touchdowns`).then(r => r.json()),
                    fetch(`/api/stats/leaderboard/${selectedCategory.id}?sortBy=yards`).then(r => r.json()),
                    fetch(`/api/stats/leaderboard/${selectedCategory.id}?sortBy=tackles`).then(r => r.json())
                ]).then(([tds, yds, tck]) => {
                    setSummaries({ touchdowns: tds.slice(0, 3), yards: yds.slice(0, 3), tackles: tck.slice(0, 3) });
                }).finally(() => setLoading(false));
            }
        }
    }, [selectedCategory, sortBy, viewMode]);

    const handleLeagueChange = (league) => {
        setSelectedLeague(league);
        if (league.categories.length > 0) {
            setSelectedCategory(league.categories[0]);
        } else {
            setSelectedCategory(null);
        }
    };

    const enterDetail = (metric) => {
        setSortBy(metric);
        setViewMode('detail');
    };

    return (
        <div className="min-h-screen pb-32" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
            <header className="sticky top-0 z-50 backdrop-blur-md border-b px-6 py-4" style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-main)' }}>
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <button onClick={() => viewMode === 'detail' ? setViewMode('summary') : navigate('/')} className="w-10 h-10 flex items-center justify-center rounded-xl border transition-all active:scale-90" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-dim)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <h1 className="font-display font-black text-lg uppercase italic tracking-tighter">Estadísticas <span className="text-red-600">Premium</span></h1>
                    <div className="w-10"></div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 pt-8 animate-fade">
                
                {viewMode === 'summary' && (
                    <>
                        {/* MVP Spotlight */}
                        <section className="mb-12">
                           <div className="flex items-center justify-between mb-6">
                              <h3 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-dim)' }}>Spotlight: MVP's Globales</h3>
                              {globalMvps.length > 1 && (
                                  <div className="flex gap-2">
                                      <button 
                                          onClick={() => scrollToMvp(activeMvpIndex - 1)} 
                                          disabled={activeMvpIndex === 0}
                                          className="w-6 h-6 rounded-full flex items-center justify-center border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800"
                                          style={{ borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                                      >
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                                      </button>
                                      <button 
                                          onClick={() => scrollToMvp(activeMvpIndex + 1)} 
                                          disabled={activeMvpIndex >= Math.min(globalMvps.length, 5) - 1}
                                          className="w-6 h-6 rounded-full flex items-center justify-center border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800"
                                          style={{ borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                                      >
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                                      </button>
                                  </div>
                              )}
                           </div>
                           <div 
                               ref={mvpCarouselRef}
                               onScroll={handleMvpScroll}
                               className="flex gap-6 overflow-x-auto no-scrollbar -mx-6 px-6 pb-4 snap-x smooth-scroll"
                           >
                              {globalMvps.slice(0, 5).map(p => (
                                 <div key={p.id} onClick={() => navigate(`/players/${p.id}`)} className="min-w-[140px] flex flex-col items-center gap-3 cursor-pointer group snap-center">
                                    <div className="relative">
                                       <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-amber-600 to-amber-300 shadow-xl group-hover:scale-105 transition-transform">
                                          <div className="w-full h-full rounded-full overflow-hidden border-2" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--bg-main)' }}>
                                               {p.photo_url ? (
                                                 <img src={p.photo_url} className="w-full h-full object-cover" />
                                               ) : (
                                                 <div className="w-full h-full flex items-center justify-center font-display font-black text-2xl text-amber-500">{p.name[0]}</div>
                                               )}
                                          </div>
                                       </div>
                                       <div className="absolute -top-1 -right-1 bg-amber-500 text-black text-[8px] font-black px-2 py-0.5 rounded shadow-lg border border-amber-400 rotate-12">★ x{p.mvp_count}</div>
                                    </div>
                                    <div className="text-center">
                                        <span className="text-xs font-black uppercase tracking-tight block leading-none" style={{ color: 'var(--text-main)' }}>{p.name.split(' ')[0]}</span>
                                        <span className="text-[8px] font-bold uppercase tracking-widest mt-1 block" style={{ color: 'var(--text-dim)' }}>{p.category_name}</span>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </section>

                        {/* Selectores */}
                        <div className="space-y-6 mb-10">
                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase tracking-widest block opacity-40" style={{ color: 'var(--text-dim)' }}>Liga</span>
                                <div className="flex gap-3 overflow-x-auto no-scrollbar">
                                    {leagues.map(league => (
                                        <button
                                            key={league.id}
                                            onClick={() => handleLeagueChange(league)}
                                            className={`px-6 py-3 rounded-2xl whitespace-nowrap font-display text-xs uppercase tracking-widest transition-all border ${
                                                selectedLeague?.id === league.id ? 'bg-red-600 border-red-500 text-white shadow-lg' : ''
                                            }`}
                                            style={{ backgroundColor: selectedLeague?.id === league.id ? '' : 'var(--bg-card)', borderColor: 'var(--border-main)', color: selectedLeague?.id === league.id ? '' : 'var(--text-dim)' }}
                                        >
                                            {league.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {selectedLeague && (
                                <div className="space-y-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest block opacity-40" style={{ color: 'var(--text-dim)' }}>Categoría</span>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedLeague.categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-tight transition-all border ${
                                                    selectedCategory?.id === cat.id 
                                                    ? 'bg-white text-black shadow-xl scale-105 z-10 border-white' 
                                                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 active:bg-zinc-700'
                                                }`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Summary Dashboard */}
                        <section className="space-y-12">
                            {[
                                { id: 'touchdowns', label: 'Líderes de Touchdowns', color: 'bg-red-600', list: summaries.touchdowns },
                                { id: 'yards', label: 'Líderes de Yardas', color: 'bg-amber-500', list: summaries.yards },
                                { id: 'tackles', label: 'Muro de Tackleos', color: 'bg-blue-600', list: summaries.tackles }
                            ].map(section => (
                                <div key={section.id} className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-1.5 h-6 ${section.color} rounded-full`}></div>
                                            <h3 className="text-xl font-display font-black uppercase italic tracking-tighter" style={{ color: 'var(--text-main)' }}>{section.label}</h3>
                                        </div>
                                        <button onClick={() => enterDetail(section.id)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-600 border-b border-red-600/30 pb-1 active:opacity-60 transition-opacity">
                                            Ver Todo
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M9 18l6-6-6-6"/></svg>
                                        </button>
                                    </div>

                                    {loading ? (
                                        <div className="h-40 bg-zinc-900/30 animate-pulse rounded-3xl"></div>
                                    ) : section.list.length > 0 ? (
                                        <div className="space-y-3">
                                            {section.list.map((p, i) => (
                                                <div key={p.id} onClick={() => navigate(`/players/${p.id}`)} className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-4 flex items-center gap-4 active:scale-95 transition-transform">
                                                    <span className="text-2xl font-display font-black italic opacity-20 w-8">#{i+1}</span>
                                                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-zinc-800 flex-shrink-0">
                                                        {p.photo_url ? <img src={p.photo_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-xs opacity-20">{p.name[0]}</div>}
                                                    </div>
                                                    <div className="flex-grow">
                                                        <span className="text-xs font-black uppercase italic truncate block max-w-[120px]" style={{ color: 'var(--text-main)' }}>{p.name}</span>
                                                        <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>{p.position_name || 'PLAYER'}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`text-lg font-black italic leading-none block ${i === 0 ? 'text-red-500' : ''}`} style={{ color: i === 0 ? '' : 'var(--text-main)' }}>
                                                            {section.id === 'touchdowns' ? p.total_touchdowns : section.id === 'yards' ? p.total_yards : p.total_tackles}
                                                        </span>
                                                        <span className="text-[7px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{section.id === 'touchdowns' ? 'TDS' : section.id === 'yards' ? 'YDS' : 'TCK'}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-10 text-center border border-dashed rounded-3xl opacity-20 text-[10px] uppercase font-black tracking-widest">Sin datos</div>
                                    )}
                                </div>
                            ))}
                        </section>
                    </>
                )}

                {viewMode === 'detail' && (
                    <div className="space-y-8 animate-fade">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter leading-none">
                                Top <span className="text-red-600">{sortBy.split('_').pop().toUpperCase()}</span>
                            </h2>
                            <button onClick={() => setViewMode('summary')} className="text-[10px] font-black uppercase tracking-widest opacity-40">Cerrar Detalle</button>
                        </div>

                        {/* Secondary Filter Tabs */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                            {[
                                { id: 'touchdowns', label: 'TDs' },
                                { id: 'yards', label: 'Yardas Totales' },
                                { id: 'yards_passing', label: 'Pase' },
                                { id: 'yards_rushing', label: 'Carrera' },
                                { id: 'yards_receiving', label: 'Recepción' },
                                { id: 'receptions', label: 'REC' },
                                { id: 'tackles', label: 'Tackles' },
                                { id: 'interceptions', label: 'INT' },
                                { id: 'sacks', label: 'SCK' }
                            ].map(m => (
                                    <button 
                                        key={m.id} 
                                        onClick={() => setSortBy(m.id)} 
                                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all border ${
                                            sortBy === m.id 
                                            ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-900/40' 
                                            : ''
                                        }`}
                                        style={{ 
                                            backgroundColor: sortBy === m.id ? '' : 'var(--bg-card)', 
                                            borderColor: sortBy === m.id ? '' : 'var(--border-main)',
                                            color: sortBy === m.id ? 'white' : 'var(--text-main)'
                                        }}
                                    >
                                        {m.label}
                                    </button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-24 animate-pulse rounded-3xl bg-zinc-900/50"></div>)}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {leaderboard.map((p, index) => (
                                    <div key={p.id} onClick={() => navigate(`/players/${p.id}`)} className="card p-5 flex items-center gap-5 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 font-display font-black text-6xl italic" style={{ color: 'var(--text-main)' }}>#{index + 1}</div>
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 flex-shrink-0" style={{ borderColor: 'var(--border-main)' }}>
                                            {p.photo_url ? <img src={p.photo_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-display text-2xl opacity-20">{p.name[0]}</div>}
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-display font-black text-lg uppercase italic leading-none mb-1" style={{ color: 'var(--text-main)' }}>{p.name}</h4>
                                            <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>{p.position_name || 'JUGADOR'}</p>
                                            
                                            <div className="flex gap-4 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-main)' }}>
                                                <div className="flex flex-col">
                                                    <span className="text-[7px] font-black uppercase tracking-tighter" style={{ color: 'var(--text-muted)' }}>Valor Líder</span>
                                                    <span className="text-xl font-black italic text-red-600 leading-none">
                                                        {sortBy === 'touchdowns' ? p.total_touchdowns : 
                                                         sortBy === 'yards' ? p.total_yards : 
                                                         sortBy === 'yards_passing' ? p.total_passing : 
                                                         sortBy === 'yards_rushing' ? p.total_rushing : 
                                                         sortBy === 'yards_receiving' ? p.total_receiving : 
                                                         sortBy === 'receptions' ? p.total_receptions : 
                                                         p[`total_${sortBy}`] || 0}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[7px] font-black uppercase tracking-tighter" style={{ color: 'var(--text-muted)' }}>Total TDS</span>
                                                    <span className="text-sm font-black italic leading-none" style={{ color: 'var(--text-main)' }}>{p.total_touchdowns}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[7px] font-black uppercase tracking-tighter" style={{ color: 'var(--text-muted)' }}>Total Yardas</span>
                                                    <span className="text-sm font-black italic leading-none" style={{ color: 'var(--text-main)' }}>{p.total_yards}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default StatsCenter;
