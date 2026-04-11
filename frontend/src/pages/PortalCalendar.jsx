import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PortalCalendar = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('upcoming'); // 'upcoming' or 'results'

    useEffect(() => {
        fetchEvents();
    }, [view]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const history = view === 'results' ? '?history=true' : '';
            const res = await fetch(`/api/calendar${history}`);
            const data = await res.json();
            setEvents(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    if (loading) return <div className="bg-black min-h-screen flex items-center justify-center text-white italic">Sincronizando Agenda...</div>;

    return (
        <div className="bg-[#050505] text-white min-h-screen font-outfit pb-32 overflow-x-hidden uppercase">
            <header className="fixed top-0 left-0 w-full bg-black/80 backdrop-blur-xl border-b border-white/5 z-50">
                <div className="max-w-md mx-auto px-6 h-18 flex items-center justify-between py-6">
                    <button onClick={() => navigate('/portal')} className="w-10 h-10 rounded-xl bg-zinc-900/50 flex items-center justify-center text-zinc-400">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                    <h1 className="text-xs font-black uppercase tracking-[0.3em] italic text-zinc-400">Agenda <span className="text-red-600">Digital</span></h1>
                    <div className="w-10"></div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 pt-28 space-y-8">
                
                {/* View Switcher */}
                <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-900">
                    <button 
                        onClick={() => setView('upcoming')}
                        className={`flex-1 py-3 rounded-xl text-[9px] font-black tracking-widest transition-all ${view === 'upcoming' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-zinc-600'}`}
                    >
                        Próximos
                    </button>
                    <button 
                        onClick={() => setView('results')}
                        className={`flex-1 py-3 rounded-xl text-[9px] font-black tracking-widest transition-all ${view === 'results' ? 'bg-zinc-100 text-black shadow-lg shadow-white/10' : 'text-zinc-600'}`}
                    >
                        Resultados
                    </button>
                </div>

                <div className="space-y-8">
                    {events.length === 0 ? (
                        <div className="text-center py-20 opacity-30 italic font-black tracking-widest text-xs">Sin registros registrados</div>
                    ) : (
                        events.map((ev) => {
                            const date = new Date(ev.start_time);
                            return (
                                <div key={ev.id} className="animate-fade">
                                    <p className="text-[10px] font-black text-red-600 tracking-widest italic mb-4 px-2">
                                        {date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </p>

                                    {view === 'results' && ev.event_type === 'match' ? (
                                        /* Result Card (Scoreboard Style) */
                                        <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-5"><svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/></svg></div>
                                            
                                            <div className="flex justify-between items-center relative z-10">
                                                <div className="flex flex-col items-center gap-3 flex-1 text-center">
                                                    <img src="/logo_osos.webp" alt="Osos" className="w-14 h-14 object-contain" />
                                                    <span className="text-[9px] font-black tracking-widest text-white">OSOS</span>
                                                </div>
                                                
                                                <div className="flex items-center gap-4 px-4 bg-black/40 py-4 rounded-3xl border border-white/5">
                                                    <span className="text-4xl font-black italic tracking-tighter text-white">{ev.score_osos ?? '-'}</span>
                                                    <span className="text-xs font-black text-zinc-800 italic">VS</span>
                                                    <span className="text-4xl font-black italic tracking-tighter text-zinc-500">{ev.score_rival ?? '-'}</span>
                                                </div>

                                                <div className="flex flex-col items-center gap-3 flex-1 text-center">
                                                    <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5 p-2 overflow-hidden">
                                                        {ev.rival_logo ? <img src={ev.rival_logo} className="w-full h-full object-contain" /> : <div className="text-xl font-black text-zinc-700">{ev.rival_name?.[0] || 'R'}</div>}
                                                    </div>
                                                    <span className="text-[9px] font-black tracking-widest text-zinc-500 truncate w-full">{ev.rival_name || 'RIVAL'}</span>
                                                </div>
                                            </div>
                                            <div className="mt-8 pt-4 border-t border-white/5 text-center">
                                                <p className="text-[9px] font-black text-zinc-600 tracking-widest uppercase italic">{ev.category_name || 'PARTIDO AMISTOSO'}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Standard Event Card */
                                        <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-7 shadow-2xl relative overflow-hidden">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ev.event_type === 'match' ? 'bg-red-600 text-white' : 'bg-amber-500 text-black'}`}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-lg font-black italic tracking-tighter">{date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} HRS</span>
                                                    <p className="text-[8px] font-black text-zinc-600 tracking-widest mt-1 uppercase italic">{ev.category_name}</p>
                                                </div>
                                            </div>

                                            {/* Visual match header if it is a match */}
                                            {ev.event_type === 'match' && (
                                                <div className="flex items-center gap-4 mb-4 bg-black/40 p-4 rounded-3xl border border-white/5">
                                                    <img src="/logo_osos.webp" className="w-8 h-8 object-contain filter grayscale" />
                                                    <span className="text-xs font-black italic text-zinc-700">VS</span>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center p-1.5 overflow-hidden">
                                                            {ev.rival_logo ? <img src={ev.rival_logo} className="w-full h-full object-contain" /> : <span className="text-xs font-black text-zinc-700">R</span>}
                                                        </div>
                                                        <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase truncate max-w-[80px]">{ev.rival_name || 'Rival por definir'}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <h4 className="text-xl font-black italic tracking-tighter uppercase mb-4 leading-none">{ev.title}</h4>
                                            <div className="flex items-center gap-4 text-zinc-500">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                                <span className="text-[9px] font-black tracking-widest uppercase italic">{ev.location_name || 'Sede Club'}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </main>
        </div>
    );
};

export default PortalCalendar;
