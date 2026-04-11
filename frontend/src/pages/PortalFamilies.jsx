import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PortalFamilies = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) { navigate('/login'); return; }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        fetchPlayers(parsedUser.id);
    }, [navigate]);

    const fetchPlayers = async (parentId) => {
        try {
            const res = await fetch(`/api/players/parent/${parentId}`);
            setPlayers(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    if (loading) return <div className="bg-black min-h-screen"></div>;

    return (
        <div className="bg-[#050505] min-h-screen text-white font-outfit pb-32 overflow-x-hidden uppercase">
            <header className="px-6 py-10 flex justify-between items-center border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/portal')} className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-500">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                    <h1 className="text-xl font-black italic tracking-tighter uppercase italic">Club <span className="text-red-600">Osos</span></h1>
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 pt-10 space-y-12 relative z-10">
                {/* 1. Account Info Card */}
                <section className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-20 h-20 rounded-full border-4 border-red-600/20 overflow-hidden bg-zinc-900">
                            <img src={user?.image_url || 'https://i.pravatar.cc/100'} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-red-600 tracking-widest leading-none block italic">Tutor Oficial</span>
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase italic leading-none">{user?.name}</h2>
                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-2 italic">{user?.email}</p>
                        </div>
                    </div>
                </section>

                {/* 2. My Players (Family roster) */}
                <section className="space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">Mis Jugadores</h3>
                        <div className="w-1/2 h-px bg-zinc-900"></div>
                    </div>

                    <div className="space-y-6">
                        {players.map(p => (
                            <div key={p.id} onClick={() => navigate(`/portal/player/${p.id}/playcard`)} className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-7 shadow-2xl relative group active:scale-95 transition-all cursor-pointer">
                                <div className="absolute top-0 right-0 p-6 opacity-5"><svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg></div>
                                
                                <div className="flex items-center gap-6 relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-black border border-zinc-800 flex items-center justify-center text-red-600 text-3xl font-black italic shadow-lg">#{p.number}</div>
                                    <div className="flex-1">
                                        <h4 className="text-xl font-black italic uppercase leading-none">{p.name}</h4>
                                        <div className="flex items-center gap-3 mt-2 text-[9px] font-black text-zinc-500 tracking-widest">
                                            <span>{p.category_name}</span>
                                            <div className="w-1 h-1 rounded-full bg-red-600 opacity-50"></div>
                                            <span>{p.position || 'JUGADOR'}</span>
                                        </div>
                                    </div>
                                    <button className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-600 shadow-md">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* FIXED BOTTOM NAV (MANTENIENDO CONSISTENCIA) */}
            <nav className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-white/5 px-6 pt-4 pb-10 z-50 rounded-t-[2.5rem]">
                <div className="max-w-md mx-auto flex justify-between items-center px-4 leading-none">
                    <button onClick={() => navigate('/portal')} className="flex flex-col items-center gap-2 text-zinc-600">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/></svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">INICIO</span>
                    </button>
                    <button onClick={() => navigate('/portal/payments')} className="flex flex-col items-center gap-2 text-zinc-600">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">PAGOS</span>
                    </button>
                    <button onClick={() => navigate('/portal/avisos')} className="flex flex-col items-center gap-2 text-zinc-600">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">AVISOS</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 text-red-600 bg-red-600/10 px-8 py-3 rounded-2xl border border-red-600/20">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">PERFIL</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default PortalFamilies;
