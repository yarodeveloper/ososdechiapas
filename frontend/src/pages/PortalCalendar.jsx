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
        <div className="min-h-screen font-outfit pb-32 overflow-x-hidden uppercase" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
            <header className="fixed top-0 left-0 w-full backdrop-blur-xl border-b z-50 transition-colors" style={{ backgroundColor: 'var(--nav-bg)', borderColor: 'var(--border-main)' }}>
                <div className="max-w-md mx-auto px-6 h-18 flex items-center justify-between py-6">
                    <button onClick={() => navigate('/portal')} className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-90" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-dim)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                    <h1 className="text-xs font-black uppercase tracking-[0.3em] italic" style={{ color: 'var(--text-dim)' }}>Agenda <span className="text-red-600">Digital</span></h1>
                    <div className="w-10"></div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 pt-28 space-y-8">
                
                {/* View Switcher */}
                <div className="flex p-1.5 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                    <button 
                        onClick={() => setView('upcoming')}
                        className={`flex-1 py-3 rounded-xl text-[9px] font-black tracking-widest transition-all ${view === 'upcoming' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'opacity-40'}`}
                        style={view !== 'upcoming' ? { color: 'var(--text-main)' } : {}}
                    >
                        Próximos
                    </button>
                    <button 
                        onClick={() => setView('results')}
                        className={`flex-1 py-3 rounded-xl text-[9px] font-black tracking-widest transition-all ${view === 'results' ? 'bg-zinc-100 text-black shadow-lg shadow-white/10' : 'opacity-40'}`}
                        style={view !== 'results' ? { color: 'var(--text-main)' } : {}}
                    >
                        Resultados
                    </button>
                </div>

                <div className="space-y-8">
                    {events.length === 0 ? (
                        <div className="text-center py-20 opacity-30 italic font-black tracking-widest text-xs" style={{ color: 'var(--text-dim)' }}>Sin registros registrados</div>
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
                                        <div className="rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                                            <div className="absolute top-0 right-0 p-4 opacity-5"><svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/></svg></div>
                                            
                                            <div className="flex justify-between items-center relative z-10">
                                                <div className="flex flex-col items-center gap-3 flex-1 text-center">
                                                    <img src="/logo_osos.webp" alt="Osos" className="w-14 h-14 object-contain" />
                                                    <span className="text-[9px] font-black tracking-widest" style={{ color: 'var(--text-main)' }}>OSOS</span>
                                                </div>
                                                
                                                <div className="flex items-center gap-4 px-4 py-4 rounded-3xl border" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)' }}>
                                                    <span className="text-4xl font-black italic tracking-tighter" style={{ color: 'var(--text-main)' }}>{ev.score_osos ?? '-'}</span>
                                                    <span className="text-xs font-black italic opacity-20" style={{ color: 'var(--text-dim)' }}>VS</span>
                                                    <span className="text-4xl font-black italic tracking-tighter opacity-40" style={{ color: 'var(--text-dim)' }}>{ev.score_rival ?? '-'}</span>
                                                </div>

                                                <div className="flex flex-col items-center gap-3 flex-1 text-center">
                                                    <div className="w-14 h-14 rounded-full flex items-center justify-center border p-2 overflow-hidden" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)' }}>
                                                        {ev.rival_logo ? <img src={ev.rival_logo} className="w-full h-full object-contain" /> : <div className="text-xl font-black opacity-20" style={{ color: 'var(--text-dim)' }}>{ev.rival_name?.[0] || 'R'}</div>}
                                                    </div>
                                                    <span className="text-[9px] font-black tracking-widest truncate w-full" style={{ color: 'var(--text-dim)' }}>{ev.rival_name || 'RIVAL'}</span>
                                                </div>
                                            </div>
                                            <div className="mt-8 pt-4 border-t text-center" style={{ borderColor: 'var(--border-main)' }}>
                                                <p className="text-[9px] font-black tracking-widest uppercase italic opacity-40" style={{ color: 'var(--text-dim)' }}>{ev.category_name || 'PARTIDO AMISTOSO'}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Standard Event Card */
                                        <div className="rounded-[2.5rem] p-7 shadow-2xl relative overflow-hidden border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ev.event_type === 'match' ? 'bg-red-600 text-white' : 'bg-amber-500 text-black'}`}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-lg font-black italic tracking-tighter" style={{ color: 'var(--text-main)' }}>{date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} HRS</span>
                                                    <p className="text-[8px] font-black tracking-widest mt-1 uppercase italic opacity-40" style={{ color: 'var(--text-dim)' }}>{ev.category_name}</p>
                                                </div>
                                            </div>

                                            {/* Visual match header if it is a match */}
                                            {ev.event_type === 'match' && (
                                                <div className="flex items-center gap-4 mb-4 p-4 rounded-3xl border" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)' }}>
                                                    <img src="/logo_osos.webp" className="w-8 h-8 object-contain filter grayscale opacity-50" />
                                                    <span className="text-xs font-black italic opacity-20" style={{ color: 'var(--text-dim)' }}>VS</span>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full flex items-center justify-center p-1.5 overflow-hidden border" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)' }}>
                                                            {ev.rival_logo ? <img src={ev.rival_logo} className="w-full h-full object-contain" /> : <span className="text-xs font-black opacity-20" style={{ color: 'var(--text-dim)' }}>R</span>}
                                                        </div>
                                                        <span className="text-[10px] font-black tracking-widest uppercase truncate max-w-[80px]" style={{ color: 'var(--text-dim)' }}>{ev.rival_name || 'Rival por definir'}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <h4 className="text-xl font-black italic tracking-tighter uppercase mb-4 leading-none" style={{ color: 'var(--text-main)' }}>{ev.title}</h4>
                                            <div className="flex items-center gap-4 opacity-40" style={{ color: 'var(--text-dim)' }}>
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
