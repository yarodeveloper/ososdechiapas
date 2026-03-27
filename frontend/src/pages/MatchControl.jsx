import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

const MatchControl = () => {
    const { id: matchId } = useParams();
    const navigate = useNavigate();
    
    // Game State
    const [homeScore, setHomeScore] = useState(0);
    const [awayScore, setAwayScore] = useState(0);
    const [quarter, setQuarter] = useState('1Q');
    const [possession, setPossession] = useState('Osos');
    const [timeLeft, setTimeLeft] = useState(900); // 15:00 default
    const [isRunning, setIsRunning] = useState(false);
    const [playLog, setPlayLog] = useState([]);

    const timerRef = useRef(null);

    // Initial Fetch
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetch(`/api/matches/details/${matchId}`);
                const data = await res.json();
                if (data) {
                    setHomeScore(data.home_score);
                    setAwayScore(data.visitor_score);
                    setQuarter(data.current_quarter || '1Q');
                    setPossession(data.possession || 'Osos');
                    setPlayLog(data.playLog || []);
                    // Parse time_left (MM:SS) to seconds
                    const parts = (data.time_left || '15:00').split(':');
                    setTimeLeft(parseInt(parts[0]) * 60 + parseInt(parts[1]));
                }
            } catch (err) { console.error('Error fetching details', err); }
        };
        fetchDetails();
        socket.emit('join_match', matchId);
    }, [matchId]);

    // Sync to backend and sockets
    const syncState = async (newState = {}, isPersistent = false) => {
        const currentHome = newState.homeScore ?? homeScore;
        const currentAway = newState.awayScore ?? awayScore;
        const currentTime = formatTime(newState.timeLeft ?? timeLeft);
        const currentQuarter = newState.quarter ?? quarter;
        const currentPossession = newState.possession ?? possession;
        const currentLog = newState.playLog ?? playLog;

        const fullState = {
            matchId,
            home_score: currentHome,
            away_score: currentAway,
            time_left: currentTime,
            current_quarter: currentQuarter,
            possession: currentPossession,
            playLog: currentLog
        };

        // 1. Emit to Sockets (Instant)
        socket.emit('update_match_state', fullState);

        // 2. Persist to DB if requested (On scoring or manual actions)
        if (isPersistent) {
            try {
                await fetch(`/api/matches/update-live/${matchId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...fullState,
                        new_play: newState.new_play || null
                    })
                });
            } catch (err) { console.error('Persistence error', err); }
        }
    };

    // Clock Logic
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    const newTime = prev - 1;
                    syncState({ timeLeft: newTime });
                    return newTime;
                });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
            if (!isRunning) syncState({}, true); // Persist clock stop
        }
        return () => clearInterval(timerRef.current);
    }, [isRunning]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const addScore = (team, points, type) => {
        let newHome = homeScore;
        let newAway = awayScore;
        if (team === 'home') newHome += points;
        else newAway += points;

        const newLogEntry = {
            id: Date.now(),
            type: type,
            team: team === 'home' ? 'Osos' : 'Águilas',
            desc: `${type === 'TOUCHDOWN' ? 'Anotación de' : 'Puntos para'} ${team === 'home' ? 'Osos' : 'Águilas'}`,
            time: formatTime(timeLeft),
            quarter: quarter,
            points: `+${points}`
        };

        const newPlayLog = [newLogEntry, ...playLog];
        
        setHomeScore(newHome);
        setAwayScore(newAway);
        setPlayLog(newPlayLog);
        
        syncState({ 
            homeScore: newHome, 
            awayScore: newAway, 
            playLog: newPlayLog,
            new_play: {
                type,
                desc: newLogEntry.desc,
                score_change: points,
                team: newLogEntry.team
            }
        }, true);
    };

    const toggleClock = () => {
        setIsRunning(!isRunning);
    };

    return (
        <div className="bg-[#0a0a0a] min-h-screen text-white font-body pb-24 overflow-x-hidden">
            <header className="flex justify-between items-center px-6 py-5 border-b border-zinc-900 bg-black/60 backdrop-blur-md sticky top-0 z-50">
                <button onClick={() => navigate('/admin/dashboard')} className="text-zinc-400">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">Match Control</span>
                    <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-600'}`}></div>
                         <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{isRunning ? 'Clock Running' : 'Clock Paused'}</span>
                    </div>
                </div>
                <button className="text-zinc-600"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg></button>
            </header>

            <main className="max-w-md mx-auto px-6 py-8 space-y-8 animate-fade">
                
                <section className="bg-zinc-900/50 border border-zinc-800/60 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[50px] -translate-y-16 translate-x-16"></div>
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 block mb-6">Marcador en Vivo</span>
                    
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-3xl font-display font-black italic italic tracking-tighter uppercase">Osos</span>
                            <span className="text-6xl font-display font-black italic italic leading-none">{homeScore}</span>
                        </div>
                        <div className="text-xl font-display font-black text-red-600 italic italic pb-2 opacity-50">VS</div>
                        <div className="flex flex-col items-end">
                            <span className="text-3xl font-display font-black italic italic tracking-tighter uppercase text-zinc-400">Rival</span>
                            <span className="text-6xl font-display font-black italic italic leading-none text-zinc-400">{awayScore}</span>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-2 gap-4">
                    <div className="card p-5 flex flex-col justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-4 text-center">Periodo</span>
                        <div className="grid grid-cols-2 gap-2">
                           {['1Q', '2Q', '3Q', '4Q'].map(q => (
                               <button 
                                key={q}
                                onClick={() => {setQuarter(q); syncState({quarter: q}, true)}}
                                className={`py-2 rounded-lg text-[10px] font-black transition-all ${quarter === q ? 'bg-red-600 text-white shadow-lg' : 'bg-zinc-800 text-zinc-500'}`}
                               >
                                   {q}
                               </button>
                           ))}
                        </div>
                    </div>
                    <div className="card p-5 flex flex-col items-center justify-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Reloj</span>
                        <span className="text-4xl font-display font-black uppercase italic italic tracking-tighter tabular-nums leading-none">
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </section>

                <button 
                  onClick={toggleClock}
                  className={`w-full py-6 rounded-3xl font-display font-black uppercase italic italic tracking-widest text-xl flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl ${isRunning ? 'bg-zinc-800 text-red-600 shadow-zinc-900/50' : 'bg-red-600 text-white shadow-red-900/40'}`}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        {isRunning ? <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/> : <path d="M8 5v14l11-7z"/>}
                    </svg>
                    {isRunning ? 'Pausar Reloj' : 'Iniciar Reloj'}
                </button>

                <section className="space-y-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 text-center block leading-none">Posesión de Balón</span>
                    <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800/60 p-2">
                        <button 
                            onClick={() => {setPossession('Osos'); syncState({possession: 'Osos'}, true)}}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${possession === 'Osos' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500'}`}
                        >
                            Osos Ball
                        </button>
                        <button 
                             onClick={() => {setPossession('Águilas'); syncState({possession: 'Águilas'}, true)}}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${possession === 'Águilas' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                        >
                            Rival Ball
                        </button>
                    </div>
                </section>

                <section className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                             <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Osos Scoring</span>
                        </div>
                        <button onClick={() => addScore('home', 6, 'TOUCHDOWN')} className="btn-primary w-full py-10 rounded-3xl group active:opacity-90">
                             <div className="flex flex-col items-center">
                                <span className="text-3xl leading-none">+6</span>
                                <span className="text-[8px] font-bold tracking-widest opacity-60">TOUCHDOWN</span>
                             </div>
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => addScore('home', 3, 'FG')} className="card w-full py-6 flex flex-col items-center active:scale-95">
                                <span className="text-xl font-display italic italic">+3</span>
                                <span className="text-[7px] font-bold tracking-widest text-zinc-500 uppercase">FG</span>
                            </button>
                            <button onClick={() => addScore('home', 2, 'SAFETY')} className="card w-full py-6 flex flex-col items-center active:scale-95">
                                <span className="text-xl font-display italic italic">+2</span>
                                <span className="text-[7px] font-bold tracking-widest text-zinc-500 uppercase leading-tight">SAFETY/2PT</span>
                            </button>
                        </div>
                        <button onClick={() => addScore('home', 1, 'PAT')} className="card w-full py-4 flex items-center justify-center gap-3 active:scale-95">
                            <span className="text-lg font-display italic italic">+1</span>
                            <span className="text-[7px] font-bold tracking-widest text-zinc-500 uppercase mt-1">PAT</span>
                        </button>
                    </div>

                    <div className="space-y-3 opacity-80">
                         <div className="flex items-center justify-end gap-2 mb-2">
                             <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Rival Scoring</span>
                        </div>
                        <button onClick={() => addScore('away', 6, 'TOUCHDOWN')} className="card w-full py-10 rounded-3xl group border-zinc-700 active:bg-zinc-800">
                             <div className="flex flex-col items-center">
                                <span className="text-3xl leading-none text-zinc-400">+6</span>
                                <span className="text-[8px] font-bold tracking-widest opacity-40">TOUCHDOWN</span>
                             </div>
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => addScore('away', 3, 'FG')} className="card w-full py-6 flex flex-col items-center active:scale-95">
                                <span className="text-xl font-display italic italic text-zinc-400">+3</span>
                                <span className="text-[7px] font-bold tracking-widest text-zinc-500 uppercase">FG</span>
                            </button>
                            <button onClick={() => addScore('away', 2, 'SAFETY')} className="card w-full py-6 flex flex-col items-center active:scale-95">
                                <span className="text-xl font-display italic italic text-zinc-400">+2</span>
                                <span className="text-[7px] font-bold tracking-widest text-zinc-500 uppercase leading-tight">SAFETY/2PT</span>
                            </button>
                        </div>
                        <button onClick={() => addScore('away', 1, 'PAT')} className="card w-full py-4 flex items-center justify-center gap-3 active:scale-95">
                            <span className="text-lg font-display italic italic text-zinc-400">+1</span>
                            <span className="text-[7px] font-bold tracking-widest text-zinc-500 uppercase mt-1">PAT</span>
                        </button>
                    </div>
                </section>

                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Historial de Jugadas</h3>
                        <div className="w-12 h-px bg-zinc-900"></div>
                    </div>
                    <div className="space-y-4">
                        {playLog.map(play => (
                            <div key={play.id} className="card p-5 flex items-center justify-between group overflow-hidden relative">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 opacity-30"></div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#e30514"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5l-3.5-3.5 1.41-1.41L13 13.67l4.09-4.09 1.41 1.41L13 16.5z"/></svg>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black uppercase italic italic tracking-tight">{play.team} {play.play_type || play.type}</h4>
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{play.time_left || play.time} {play.quarter} • {play.description || play.desc}</p>
                                    </div>
                                </div>
                                <span className="text-xl font-display font-black italic italic text-red-500">{play.score_change ? `+${play.score_change}` : play.points}</span>
                            </div>
                        ))}
                    </div>
                </section>

            </main>

            <nav className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-zinc-900 px-8 py-4 z-50">
               <div className="max-w-md mx-auto flex justify-between items-center">
                    <button className="flex flex-col items-center gap-1.5 text-zinc-600">
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                         <span className="text-[8px] font-black uppercase tracking-widest">Partidos</span>
                    </button>
                    <button className="flex flex-col items-center gap-1.5 text-red-600">
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 15l-3.5-3.5 1.41-1.41L12 15.17l4.09-4.09 1.41 1.41L12 18z"/></svg>
                         <span className="text-[8px] font-black uppercase tracking-widest">En Vivo</span>
                    </button>
                    <button className="flex flex-col items-center gap-1.5 text-zinc-600">
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                         <span className="text-[8px] font-black uppercase tracking-widest">Stats</span>
                    </button>
                    <button className="flex flex-col items-center gap-1.5 text-zinc-600">
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33-1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                         <span className="text-[8px] font-black uppercase tracking-widest">Config</span>
                    </button>
               </div>
            </nav>
        </div>
    );
};

export default MatchControl;
