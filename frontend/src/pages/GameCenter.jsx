import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

const GameCenter = () => {
    const { id: matchId } = useParams();
    const navigate = useNavigate();

    // Default state before sync
    const [gameState, setGameState] = useState({
        home_score: 0,
        away_score: 0,
        time_left: '15:00',
        current_quarter: '1Q',
        possession: 'Osos',
        playLog: [],
        down_and_distance: '1ST & 10'
    });

    useEffect(() => {
        // 1. Initial Load from API
        const fetchInitial = async () => {
             try {
                 const res = await fetch(`/api/matches/details/${matchId}`);
                 const data = await res.json();
                 if (data) setGameState(data);
             } catch (err) { console.error('Initial fetch error', err); }
        };
        fetchInitial();

        // 2. Setup Socket.io
        socket.emit('join_match', matchId);

        socket.on('match_updated', (data) => {
            if (data.matchId === matchId) {
                setGameState(data);
                console.log('Update received:', data);
            }
        });

        return () => {
            socket.off('match_updated');
        };
    }, [matchId]);

    return (
        <div className="bg-[#0a0a0a] min-h-screen text-white font-body pb-32 overflow-x-hidden">
            {/* Header */}
            <header className="px-6 py-6 border-b border-zinc-900 flex justify-between items-center bg-black/60 backdrop-blur-md sticky top-0 z-50">
                <button onClick={() => navigate('/')} className="text-zinc-400">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </button>
                <div className="flex flex-col items-center">
                    <span className="font-display font-black text-xs uppercase tracking-[0.2em] italic italic">Game Center</span>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-sm shadow-red-600"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Live Match</span>
                    </div>
                </div>
                <div className="w-6"></div> {/* Spacer */}
            </header>

            <main className="max-w-md mx-auto px-6 py-8 animate-fade space-y-10">
                
                {/* Visual Scoreboard (Exhilarating) */}
                <section className="relative h-[220px] rounded-[2.5rem] bg-gradient-to-br from-zinc-900 to-black border border-zinc-800/60 shadow-2xl overflow-hidden group">
                    <div className="absolute inset-0 z-0">
                         <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 blur-[80px] -translate-y-20 translate-x-20"></div>
                         <div className="absolute bottom-0 left-0 w-32 h-32 bg-zinc-800/20 blur-[50px] translate-y-20 -translate-x-10"></div>
                    </div>

                    <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                         <div className="flex justify-between items-start">
                             <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg overflow-hidden border-2 transition-all duration-300 ${gameState.possession === 'Osos' ? 'border-red-600 shadow-lg shadow-red-900/40 bg-red-600/20 scale-110' : 'border-transparent bg-zinc-800'}`}>
                                        <img src="/logo_osos.webp" alt="Osos" className={`w-full h-full object-contain p-1 ${gameState.possession === 'Osos' ? '' : 'grayscale'}`} />
                                    </div>
                                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${gameState.possession === 'Osos' ? 'text-white' : 'text-zinc-500'}`}>Osos</span>
                                </div>
                                <span className={`text-6xl font-display font-black leading-none italic italic transition-all duration-500 ${gameState.possession === 'Osos' ? 'text-white' : 'text-zinc-600 scale-90'}`}>
                                    {gameState.home_score}
                                </span>
                             </div>

                             <div className="text-xl font-display font-black text-zinc-800 mt-12 px-3 py-1 bg-zinc-950/40 border border-zinc-900 rounded-lg italic italic">VS</div>

                             <div className="flex flex-col items-end gap-3 text-right">
                                <div className="flex items-center gap-3 text-right">
                                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${gameState.possession !== 'Osos' ? 'text-white' : 'text-zinc-500'}`}>Águilas</span>
                                    <div className={`w-8 h-8 rounded-lg overflow-hidden border-2 transition-all duration-300 ${gameState.possession !== 'Osos' ? 'border-red-600 shadow-lg shadow-red-900/40 bg-red-600/20 scale-110' : 'border-transparent bg-zinc-800'}`}>
                                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center italic italic text-xl font-display font-black opacity-30 text-white">R</div>
                                    </div>
                                </div>
                                <span className={`text-6xl font-display font-black leading-none italic italic transition-all duration-500 ${gameState.possession !== 'Osos' ? 'text-white' : 'text-zinc-600 scale-90'}`}>
                                    {gameState.away_score}
                                </span>
                             </div>
                         </div>
                         
                         <div className="flex justify-center -mb-2">
                             <div className="flex items-center gap-3 bg-red-600/10 border border-red-600/20 px-4 py-1.5 rounded-full">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-sm shadow-red-500"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Live Status</span>
                             </div>
                         </div>
                    </div>
                </section>

                {/* Dashboard Stats (Time, Dist, Quarter) */}
                <section className="card grid grid-cols-3 divide-x divide-zinc-900 overflow-hidden">
                    <div className="py-6 flex flex-col items-center gap-1.5">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none">Cuarto</span>
                        <span className="text-xl font-display font-black uppercase italic italic text-red-600">{gameState.quarter}</span>
                    </div>
                    <div className="py-6 flex flex-col items-center gap-1.5">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none">Tiempo</span>
                        <span className="text-xl font-display font-black uppercase italic italic tabular-nums leading-none mt-0.5">{gameState.time_left}</span>
                    </div>
                    <div className="py-6 flex flex-col items-center gap-1.5">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none">Down & Dist</span>
                        <span className="text-base font-display font-black uppercase italic italic tracking-tight">{gameState.down_and_distance || '1ST & 10'}</span>
                    </div>
                </section>

                {/* Field Visual Simulation (Premium Touch) */}
                <section className="space-y-4">
                    <div className="flex justify-between items-center mb-6 px-1">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-600">Ubicación de Campo</h3>
                        <span className="text-[9px] font-black text-red-600 px-3 py-1 rounded bg-red-600/10 border border-red-600/15 uppercase">En Vivo</span>
                    </div>
                    <div className="h-16 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl relative overflow-hidden flex items-center px-4">
                         <div className="absolute inset-y-0 left-0 w-1/2 border-r border-zinc-900 border-dashed"></div>
                         <div className="flex justify-between w-full relative z-10 text-[8px] font-bold text-zinc-700 tracking-widest">
                             <span>PROPIOS 20</span>
                             <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-red-600 shadow-[0_0_10px_rgba(227,5,20,0.5)] flex items-center justify-center">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 2L4 5v11l8 3 8-3V5l-8-3z"/></svg>
                                </div>
                                <span>RIVAL 20</span>
                             </div>
                         </div>
                    </div>
                    <p className="text-xs font-medium text-zinc-500 leading-relaxed italic px-2">
                        {gameState.playLog[0]?.desc || 'Aguardando siguiente jugada en el campo...'}
                    </p>
                </section>

                {/* Real-time Play Log */}
                <section className="space-y-6">
                    <div className="flex justify-between items-end mb-4">
                        <h2 className="text-2xl font-display font-black uppercase italic italic tracking-tight">Jugadas Recientes</h2>
                        <div className="w-12 h-1 bg-red-600 opacity-20"></div>
                    </div>
                    
                    <div className="space-y-4">
                        {gameState.playLog.map((play, i) => (
                             <div key={play.id} className="card p-6 flex items-start gap-5 relative group overflow-hidden animate-fade">
                                 {i === 0 && <div className="absolute top-0 right-0 w-16 h-16 bg-red-600/5 blur-[40px] pointer-events-none"></div>}
                                 <div className="w-12 h-12 rounded-2xl bg-zinc-950 flex items-center justify-center p-3 border border-zinc-900 mt-1">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#e30514"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5l-3.5-3.5 1.41-1.41L13 13.67l4.09-4.09 1.41 1.41L13 16.5z"/></svg>
                                 </div>
                                 <div className="flex-1 space-y-2">
                                     <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">{play.type}</span>
                                        <span className="text-[9px] font-bold text-zinc-600 tracking-widest">{play.quarter} - {play.time}</span>
                                     </div>
                                     <h4 className="text-base font-display font-black uppercase italic italic leading-none">{play.desc}</h4>
                                     <p className="text-[11px] font-medium text-zinc-500 leading-relaxed pr-8 opacity-80">
                                        Actualización en vivo sincronizada desde el Match Control oficial.
                                     </p>
                                 </div>
                             </div>
                        ))}
                    </div>
                </section>

                <button className="btn-primary w-full py-5 rounded-[1.5rem] flex items-center justify-center gap-4 text-sm font-display font-black uppercase italic italic tracking-widest active:scale-[0.98]">
                    Ver Estadísticas Completas <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 20V10M12 20V4M6 20v-6"/><path d="M3 20h18" strokeWidth="2"/></svg>
                </button>

            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-zinc-900 pt-5 pb-9 px-8 z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
                <div className="max-w-md mx-auto flex justify-between items-center text-zinc-600">
                    <button className="flex flex-col items-center gap-1.5 text-red-600 active:scale-95 transition-all">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M8 12h8M12 8v8"/></svg>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">En Vivo</span>
                    </button>
                    <button className="flex flex-col items-center gap-1.5 active:scale-95">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Calendario</span>
                    </button>
                    <button className="flex flex-col items-center gap-1.5 active:scale-95">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Equipos</span>
                    </button>
                    <button className="flex flex-col items-center gap-1.5 active:scale-95">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 7v10M7 12h10"/></svg>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Perfil</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default GameCenter;
