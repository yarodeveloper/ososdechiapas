import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Avisos = () => {
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch('/api/announcements');
            const data = await res.json();
            setAnnouncements(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="bg-black min-h-screen"></div>;

    const getTagColor = (color) => {
        switch (color) {
            case 'red': return 'bg-red-600 shadow-red-900/40';
            case 'amber': return 'bg-amber-500 text-black shadow-amber-900/30';
            case 'green': return 'bg-green-500 text-black shadow-green-900/30';
            default: return 'bg-zinc-800 text-zinc-400';
        }
    };

    return (
        <div className="bg-[#050505] text-white min-h-screen font-outfit pb-32 overflow-x-hidden">
            <div className="max-w-md mx-auto min-h-screen relative">
                <header className="px-6 pt-10 pb-10">
                    <div className="flex items-center gap-4 mb-2">
                        <button onClick={() => navigate('/portal')} className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center justify-center text-zinc-500">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                        </button>
                        <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 italic">Cartelera Oficial</h1>
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter uppercase italic">Avisos del <span className="text-red-600">Club</span></h2>
                </header>

                <main className="px-6 space-y-8">
                    {announcements.length === 0 ? (
                        <div className="py-20 text-center opacity-30 italic font-black uppercase tracking-widest text-xs">No hay avisos recientes</div>
                    ) : (
                        announcements.map(ann => (
                            <div key={ann.id} className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all animate-fade">
                                {ann.image_url && (
                                    <div className="relative group">
                                        <img src={ann.image_url} alt="" className="w-full h-64 object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent"></div>
                                    </div>
                                )}
                                <div className="p-8 space-y-5">
                                    <div className="flex justify-between items-center">
                                        <span className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white ${getTagColor(ann.tag_color)}`}>
                                            {ann.tag}
                                        </span>
                                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                                            {new Date(ann.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight leading-tight uppercase italic">{ann.title}</h3>
                                    <p className="text-sm text-zinc-500 font-medium leading-relaxed italic">
                                        {ann.content}
                                    </p>
                                    <div className="pt-4 border-t border-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-700">
                                        Publicado por: Admin Club Osos
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </main>
            </div>

            <nav className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-white/5 px-6 pt-4 pb-10 z-50 rounded-t-[2.5rem]">
                <div className="max-w-md mx-auto flex justify-between items-center px-4">
                    <button onClick={() => navigate('/portal')} className="flex flex-col items-center gap-2 text-zinc-600">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/></svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">Inicio</span>
                    </button>
                    <button onClick={() => navigate('/portal/payments')} className="flex flex-col items-center gap-2 text-zinc-600">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">Pagos</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-red-900/30">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">Avisos</span>
                    </button>
                    <button onClick={() => navigate('/portal')} className="flex flex-col items-center gap-2 text-zinc-600">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">Perfil</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default Avisos;
