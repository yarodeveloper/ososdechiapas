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
        yards: acc.yards + (parseInt(s.yards_passing) || 0) + (parseInt(s.yards_rushing) || 0),
        tds: acc.tds + (parseInt(s.touchdowns) || 0),
        tackles: acc.tackles + (parseInt(s.tackles) || 0),
        ints: acc.ints + (parseInt(s.interceptions) || 0)
    }), { yards: 0, tds: 0, tackles: 0, ints: 0 });

    const chartData = {
        labels: [...stats].reverse().map(s => {
            const d = new Date(s.event_date);
            return `${d.getDate()}/${d.getMonth()+1}`;
        }),
        datasets: [
            {
                label: 'Yardas por Partido',
                data: [...stats].reverse().map(s => (parseInt(s.yards_passing)||0) + (parseInt(s.yards_rushing)||0)),
                borderColor: '#dc2626',
                backgroundColor: 'rgba(220, 38, 38, 0.15)',
                borderWidth: 3,
                pointBackgroundColor: '#dc2626',
                pointBorderColor: '#000',
                pointRadius: 4,
                fill: true,
                tension: 0.4
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
            legend: { display: false },
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
           y: { grid: { color: '#27272a', borderDash: [5, 5] }, ticks: { color: '#71717a', font: { size: 10, family: 'Inter', weight: 'bold' }, padding: 10 }, beginAtZero: true }
        }
    };

    return (
        <div className="bg-[#050505] min-h-screen text-white font-outfit pb-20 relative overflow-hidden">
            {/* Background Aura */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-red-600/10 blur-[120px] rounded-full -translate-y-1/2"></div>
            
            <header className="fixed top-0 left-0 w-full h-18 bg-black/60 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-6 py-4">
                <button onClick={() => navigate('/portal')} className="w-10 h-10 rounded-xl bg-zinc-900/50 flex items-center justify-center text-zinc-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-[10px] font-black uppercase tracking-[0.3em] italic text-zinc-500">Playcard <span className="text-red-600 font-black">Elite</span></h1>
                <div className="w-10 text-right"><span className="text-red-600 font-black italic">#{player?.number}</span></div>
            </header>

            <main className="max-w-md mx-auto px-6 pt-24 space-y-10 relative z-10">
                {/* 1. Player Card Design */}
                <section className="relative group">
                    <div className="absolute inset-0 bg-red-600/20 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="bg-zinc-950 border border-zinc-900 rounded-[3rem] p-1 shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-br from-zinc-900 to-black rounded-[2.8rem] p-8 aspect-[3/4] flex flex-col justify-between relative overflow-hidden">
                            {/* Decorative Grid */}
                            <div className="absolute inset-0 opacity-[0.03] select-none pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                            
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-black tracking-widest bg-red-600 px-4 py-1.5 rounded-full shadow-lg shadow-red-900/40">OFFICIAL RECRUIT</span>
                                <span className="text-4xl font-black italic tracking-tighter text-red-600/30 font-display">#{player?.number}</span>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-5xl font-black tracking-tighter uppercase italic italic leading-none">{player?.name.split(' ')[0]}<br/><span className="text-red-600">{player?.name.split(' ')[1] || 'CHAMP'}</span></h2>
                                <div className="flex items-center gap-6 text-[10px] font-black text-zinc-500 tracking-widest uppercase italic">
                                    <span>{player?.position || 'ROOKIE'}</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                                    <span>{player?.category_name || 'U-15'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Lifetime Stats Grid */}
                <section className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'YARDAS TOTALES', val: totals.yards, icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                        { label: 'TOUCHDOWNS', val: totals.tds, icon: 'M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z' },
                        { label: 'TACKLEOS', val: totals.tackles, icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
                        { label: 'INTERCEPCIONES', val: totals.ints, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' }
                    ].map((st, i) => (
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

                {/* 3. Match History Log */}
                <section className="space-y-6">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-600 italic px-2">Historial de Partidos</h3>
                    <div className="space-y-4">
                        {stats.map(s => (
                            <div key={s.id} className="bg-zinc-950/50 border border-zinc-900 rounded-[1.8rem] p-6 flex justify-between items-center group active:scale-95 transition-all">
                                <div>
                                    <h4 className="text-sm font-black italic uppercase leading-none">{s.event_title}</h4>
                                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1 italic">{new Date(s.event_date).toLocaleDateString('es-ES', { month: 'long', year: 'numeric'})}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-lg font-black italic text-red-600">+{parseInt(s.yards_passing) + parseInt(s.yards_rushing)} YARDS</span>
                                    <div className="flex gap-2 justify-end mt-1">
                                        <span className="text-[7px] font-black bg-zinc-900 px-2 py-0.5 rounded uppercase tracking-widest">{s.touchdowns} TDS</span>
                                        <span className="text-[7px] font-black bg-zinc-900 px-2 py-0.5 rounded uppercase tracking-widest">{s.tackles} TACKLES</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default PortalPlayerCard;
