import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const PortalPlayerCard = () => {
    const { id } = useParams(); // player_id
    const navigate = useNavigate();
    const [player, setPlayer] = useState(null);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlayerData();
    }, [id]);

    const fetchPlayerData = async () => {
        try {
            const sRes = await fetch(`/api/stats/player/${id}`);
            const sData = await sRes.json();
            setPlayer(sData);
            setStats(sData.history || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    if (loading) return <div className="bg-black min-h-screen text-white flex items-center justify-center font-black">Generando Playcard...</div>;

    const totals = stats.reduce((acc, s) => ({
        yards_passing: acc.yards_passing + (parseInt(s.yards_passing) || 0),
        yards_scrimmage: acc.yards_scrimmage + (parseInt(s.yards_rushing) || 0) + (parseInt(s.yards_receiving) || 0),
        receptions: acc.receptions + (parseInt(s.receptions) || 0),
        tds: acc.tds + (parseInt(s.touchdowns) || 0),
        td_off: acc.td_off + (parseInt(s.td_offense) || 0),
        td_def: acc.td_def + (parseInt(s.td_defense) || 0),
        tackles: acc.tackles + (parseInt(s.tackles) || 0),
        ints: acc.ints + (parseInt(s.interceptions) || 0),
        sacks: acc.sacks + (parseInt(s.sacks) || 0),
        extra: acc.extra + (parseInt(s.points_extra) || 0)
    }), { yards_passing: 0, yards_scrimmage: 0, receptions: 0, tds: 0, td_off: 0, td_def: 0, tackles: 0, ints: 0, sacks: 0, extra: 0 });

    const chartData = {
        labels: [...stats].reverse().map(s => {
            const d = new Date(s.event_date);
            return `${d.getDate()}/${d.getMonth()+1}`;
        }),
        datasets: []
    };

    const hasDef = totals.tackles + totals.ints + totals.sacks > 0;
    const hasPass = totals.yards_passing > 0;
    const hasRushRec = totals.yards_scrimmage > 0;

    if (hasPass) {
        chartData.datasets.push({
            label: 'Yardas Pase',
            data: [...stats].reverse().map(s => parseInt(s.yards_passing) || 0),
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

    if (hasRushRec || (!hasPass && !hasDef)) {
        chartData.datasets.push({
            label: 'Yardas Scrimmage',
            data: [...stats].reverse().map(s => (parseInt(s.yards_rushing)||0) + (parseInt(s.yards_receiving)||0)),
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

    if (hasDef) {
        chartData.datasets.push({
            label: 'Acciones Defensivas',
            data: [...stats].reverse().map(s => (parseInt(s.tackles)||0) + (parseInt(s.interceptions)||0) + (parseInt(s.sacks)||0)),
            borderColor: '#eab308',
            backgroundColor: 'rgba(234, 179, 8, 0.15)',
            borderWidth: 3,
            pointBackgroundColor: '#eab308',
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
                bodyFont: { weight: 'bold' },
                displayColors: true,
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
        <div className="bg-[#050505] min-h-screen text-white font-outfit pb-20 relative overflow-hidden">
            {/* Background Aura */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-red-600/10 blur-[120px] rounded-full -translate-y-1/2"></div>
            
            <header className="fixed top-0 left-0 w-full h-18 bg-black/60 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-6 py-4">
                <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-zinc-900/50 flex items-center justify-center text-zinc-400 hover:text-white transition-colors active:scale-95">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-[10px] font-black uppercase tracking-[0.3em] italic text-zinc-500">Playcard <span className="text-red-600 font-black">Elite</span></h1>
                <div className="w-10 text-right"><span className="text-red-600 font-black italic">#{player?.jersey_number}</span></div>
            </header>

            <main className="max-w-md mx-auto px-6 pt-24 space-y-10 relative z-10">
                {/* 1. Player Card Design */}
                <section className="relative group flex justify-center mb-4 mt-2">
                    <div className="absolute inset-0 bg-red-600/10 blur-[60px] rounded-full scale-75"></div>
                    <div className="bg-gradient-to-b from-[#130707] to-[#0a0303] border border-red-900/20 rounded-[3rem] w-full max-w-[340px] pt-10 pb-12 px-6 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
                        
                        {/* Background Watermark */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-[140px] font-black italic text-red-600/5 select-none pointer-events-none font-display uppercase tracking-tighter leading-none z-0">
                            OSOS
                        </div>

                        {/* Top Headers */}
                        <div className="relative z-10 mb-8 w-full">
                            <h3 className="text-zinc-700 text-[11px] font-black uppercase tracking-[0.3em] mb-1">Club Deportivo</h3>
                            <h4 className="text-red-600 text-[9px] font-black uppercase tracking-[0.4em]">Club Osos de Chiapas</h4>
                        </div>

                        {/* Avatar Circle */}
                        <div className="relative z-10 mb-10 mt-2">
                            <div className="w-52 h-52 rounded-full border-[6px] border-[#130707] ring-[3px] ring-red-600 shadow-[0_0_40px_rgba(220,38,38,0.15)] bg-zinc-900 overflow-hidden group-hover:scale-105 transition-transform duration-500 relative z-10">
                                {player?.photo_url ? (
                                    <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover object-top" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-5xl text-zinc-800 font-black">
                                        {player?.name?.charAt(0) || 'O'}
                                    </div>
                                )}
                            </div>
                            
                            {/* Number Badge */}
                            <div className="absolute -bottom-2 -right-2 bg-[#dc2626] text-white text-3xl font-black italic tracking-tighter rounded-[1rem] px-5 py-2 border-[6px] border-[#130707] shadow-xl z-20 group-hover:rotate-6 group-hover:scale-110 transition-all">
                                #{player?.jersey_number || '00'}
                            </div>
                        </div>

                        {/* Name and Position */}
                        <div className="relative z-10 space-y-4 w-full">
                            <h2 className="text-[2.5rem] font-black tracking-tight uppercase italic leading-[0.9] drop-shadow-md text-white font-display">
                                {player?.name?.split(' ')[0]}<br/>
                                <span>{player?.name?.split(' ').slice(1).join(' ') || 'CHAMP'}</span>
                            </h2>
                            <p className="text-red-600 text-[9px] font-black uppercase tracking-[0.2em] italic">
                                Posición: <span className="text-red-500">{player?.category_name || 'U-15'}</span>
                            </p>
                        </div>

                    </div>
                </section>

                {/* 3. Match History Log (MOVED UP) */}
                <section className="space-y-6">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-600 italic px-2">Historial de Partidos</h3>
                    <div className="space-y-4">
                        {[...stats].sort((a, b) => new Date(b.event_date) - new Date(a.event_date)).map(s => (
                            <div key={s.id} className="bg-zinc-950/50 border border-zinc-900 rounded-[1.8rem] p-6 flex justify-between items-center group active:scale-95 transition-all">
                                <div>
                                    <h4 className="text-sm font-black italic uppercase leading-none">{s.event_title}</h4>
                                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1 italic">{new Date(s.event_date).toLocaleDateString('es-ES', { month: 'long', year: 'numeric'})}</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        {s.is_mvp === 1 && <span className="text-[10px] font-black bg-amber-500 text-black px-3 py-1 rounded-lg uppercase tracking-[0.2em] shadow-lg shadow-amber-500/20">★ MVP</span>}
                                        <div className="flex flex-col items-end gap-0.5">
                                            {(parseInt(s.yards_passing) > 0) && <span className="text-lg font-black italic text-blue-500 leading-none">+{s.yards_passing} YDS PAS</span>}
                                            {(parseInt(s.yards_rushing) > 0 || parseInt(s.yards_receiving) > 0) && <span className="text-lg font-black italic text-red-600 leading-none">+{parseInt(s.yards_rushing) + parseInt(s.yards_receiving)} YDS SC</span>}
                                            {(parseInt(s.receptions) > 0) && <span className="text-[9px] font-black italic text-zinc-400 leading-none">{s.receptions} REC</span>}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1 justify-end mt-2">
                                        <span title={`${s.td_offense} TD Ofensivos, ${s.td_defense} TD Defensivos`} className="text-[7px] font-black bg-zinc-900 px-2 py-0.5 rounded uppercase tracking-widest text-zinc-400 cursor-help hover:text-white transition-colors">TD: {s.td_offense}+{s.td_defense}</span>
                                        <span title={`${s.tackles} Tackleos, ${s.interceptions} Intercepciones, ${s.sacks} Sacks`} className="text-[7px] font-black bg-zinc-900 px-2 py-0.5 rounded uppercase tracking-widest text-zinc-400 cursor-help hover:text-white transition-colors">DEF: {s.tackles}/{s.interceptions}/{s.sacks}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 2. Lifetime Stats Grid */}
                <section className="grid grid-cols-2 gap-4">
                    {(() => {
                        const statBlocks = [];
                        if (totals.yards_passing > 0) statBlocks.push({ label: 'YARDAS PASE', val: totals.yards_passing, icon: 'M13 10V3L4 14h7v7l9-11h-7z' });
                        if (totals.yards_scrimmage > 0) statBlocks.push({ label: 'YARDAS SCRIMMAGE', val: totals.yards_scrimmage, icon: 'M13 10V3L4 14h7v7l9-11h-7z' });
                        if (totals.receptions > 0) statBlocks.push({ label: 'RECEPCIONES', val: totals.receptions, icon: 'M13 10V3L4 14h7v7l9-11h-7z' });
                        statBlocks.push({ label: 'TOUCHDOWNS', val: totals.tds, icon: 'M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z' });
                        if (totals.tackles > 0) statBlocks.push({ label: 'TACKLEOS', val: totals.tackles, icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' });
                        if (totals.ints > 0 || totals.sacks > 0) statBlocks.push({ label: 'INT / SACKS', val: `${totals.ints}/${totals.sacks}`, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' });
                        if (totals.extra > 0) statBlocks.push({ label: 'PUNTOS EXTRA', val: totals.extra, icon: 'M13 10V3L4 14h7v7l9-11h-7z' });
                        statBlocks.push({ label: 'MVP COUNT', val: stats.filter(s => s.is_mvp).length, icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z' });
                        return statBlocks;
                    })().map((st, i) => (
                        <div key={i} className="bg-zinc-950 border border-zinc-900 rounded-[2rem] p-6 shadow-xl relative group hover:border-red-600 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-red-600/5 flex items-center justify-center text-red-600 mb-6"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d={st.icon}/></svg></div>
                            <p className="text-4xl font-black italic tracking-tighter mb-1 font-display leading-none">{st.val}</p>
                            <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">{st.label}</span>
                        </div>
                    ))}
                </section>

                {/* Evolution Chart */}
                {stats.length > 0 && (
                    <section className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-6 shadow-xl relative">
                        <div className="flex justify-between items-center mb-6 px-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">Evolución de Yardas</h3>
                        </div>
                        <div className="h-48 w-full px-2">
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default PortalPlayerCard;
