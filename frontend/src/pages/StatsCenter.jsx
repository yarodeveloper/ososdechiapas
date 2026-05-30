import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler);

const StatsCenter = () => {
    const navigate = useNavigate();
    const [leagues, setLeagues] = useState([]);
    const [selectedLeague, setSelectedLeague] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [sortBy, setSortBy] = useState('touchdowns');
    const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'detail'
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    const [statsData, setStatsData] = useState({
        mvps: [],
        offense: { touchdowns: [], passing: [], rushing: [], receiving: [] },
        defense: { tackles: [], sacks: [], interceptions: [] }
    });

    const offenseScrollRef = useRef(null);
    const defenseScrollRef = useRef(null);

    const scrollContainer = (ref, direction) => {
        if (ref.current) {
            const amount = direction === 'left' ? -300 : 300;
            ref.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const loadCatalogs = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/stats/catalogs');
                const data = await res.json();
                
                // Add Global option
                const globalLeague = {
                    id: 'global',
                    name: 'Todas las Ligas',
                    categories: [{ id: 'global', name: 'Global (Todo el Club)' }]
                };
                
                const leaguesWithGlobal = [globalLeague, ...data];
                setLeagues(leaguesWithGlobal);
                setSelectedLeague(globalLeague);
                setSelectedCategory(globalLeague.categories[0]);
            } catch(e) { console.error(e); }
            finally { setLoading(false); }
        };
        loadCatalogs();
    }, []);

    useEffect(() => {
        if (!selectedCategory) return;

        if (viewMode === 'detail') {
            setLoading(true);
            fetch(`/api/stats/leaderboard/${selectedCategory.id}?sortBy=${sortBy}`)
                .then(res => res.json())
                .then(data => setLeaderboard(data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
            return;
        }

        setLoading(true);
        Promise.all([
            fetch(`/api/stats/leaderboard/${selectedCategory.id}?sortBy=mvp`).then(r => r.json()),
            fetch(`/api/stats/leaderboard/${selectedCategory.id}?sortBy=touchdowns`).then(r => r.json()),
            fetch(`/api/stats/leaderboard/${selectedCategory.id}?sortBy=yards_passing`).then(r => r.json()),
            fetch(`/api/stats/leaderboard/${selectedCategory.id}?sortBy=yards_rushing`).then(r => r.json()),
            fetch(`/api/stats/leaderboard/${selectedCategory.id}?sortBy=yards_receiving`).then(r => r.json()),
            fetch(`/api/stats/leaderboard/${selectedCategory.id}?sortBy=tackles`).then(r => r.json()),
            fetch(`/api/stats/leaderboard/${selectedCategory.id}?sortBy=sacks`).then(r => r.json()),
            fetch(`/api/stats/leaderboard/${selectedCategory.id}?sortBy=interceptions`).then(r => r.json()),
        ]).then(([mvps, tds, pass, rush, rec, tck, sck, ints]) => {
            setStatsData({
                mvps: Array.isArray(mvps) ? mvps.slice(0, 3) : [],
                offense: {
                    touchdowns: Array.isArray(tds) ? tds.slice(0, 5) : [],
                    passing: Array.isArray(pass) ? pass.slice(0, 3) : [],
                    rushing: Array.isArray(rush) ? rush.slice(0, 3) : [],
                    receiving: Array.isArray(rec) ? rec.slice(0, 3) : []
                },
                defense: {
                    tackles: Array.isArray(tck) ? tck.slice(0, 5) : [],
                    sacks: Array.isArray(sck) ? sck.slice(0, 3) : [],
                    interceptions: Array.isArray(ints) ? ints.slice(0, 3) : []
                }
            });
        }).finally(() => setLoading(false));

    }, [selectedCategory, viewMode, sortBy]);

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

    // Chart configs
    const offenseChartData = {
        labels: statsData.offense.touchdowns.map(p => p.name.split(' ')[0]),
        datasets: [{
            label: 'Touchdowns',
            data: statsData.offense.touchdowns.map(p => p.total_touchdowns),
            backgroundColor: 'rgba(220, 38, 38, 0.8)', // red-600
            borderRadius: 8,
        }]
    };

    const offenseChartOptions = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: 'rgba(255, 255, 255, 0.5)' } },
            x: { grid: { display: false }, ticks: { color: 'rgba(255, 255, 255, 0.8)', font: { size: 10 } } }
        }
    };

    // Radar chart for Defense (Comparing top 3 tacklers in 3 dimensions)
    const topDefenders = statsData.defense.tackles.slice(0, 3);
    const colors = ['rgba(37, 99, 235, 0.7)', 'rgba(245, 158, 11, 0.7)', 'rgba(16, 185, 129, 0.7)']; // blue, amber, emerald
    const defenseChartData = {
        labels: ['Tackleos', 'Sacks', 'Intercepciones'],
        datasets: topDefenders.map((p, i) => ({
            label: p.name.split(' ')[0],
            data: [p.total_tackles, (p.total_sacks || 0) * 3, (p.total_interceptions || 0) * 5], // Multiply to make them visible on radar vs tackles
            backgroundColor: colors[i],
            borderColor: colors[i].replace('0.7', '1'),
            borderWidth: 2,
        }))
    };

    const defenseChartOptions = {
        responsive: true,
        plugins: { legend: { position: 'bottom', labels: { color: 'rgba(255, 255, 255, 0.7)', font: { size: 10 } } } },
        scales: {
            r: {
                angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                pointLabels: { color: 'rgba(255, 255, 255, 0.8)', font: { size: 11, weight: 'bold' } },
                ticks: { display: false }
            }
        }
    };

    const renderMiniCard = (title, list, valueKey) => (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 flex-1 min-w-[140px]">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">{title}</h4>
            <div className="space-y-3">
                {list.length > 0 ? list.map((p, i) => (
                    <div key={p.id} onClick={() => navigate(`/players/${p.id}`)} className="flex items-center gap-3 cursor-pointer group">
                        <div className="text-[10px] font-black italic text-zinc-600">#{i+1}</div>
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-zinc-700">
                            {p.photo_url ? <img src={p.photo_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-[8px] font-bold">{p.name[0]}</div>}
                        </div>
                        <div className="flex-grow min-w-0">
                            <div className="text-xs font-bold truncate group-hover:text-red-500 transition-colors" style={{ color: 'var(--text-main)' }}>{p.name.split(' ')[0]}</div>
                        </div>
                        <div className="text-sm font-black italic">{p[valueKey] || 0}</div>
                    </div>
                )) : <div className="text-[10px] text-zinc-600 uppercase italic">Sin datos</div>}
            </div>
            <button onClick={() => enterDetail(valueKey.replace('total_', ''))} className="w-full mt-3 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Ver Top 10 →</button>
        </div>
    );

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

            <main className="max-w-md mx-auto px-6 pt-6 animate-fade">
                
                {/* GLOBAL FILTERS */}
                <div className="space-y-4 mb-8">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                        {leagues.map(league => (
                            <button
                                key={league.id}
                                onClick={() => handleLeagueChange(league)}
                                className={`px-5 py-2.5 rounded-2xl whitespace-nowrap font-display text-xs uppercase tracking-widest transition-all border ${
                                    selectedLeague?.id === league.id ? 'bg-red-600 border-red-500 text-white shadow-lg' : ''
                                }`}
                                style={{ backgroundColor: selectedLeague?.id === league.id ? '' : 'var(--bg-card)', borderColor: 'var(--border-main)', color: selectedLeague?.id === league.id ? '' : 'var(--text-dim)' }}
                            >
                                {league.name}
                            </button>
                        ))}
                    </div>

                    {selectedLeague && selectedLeague.id !== 'global' && (
                        <div className="flex flex-wrap gap-2">
                            {selectedLeague.categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border ${
                                        selectedCategory?.id === cat.id 
                                        ? 'bg-white text-black shadow-lg border-white' 
                                        : 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-8 animate-pulse">
                        <div className="h-48 bg-zinc-900/50 rounded-3xl"></div>
                        <div className="h-64 bg-zinc-900/50 rounded-3xl"></div>
                        <div className="h-64 bg-zinc-900/50 rounded-3xl"></div>
                    </div>
                ) : viewMode === 'summary' ? (
                    <div className="space-y-12">
                        
                        {/* MVP PODIUM */}
                        <section className="bg-gradient-to-br from-amber-500/10 to-amber-900/10 border border-amber-500/20 rounded-3xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-amber-500 mb-6 text-center">Podio de MVPs</h3>
                            
                            <div className="flex justify-center items-end gap-2 sm:gap-4 h-40">
                                {/* 2nd Place */}
                                {statsData.mvps[1] && (
                                    <div onClick={() => navigate(`/players/${statsData.mvps[1].id}`)} className="flex flex-col items-center cursor-pointer transform hover:scale-105 transition-transform z-10 w-24">
                                        <div className="w-14 h-14 rounded-full border-2 border-zinc-400 mb-2 overflow-hidden bg-zinc-800">
                                            {statsData.mvps[1].photo_url ? <img src={statsData.mvps[1].photo_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold">{statsData.mvps[1].name[0]}</div>}
                                        </div>
                                        <div className="bg-zinc-800/80 w-full rounded-t-xl h-16 border-t-2 border-zinc-400 flex flex-col items-center justify-start pt-2">
                                            <span className="text-xl font-black italic text-zinc-300 leading-none">2</span>
                                            <span className="text-[8px] uppercase tracking-widest text-zinc-400 mt-1">{statsData.mvps[1].mvp_count} MVPs</span>
                                        </div>
                                        <div className="text-[10px] font-bold truncate w-full text-center mt-1">{statsData.mvps[1].name.split(' ')[0]}</div>
                                    </div>
                                )}
                                
                                {/* 1st Place */}
                                {statsData.mvps[0] && (
                                    <div onClick={() => navigate(`/players/${statsData.mvps[0].id}`)} className="flex flex-col items-center cursor-pointer transform hover:scale-105 transition-transform z-20 w-28">
                                        <div className="absolute -top-3 bg-amber-500 text-black text-[8px] font-black px-2 py-0.5 rounded shadow-lg border border-amber-400 rotate-3 z-10">MÁS VALIOSO</div>
                                        <div className="w-20 h-20 rounded-full border-4 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)] mb-2 overflow-hidden bg-zinc-800">
                                            {statsData.mvps[0].photo_url ? <img src={statsData.mvps[0].photo_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-xl">{statsData.mvps[0].name[0]}</div>}
                                        </div>
                                        <div className="bg-amber-500/20 w-full rounded-t-xl h-24 border-t-4 border-amber-500 flex flex-col items-center justify-start pt-2 backdrop-blur-md">
                                            <span className="text-3xl font-black italic text-amber-500 leading-none shadow-black drop-shadow-md">1</span>
                                            <span className="text-[9px] uppercase tracking-widest font-black text-amber-300 mt-1">{statsData.mvps[0].mvp_count} MVPs</span>
                                        </div>
                                        <div className="text-xs font-black truncate w-full text-center mt-1 text-amber-500">{statsData.mvps[0].name.split(' ')[0]}</div>
                                    </div>
                                )}

                                {/* 3rd Place */}
                                {statsData.mvps[2] && (
                                    <div onClick={() => navigate(`/players/${statsData.mvps[2].id}`)} className="flex flex-col items-center cursor-pointer transform hover:scale-105 transition-transform z-10 w-24">
                                        <div className="w-14 h-14 rounded-full border-2 border-amber-700 mb-2 overflow-hidden bg-zinc-800">
                                            {statsData.mvps[2].photo_url ? <img src={statsData.mvps[2].photo_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold">{statsData.mvps[2].name[0]}</div>}
                                        </div>
                                        <div className="bg-zinc-800/80 w-full rounded-t-xl h-12 border-t-2 border-amber-700 flex flex-col items-center justify-start pt-2">
                                            <span className="text-lg font-black italic text-amber-700 leading-none">3</span>
                                            <span className="text-[8px] uppercase tracking-widest text-amber-700 mt-1">{statsData.mvps[2].mvp_count} MVPs</span>
                                        </div>
                                        <div className="text-[10px] font-bold truncate w-full text-center mt-1">{statsData.mvps[2].name.split(' ')[0]}</div>
                                    </div>
                                )}
                            </div>
                            {statsData.mvps.length === 0 && (
                                <div className="text-center text-xs opacity-50 py-10 uppercase tracking-widest font-black">Sin MVPs Registrados</div>
                            )}
                        </section>

                        {/* PODER OFENSIVO */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
                                <div className="w-2 h-6 bg-red-600 rounded-full"></div>
                                <h2 className="text-2xl font-display font-black uppercase italic tracking-tighter">Poder Ofensivo</h2>
                            </div>
                            
                            <div className="bg-zinc-900/50 rounded-3xl p-5 border border-zinc-800">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex justify-between">
                                    Top Anotadores (TDs Totales)
                                    <button onClick={() => enterDetail('touchdowns')} className="text-red-500 hover:text-red-400">Ver Top 10</button>
                                </h3>
                                {statsData.offense.touchdowns.length > 0 ? (
                                    <Bar data={offenseChartData} options={offenseChartOptions} height={200} />
                                ) : <div className="h-[200px] flex items-center justify-center text-[10px] uppercase text-zinc-600 font-bold">Sin datos</div>}
                            </div>

                            <div className="relative group">
                                <button onClick={() => scrollContainer(offenseScrollRef, 'left')} className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 w-8 h-8 rounded-full bg-zinc-800 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden sm:flex shadow-lg border border-zinc-700 hover:bg-zinc-700">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                                </button>
                                <div ref={offenseScrollRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x scroll-smooth">
                                    <div className="snap-center">{renderMiniCard('Yardas x Pase', statsData.offense.passing, 'total_passing')}</div>
                                    <div className="snap-center">{renderMiniCard('Yardas x Carrera', statsData.offense.rushing, 'total_rushing')}</div>
                                    <div className="snap-center">{renderMiniCard('Yardas x Recep.', statsData.offense.receiving, 'total_receiving')}</div>
                                </div>
                                <button onClick={() => scrollContainer(offenseScrollRef, 'right')} className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 w-8 h-8 rounded-full bg-zinc-800 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden sm:flex shadow-lg border border-zinc-700 hover:bg-zinc-700">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                                </button>
                            </div>
                        </section>

                        {/* MURALLA DEFENSIVA */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
                                <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                                <h2 className="text-2xl font-display font-black uppercase italic tracking-tighter">Muralla Defensiva</h2>
                            </div>
                            
                            <div className="bg-zinc-900/50 rounded-3xl p-5 border border-zinc-800">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex justify-between">
                                    Top Defensivos (Comparativa)
                                    <button onClick={() => enterDetail('tackles')} className="text-blue-500 hover:text-blue-400">Ver Top 10</button>
                                </h3>
                                {statsData.defense.tackles.length > 0 ? (
                                    <div className="max-w-[280px] mx-auto">
                                        <Radar data={defenseChartData} options={defenseChartOptions} />
                                    </div>
                                ) : <div className="h-[200px] flex items-center justify-center text-[10px] uppercase text-zinc-600 font-bold">Sin datos</div>}
                                <div className="text-[8px] text-zinc-600 text-center mt-2 italic">* Sacks e Intercepciones están multiplicados para visibilidad en el gráfico.</div>
                            </div>

                            <div className="relative group">
                                <button onClick={() => scrollContainer(defenseScrollRef, 'left')} className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 w-8 h-8 rounded-full bg-zinc-800 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden sm:flex shadow-lg border border-zinc-700 hover:bg-zinc-700">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                                </button>
                                <div ref={defenseScrollRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x scroll-smooth">
                                    <div className="snap-center">{renderMiniCard('Tackleos Tot.', statsData.defense.tackles, 'total_tackles')}</div>
                                    <div className="snap-center">{renderMiniCard('Sacks (Capturas)', statsData.defense.sacks, 'total_sacks')}</div>
                                    <div className="snap-center">{renderMiniCard('Intercepciones', statsData.defense.interceptions, 'total_interceptions')}</div>
                                </div>
                                <button onClick={() => scrollContainer(defenseScrollRef, 'right')} className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 w-8 h-8 rounded-full bg-zinc-800 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden sm:flex shadow-lg border border-zinc-700 hover:bg-zinc-700">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                                </button>
                            </div>
                        </section>
                    </div>
                ) : (
                    /* DETALLE VIEW */
                    <div className="space-y-6 animate-fade">
                        <div className="flex items-center justify-between bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                            <h2 className="text-2xl font-display font-black uppercase italic tracking-tighter leading-none">
                                Top 10: <span className="text-red-600">{sortBy.split('_').pop().toUpperCase()}</span>
                            </h2>
                            <button onClick={() => setViewMode('summary')} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white bg-zinc-800 px-3 py-1.5 rounded-lg">Volver</button>
                        </div>

                        {/* Secondary Filter Tabs */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                            {[
                                { id: 'touchdowns', label: 'TDs Totales' },
                                { id: 'mvp', label: 'MVPs' },
                                { id: 'yards', label: 'Yardas Totales' },
                                { id: 'yards_passing', label: 'Pase' },
                                { id: 'yards_rushing', label: 'Carrera' },
                                { id: 'yards_receiving', label: 'Recepción' },
                                { id: 'receptions', label: 'REC' },
                                { id: 'tackles', label: 'Tackles' },
                                { id: 'sacks', label: 'Sacks' },
                                { id: 'interceptions', label: 'INT' }
                            ].map(m => (
                                <button 
                                    key={m.id} 
                                    onClick={() => setSortBy(m.id)} 
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all border ${
                                        sortBy === m.id 
                                        ? 'bg-red-600 text-white border-red-500 shadow-[0_4px_15px_rgba(220,38,38,0.3)]' 
                                        : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                                    }`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-3">
                            {leaderboard.length > 0 ? leaderboard.map((p, index) => (
                                <div key={p.id} onClick={() => navigate(`/players/${p.id}`)} className="bg-zinc-900/60 p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden group border border-zinc-800/50 hover:border-red-500/50 transition-colors cursor-pointer">
                                    <div className="absolute -right-4 -top-6 text-8xl font-display font-black italic text-zinc-800/20 group-hover:text-red-500/5 transition-colors select-none">{index + 1}</div>
                                    
                                    <div className="w-10 h-10 flex items-center justify-center font-display font-black text-2xl italic text-zinc-500 group-hover:text-red-500 w-8">
                                        #{index + 1}
                                    </div>
                                    
                                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-zinc-700 flex-shrink-0 z-10">
                                        {p.photo_url ? <img src={p.photo_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-display text-2xl bg-zinc-800 text-zinc-500">{p.name[0]}</div>}
                                    </div>
                                    
                                    <div className="flex-grow z-10">
                                        <h4 className="font-display font-black text-base uppercase italic leading-none mb-1 text-white group-hover:text-red-400 transition-colors">{p.name}</h4>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{p.position_name || 'JUGADOR'}</p>
                                    </div>
                                    
                                    <div className="z-10 text-right">
                                        <div className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-0.5">VALOR LÍDER</div>
                                        <div className="text-3xl font-black italic text-red-500 leading-none drop-shadow-md">
                                            {sortBy === 'touchdowns' ? p.total_touchdowns : 
                                             sortBy === 'yards' ? p.total_yards : 
                                             sortBy === 'yards_passing' ? p.total_passing : 
                                             sortBy === 'yards_rushing' ? p.total_rushing : 
                                             sortBy === 'yards_receiving' ? p.total_receiving : 
                                             sortBy === 'receptions' ? p.total_receptions : 
                                             sortBy === 'mvp' ? p.mvp_count :
                                             p[`total_${sortBy}`] || 0}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-12 text-center border border-dashed border-zinc-800 rounded-3xl text-zinc-600 text-[10px] uppercase font-black tracking-widest">Sin datos para esta categoría</div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default StatsCenter;
