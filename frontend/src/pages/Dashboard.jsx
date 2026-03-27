import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SvgIcon from '../components/SvgIcon';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState({
    nextMatch: null,
    lastResults: []
  });

  useEffect(() => {
    // Auth Check
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');

    const fetchMatches = async () => {
      try {
        const res = await fetch('/api/matches/dashboard');
        if (!res.ok) return; // Mantener estado default si hay error
        const data = await res.json();
        // Validar estructura antes de setear
        setDashboardData({
          nextMatch: data.nextMatch || null,
          lastResults: Array.isArray(data.lastResults) ? data.lastResults : []
        });
      } catch (err) {
        console.error('Data error', err);
        // Estado default ya está, no hay crash
      }
    };
    fetchMatches();
  }, [navigate]);

  const { nextMatch, lastResults } = dashboardData;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
    const hr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${day} ${hr} HRS`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  }

  return (
    <div className="bg-black min-h-screen text-white font-body pb-32 overflow-x-hidden selection:bg-red-600">
      <main className="max-w-md mx-auto px-6 py-8 space-y-10 animate-fade">
        
        {/* Header - App Style */}
        <header className="flex justify-between items-center bg-black/60 backdrop-blur-md sticky top-0 py-4 -mx-6 px-6 z-50 border-b border-zinc-900/50">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-2 shadow-xl overflow-hidden">
                 <img src="/logo_osos.webp" alt="Logo" className="w-full h-full object-contain" />
             </div>
             <div>
                <span className="text-[11px] font-black text-zinc-600 uppercase tracking-widest leading-none block">Portal Coach</span>
                <span className="text-[12px] font-display font-black uppercase italic italic text-red-600 tracking-tighter">Osos de Chiapas</span>
             </div>
          </div>
          <button onClick={handleLogout} className="text-zinc-600 hover:text-white transition-colors active:scale-90 p-1">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
          </button>
        </header>

        {/* Welcome Section */}
        <section className="pt-2">
           <div className="w-8 h-1 bg-red-600 mb-4"></div>
           <h1 className="text-4xl font-display font-black uppercase italic italic tracking-tight leading-none mb-1">
             <span className="text-gradient">¡Hola, Campeón!</span>
           </h1>
           <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">Semana de Playoffs Activa</p>
        </section>

        {/* Main "Game Center" App Card */}
        <section className="bg-red-600 rounded-[2rem] p-8 shadow-2xl shadow-red-900/40 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 blur-[60px] -translate-y-20 translate-x-20"></div>
           
           <div className="flex justify-between items-center mb-10 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-black/30 py-1 px-4 rounded-full border border-black/10">Próximo Partido</span>
              <div className="flex gap-1.5 h-1 items-center">
                 <div className="w-4 h-1 bg-white"></div>
                 <div className="w-2 h-1 bg-white opacity-40"></div>
                 <div className="w-1 h-1 bg-white opacity-20"></div>
              </div>
           </div>

           {nextMatch ? (
             <div className="flex flex-col items-center gap-10 relative z-10">
                <div className="flex items-center justify-between w-full relative">
                   <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/10 shadow-lg">
                         <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.1em]">Osos</span>
                   </div>
                   
                   <div className="flex flex-col items-center">
                      <div className="text-xl font-display font-black italic italic px-4 py-1 bg-black/20 rounded-lg text-white/50 tracking-tighter">V S</div>
                   </div>

                   <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-black/20 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-black/10 shadow-lg">
                         <span className="text-2xl font-display font-black italic italic opacity-60 truncate max-w-[40px] uppercase">R</span>
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.1em] truncate max-w-[60px]">{(nextMatch && nextMatch.visitor_name ? nextMatch.visitor_name : 'RIVAL').split(' ')[0]}</span>
                   </div>
                </div>
                <div className="text-center w-full bg-black/20 py-4 px-6 rounded-2xl border border-white/5">
                   <p className="text-lg font-display font-black uppercase tracking-widest leading-none mb-1">{formatDate(nextMatch.match_date)}</p>
                   <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">{nextMatch.home_stadium || 'Estadio Central'}</p>
                </div>
             </div>
           ) : (
             <div className="text-center py-10">
                <p className="font-display font-black uppercase italic italic text-white/40 tracking-widest">Aguardando Programación</p>
             </div>
           )}
        </section>

        {/* Action Grid (Native App Feel) */}
        <section className="grid grid-cols-4 gap-3">
           {[
             { label: 'Roster', icon: 'group', link: '/players/list' },
             { label: 'Pagos', icon: 'table', link: '#' },
             { label: 'Stats', icon: 'analytics', link: '#' },
             { label: 'Chat', icon: 'comment', link: '#' }
           ].map((item, i) => (
             <Link key={i} to={item.link} className="flex flex-col items-center gap-2.5 group active:scale-90 transition-all">
                <div className="w-[70px] h-[70px] card flex items-center justify-center border-zinc-800/60 shadow-md">
                   <SvgIcon src={`/icons/${item.icon}-svgrepo-com.svg`} className="w-7 h-7 text-zinc-500 group-hover:text-red-500 transition-colors" />
                </div>
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{item.label}</span>
             </Link>
           ))}
        </section>

        {/* Results Strip (Touch Friendly) */}
        <section className="pt-2">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-600 italic italic">Resultados Recientes</h3>
              <div className="w-8 h-px bg-zinc-900"></div>
           </div>
           <div className="flex gap-4 overflow-x-auto pb-6 -mx-6 px-6 no-scrollbar touch-pan-x">
              {lastResults.length > 0 ? lastResults.map(match => (
                <div key={match.id} className="min-w-[240px] card p-6 flex flex-col gap-6 active:border-red-600/30">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest bg-black/30 px-3 py-1 rounded-full border border-white/5">Sept 22</span>
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.15em] ${match.home_score > match.visitor_score ? 'bg-green-600/10 text-green-500' : 'bg-red-600/10 text-red-500'}`}>
                         {match.home_score > match.visitor_score ? 'Win' : 'Loss'}
                      </span>
                   </div>
                   <div className="space-y-4">
                       <div className="flex justify-between items-end">
                          <div className="flex flex-col">
                             <span className="text-xs font-black uppercase tracking-widest text-zinc-500 leading-none">Osos</span>
                             <span className="text-3xl font-display font-black italic italic leading-none">{match.home_score}</span>
                          </div>
                          <div className="text-[10px] font-black opacity-20 pb-1">VS</div>
                          <div className="flex flex-col items-end">
                             <span className="text-xs font-black uppercase tracking-widest text-zinc-500 leading-none truncate max-w-[80px]">{(match.visitor_name || 'RIVAL').split(' ')[0]}</span>
                             <span className="text-3xl font-display font-black italic italic leading-none">{match.visitor_score}</span>
                          </div>
                       </div>
                   </div>
                </div>
              )) : (
                <div className="text-center w-full py-8 text-zinc-600 text-xs font-black uppercase tracking-[0.2em] opacity-40 italic italic">Sin resultados históricos</div>
              )}
           </div>
        </section>

      </main>

      {/* Persistent Bottom Tab Bar (App Feel) */}
      <nav className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-zinc-900 px-6 pt-4 pb-8 z-50 rounded-t-3xl">
         <div className="max-w-md mx-auto flex justify-between items-center px-4">
            <Link to="/admin/dashboard" className={`flex flex-col items-center gap-1.5 ${location.pathname === '/admin/dashboard' ? 'text-red-600' : 'text-zinc-600'} active:scale-90 transition-all`}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill={location.pathname === '/admin/dashboard' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path d="M9 22V12h6v10"/></svg>
               <span className="text-[10px] font-black uppercase tracking-widest">Feed</span>
            </Link>
            <button className="flex flex-col items-center gap-1.5 text-zinc-600 active:scale-90 transition-all">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
               <span className="text-[10px] font-black uppercase tracking-widest">Agenda</span>
            </button>
            <div className="relative -top-10">
               <div className="w-16 h-16 bg-red-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-red-900/60 border-4 border-black active:scale-[0.85] transition-transform">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><path d="M12 5v14M5 12h14"/></svg>
               </div>
            </div>
            <button className="flex flex-col items-center gap-1.5 text-zinc-600 active:scale-90 transition-all relative">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
               <span className="absolute -top-1 right-2 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-black"></span>
               <span className="text-[10px] font-black uppercase tracking-widest">Inbox</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 text-zinc-600 active:scale-90 transition-all">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33-1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
               <span className="text-[10px] font-black uppercase tracking-widest">Config</span>
            </button>
         </div>
      </nav>
    </div>
  );
};

export default Dashboard;
