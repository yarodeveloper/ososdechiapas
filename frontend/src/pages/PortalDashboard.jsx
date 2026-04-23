import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { InstagramEmbed } from 'react-social-media-embed';
import SvgIcon from '../components/SvgIcon';

const PortalDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [players, setPlayers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [highlights, setHighlights] = useState([]);
    const [socialPosts, setSocialPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) { navigate('/login'); return; }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        fetchData(parsedUser);

        const socket = io('/');
        socket.on('new_event', (data) => {
            setNotification({ title: 'NUEVA ACTIVIDAD', message: data.title, type: 'calendar' });
            setTimeout(() => setNotification(null), 5000);
            fetchData(parsedUser);
        });
        socket.on('new_announcement', (data) => {
            setNotification({ title: 'NUEVO COMUNICADO', message: data.title, type: 'news' });
            setTimeout(() => setNotification(null), 5000);
            fetchData(parsedUser);
        });
        return () => socket.disconnect();
    }, [navigate]);

    const fetchData = async (currUser) => {
        try {
            const [pRes, payRes, annRes, calRes, pastRes, socRes] = await Promise.all([
                fetch(`/api/players/parent/${currUser.id}`),
                fetch('/api/payments/user/' + currUser.id),
                fetch('/api/announcements'),
                fetch('/api/calendar'),
                fetch('/api/calendar?history=true'),
                fetch('/api/social')
            ]);
            setPlayers(await pRes.json());
            const payData = await payRes.json();
            setPayments(payData);
            setAnnouncements(await annRes.json());
            const calData = await calRes.json();
            const pastData = await pastRes.json();
            setSocialPosts(await socRes.json());
            
            // Smart Stack for Parents
            const finalHighlights = [];
            
            // 1. If there's a past match that just finished, show it for results
            const recentlyFinished = pastData.find(e => e.event_type === 'match');
            if (recentlyFinished) finalHighlights.push({ ...recentlyFinished, isPast: true });
            
            // 2. Add the most immediate upcoming events (Next 4)
            const upcoming = calData
                .filter(e => !finalHighlights.some(h => h.id === e.id))
                .slice(0, 4);
            
            upcoming.forEach(e => finalHighlights.push({ ...e, isPast: false }));
            
            setHighlights(finalHighlights);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) return <div className="bg-black min-h-screen"></div>;

    const pendingPayments = payments.filter(p => p.status !== 'paid' && p.status !== 'validating');
    const totalPending = pendingPayments.reduce((acc, p) => acc + parseFloat(p.amount), 0);

    return (
        <div className="min-h-screen font-outfit pb-32 overflow-x-hidden uppercase transition-colors duration-300" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
            
            {/* Real-time Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div initial={{ y: -100 }} animate={{ y: 20 }} exit={{ y: -100 }} className="fixed top-0 left-0 w-full z-[100] px-6">
                        <div className="max-w-md mx-auto bg-red-600 rounded-3xl p-5 shadow-2xl flex items-center gap-4 text-white">
                            <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg></div>
                            <div className="flex-1"><h4 className="text-[8px] font-black tracking-widest leading-none">{notification.title}</h4><p className="text-xs font-black italic mt-1 truncate">{notification.message}</p></div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-md mx-auto px-6 py-8 space-y-8">
                
                {/* 1. Header */}
                <header className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-red-600 overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
                            <img src={user?.image_url || 'https://i.pravatar.cc/100'} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <h1 className="text-lg font-black tracking-tighter uppercase italic">Club <span className="text-red-600">Osos</span></h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/portal/avisos')} className="relative p-1">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--text-dim)' }}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
                            {announcements.some(a => a.tag === 'URGENTE') && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-600 rounded-full border-2" style={{ borderColor: 'var(--bg-main)' }}></span>}
                        </button>
                        <button onClick={handleLogout} className="p-1 transition-colors" style={{ color: 'var(--text-dim)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                        </button>
                    </div>
                </header>

                {/* 2. Welcome Title */}
                <div>
                    <h3 className="text-[10px] font-black text-red-600 tracking-[0.3em] italic mb-1">Portal Familiar</h3>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Hola, Familia {user?.name?.split(' ').pop()}</h2>
                </div>

                {/* 3. Estatus de Cuenta Card (Red) */}
                <section className={`rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden transition-all duration-500 ${totalPending > 0 ? 'bg-red-600' : 'bg-green-600'}`}>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-4">Estatus de Cuenta</p>
                        <div className="flex justify-between items-start mb-10">
                            <div className="space-y-1">
                                <h3 className="text-sm font-black uppercase">Saldo<br/>Pendiente:</h3>
                            </div>
                            <p className="text-4xl font-black italic tracking-tighter text-white leading-none">$ {totalPending.toLocaleString()} <span className="text-[10px] tracking-normal">MXN</span></p>
                        </div>
                        <div className="flex justify-between items-center">
                            <button onClick={() => navigate('/portal/payments')} className="bg-white text-black px-10 py-5 rounded-2xl text-[10px] font-black tracking-widest shadow-xl active:scale-95 transition-all">PAGAR AHORA</button>
                            {totalPending > 0 && <span className="text-[9px] font-black text-white/60 tracking-widest border-l border-white/20 pl-4 uppercase">Vence en<br/>3 Días</span>}
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-[50px] -translate-y-20 translate-x-20"></div>
                </section>

                {/* 4. Quick Access Icons (RESTORED FUNCTIONALITY) */}
                <section className="flex justify-center gap-10 px-2 text-center">
                    {[
                        { label: 'AGENDA', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', path: '/portal/agenda' },
                        { label: 'MIS RECIBOS', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', path: '/portal/payments?filter=paid' },
                        { label: 'EDO. CUENTA', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', path: '/portal/payments' }
                    ].map((btn, i) => (
                        <div key={i} onClick={() => navigate(btn.path)} className="flex flex-col items-center gap-3 active:scale-95 cursor-pointer group">
                            <div className="w-20 h-20 rounded-full border flex items-center justify-center shadow-2xl group-hover:bg-red-600/10 group-hover:text-red-500 transition-colors" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-dim)' }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={btn.icon}/></svg>
                            </div>
                            <span className="text-[10px] font-black tracking-widest uppercase italic" style={{ color: 'var(--text-dim)' }}>{btn.label}</span>
                        </div>
                    ))}
                </section>

                {/* 5. Avisos del Club Section */}
                <section className="space-y-6">
                    <div className="flex justify-between items-end">
                        <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none" style={{ color: 'var(--text-main)' }}>Avisos del Club</h3>
                        <button onClick={() => navigate('/portal/avisos')} className="text-[9px] font-black text-red-600 tracking-widest border-b border-red-600/30">VER TODOS</button>
                    </div>
                    <div className="flex gap-6 overflow-x-auto no-scrollbar -mx-6 px-6 pb-4 snap-x">
                        {announcements.slice(0, 3).map(ann => (
                            <div key={ann.id} onClick={() => navigate('/portal/avisos')} className="min-w-[300px] border-l-[3px] border-red-600 rounded-[2.5rem] p-8 space-y-6 shadow-2xl snap-center relative active:scale-95 transition-all border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                                <div className="flex justify-between items-center text-[9px] font-black tracking-widest">
                                    <span className="px-3 py-1.5 rounded-lg bg-red-600/10 text-red-500 uppercase">{ann.tag}</span>
                                    <span className="uppercase" style={{ color: 'var(--text-dim)' }}>{new Date(ann.created_at).toLocaleDateString()}</span>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black italic tracking-tighter uppercase leading-tight mb-3 truncate" style={{ color: 'var(--text-main)' }}>{ann.title}</h4>
                                    <p className="text-xs font-medium italic leading-relaxed line-clamp-2 uppercase" style={{ color: 'var(--text-dim)' }}>{ann.content}</p>
                                </div>
                                <div className="pt-2 flex items-center gap-2 text-[10px] font-black text-red-600 tracking-widest">LEER MÁS <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5.5. Feed Social (Instagram Wall) */}
                <section className="space-y-6">
                    <div className="flex justify-between items-end">
                        <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none" style={{ color: 'var(--text-main)' }}>Inside the Pack</h3>
                        <a href="https://instagram.com/" target="_blank" rel="noreferrer" className="text-[9px] font-black text-pink-500 tracking-widest border-b border-pink-500/30">VER INSTAGRAM</a>
                    </div>
                    {socialPosts.length > 0 ? (
                        <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6 pb-6 snap-x snap-mandatory">
                            {socialPosts.map(post => (
                                <div key={post.id} className="min-w-[320px] snap-center shrink-0 shadow-2xl rounded-3xl overflow-hidden border isolate" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                                    <InstagramEmbed url={post.url} width="100%" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="border border-dashed rounded-[2.5rem] p-8 text-center opacity-40" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-dim)' }}>Muro Social en Mantenimiento</p>
                        </div>
                    )}
                </section>

                {/* 6. Smart Agenda Carousel (Matches & Activities) */}
                <section className="space-y-6 pb-20">
                    <div className="flex justify-between items-end">
                        <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none" style={{ color: 'var(--text-dim)' }}>Mi Agenda</h3>
                        <div className="flex gap-1.5">
                            {highlights.map((_, i) => (
                                <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: i === 0 ? 'var(--primary)' : 'var(--border-main)' }}></div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex gap-6 overflow-x-auto no-scrollbar -mx-6 px-6 snap-x snap-mandatory pb-4">
                        {highlights.length > 0 ? highlights.map((item, idx) => (
                            <div key={idx} className="min-w-[320px] snap-center card relative p-8 space-y-6 overflow-hidden border-2" style={{ borderColor: 'var(--border-main)' }}>
                                <div className="absolute top-0 right-0 p-8">
                                    <span className="bg-red-600 text-white px-4 py-2 pt-3 rounded-2xl flex flex-col items-center leading-none shadow-lg shadow-red-900/40">
                                        <span className="text-lg font-black italic">{new Date(item.start_time).getDate()}</span>
                                        <span className="text-[8px] font-black uppercase">{new Date(item.start_time).toLocaleDateString('es-ES', { month: 'short' })}</span>
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-red-600 tracking-widest italic">{item.category_name}</p>
                                    <h4 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-10">
                                        {item.isPast ? 'RESULTADO\nRECIENTE' : 'PRÓXIMO\nJUEGO'}
                                    </h4>
                                </div>
                                <div className="flex items-center justify-between px-4 mb-8">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 rounded-2xl bg-white border flex items-center justify-center p-3 shadow-xl overflow-hidden" style={{ borderColor: 'var(--border-main)' }}><img src="/logo_osos.webp" className="w-full h-full object-contain" /></div>
                                        <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: 'var(--text-dim)' }}>OSOS</span>
                                    </div>
                                    <span className="text-2xl font-black italic tracking-tighter uppercase" style={{ color: 'var(--text-muted)' }}>{item.event_type === 'match' ? 'VS' : '•'}</span>
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 rounded-2xl bg-white border flex items-center justify-center p-3 shadow-xl overflow-hidden" style={{ borderColor: 'var(--border-main)' }}>
                                            {item.event_type === 'match' ? (
                                                item.rival_logo ? <img src={item.rival_logo} className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center bg-zinc-50 font-display font-black text-xl text-zinc-300">{item.rival_name ? item.rival_name[0] : 'R'}</div>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-zinc-50">
                                                    <SvgIcon src={`/icons/${item.event_type === 'training' ? 'gym-dumbbell' : 'compass'}-svgrepo-com.svg`} className="w-8 h-8 text-zinc-300" />
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-black tracking-widest uppercase truncate max-w-[60px]" style={{ color: 'var(--text-dim)' }}>
                                            {item.event_type === 'match' ? (item.rival_name || 'RIVAL') : (item.location_name || 'CAMPO')}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-black/5 border border-white/5 rounded-2xl py-4 px-6 flex items-center gap-3 mb-6" style={{ color: 'var(--text-dim)' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                    <span className="text-[10px] font-black tracking-widest uppercase italic">{item.location_name || 'ESTADIO CLUB'}, {new Date(item.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} HRS</span>
                                </div>

                                <button 
                                    onClick={() => navigate(item.isPast ? `/game-center/${item.id}` : '/portal/agenda')}
                                    className="w-full py-5 bg-red-600 text-white rounded-[2rem] text-[10px] font-black tracking-widest active:scale-95 transition-all shadow-xl shadow-red-900/20"
                                >
                                    {item.isPast ? 'VER ESTADÍSTICAS 🏈' : 'VER EN LA AGENDA'}
                                </button>
                            </div>
                        )) : (
                            <div className="w-full card p-8 text-center opacity-40">
                                <p className="text-[10px] font-black uppercase tracking-widest">Sin eventos programados</p>
                            </div>
                        )}
                    </div>
                </section>

            </div>

            {/* 7. Bottom Nav (Fixed) */}
            <nav className="fixed bottom-0 left-0 w-full backdrop-blur-xl border-t px-6 pt-4 pb-10 z-50 rounded-t-[2.5rem] transition-colors" style={{ backgroundColor: 'var(--nav-bg)', borderColor: 'var(--border-main)' }}>
                <div className="max-w-md mx-auto flex justify-between items-center px-4 leading-none">
                    <button className="flex flex-col items-center gap-2 text-red-600 bg-red-600/10 px-8 py-3 rounded-2xl border border-red-600/20">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/></svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">INICIO</span>
                    </button>
                    <button onClick={() => navigate('/portal/payments')} className="flex flex-col items-center gap-2" style={{ color: 'var(--text-dim)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">PAGOS</span>
                    </button>
                    <button onClick={() => navigate('/portal/avisos')} className="flex flex-col items-center gap-2" style={{ color: 'var(--text-dim)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">AVISOS</span>
                    </button>
                    <button onClick={() => navigate('/portal/perfil')} className="flex flex-col items-center gap-2" style={{ color: 'var(--text-dim)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">PERFIL</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default PortalDashboard;
