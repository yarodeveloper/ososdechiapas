import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SvgIcon from '../components/SvgIcon';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState({
    highlights: [], // Combined urgent and upcoming events
    lastResults: []
  });

  useEffect(() => {
    // Auth Check
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');

    const fetchMatches = async () => {
      try {
        const [nextRes, pastRes] = await Promise.all([
          fetch('/api/calendar'),
          fetch('/api/calendar?history=true')
        ]);
        const nextData = await nextRes.json();
        const pastData = await pastRes.json();
        
        const highlights = [];
        
        // 1. Prioritize past matches without stats (Urgent Action for Coach)
        const pendingStats = pastData.filter(e => e.event_type === 'match' && (e.stats_count === 0 || !e.score_osos));
        pendingStats.slice(0, 2).forEach(m => highlights.push({ ...m, isPast: true, urgent: true }));

        // 2. Add the most immediate upcoming events (Next 3)
        // Ensure we don't repeat the urgent ones if they happen to be in nextData
        const upcoming = nextData
          .filter(e => !highlights.some(h => h.id === e.id))
          .slice(0, 3);
        
        upcoming.forEach(e => highlights.push({ ...e, isPast: false }));

        setDashboardData({
          highlights: highlights,
          lastResults: Array.isArray(pastData) ? pastData.slice(0, 3) : []
        });
      } catch (err) {
        console.error('Data error', err);
      }
    };
    fetchMatches();
  }, [navigate]);

  const { highlights, lastResults } = dashboardData;
  const currentHighlight = highlights[0]; // For now showing the most urgent, could be a slider later

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
    <div className="min-h-screen font-body pb-32 overflow-x-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
      <main className="max-w-md mx-auto px-6 py-8 space-y-10 animate-fade">
        
        {/* Header - App Style */}
        <header className="flex justify-between items-center sticky top-0 py-4 -mx-6 px-6 z-50 border-b backdrop-blur-md transition-colors" style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-main)' }}>
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-white border flex items-center justify-center p-2 shadow-sm overflow-hidden" style={{ borderColor: 'var(--border-main)' }}>
                 <img src="/logo_osos.webp" alt="Logo" className="w-full h-full object-contain" />
             </div>
             <div>
                <span className="text-[11px] font-black uppercase tracking-widest leading-none block" style={{ color: 'var(--text-dim)' }}>Panel Coach</span>
                <span className="text-[12px] font-display font-black uppercase italic text-red-600 tracking-tighter">Administración</span>
             </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-11 h-11 rounded-2xl flex items-center justify-center border transition-all active:scale-90" 
            style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)', color: 'var(--text-dim)' }}
          >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 01-2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        </header>

        {/* Welcome Section */}
        <section className="pt-2">
           <div className="w-8 h-1 bg-red-600 mb-4"></div>
           <h1 className="text-4xl font-display font-black uppercase italic tracking-tight leading-none mb-1">
             <span className="bg-gradient-to-br from-zinc-900 via-zinc-700 to-zinc-500 bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to bottom right, var(--text-main), var(--text-dim))' }}>Gestión Deportiva</span>
           </h1>
           <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>Control Total del Club</p>
        </section>

        {/* Main Smart Agenda Carousel */}
        <section className="space-y-6">
           <div className="flex justify-between items-end">
              <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none" style={{ color: 'var(--text-dim)' }}>Agenda de Hoy</h3>
              <div className="flex gap-1.5">
                 {highlights.map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full transition-all" style={{ backgroundColor: i === 0 ? 'var(--primary)' : 'var(--border-main)', width: i === 0 ? '12px' : '6px' }}></div>
                 ))}
              </div>
           </div>

           <div className="flex gap-6 overflow-x-auto no-scrollbar -mx-6 px-6 snap-x snap-mandatory pb-4">
              {highlights.length > 0 ? highlights.map((item, idx) => (
                 <div key={idx} className="min-w-[320px] snap-center relative group">
                    <div className={`absolute -inset-1 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 ${item.urgent ? 'bg-red-600' : 'bg-zinc-600'}`}></div>
                    <div className="card relative p-8 space-y-6 overflow-hidden border-2" style={{ borderColor: 'var(--border-main)' }}>
                       <div className="absolute top-0 right-0 p-8 opacity-5">
                          <SvgIcon src={`/icons/${item.event_type === 'match' ? 'ball-rugby' : (item.event_type === 'training' ? 'gym-dumbbell' : 'compass')}-svgrepo-com.svg`} className="w-24 h-24" />
                       </div>

                       <div className="space-y-1">
                          <span className={`text-[10px] font-black uppercase tracking-[0.4em] italic ${item.urgent ? 'text-white bg-red-600 px-2 py-0.5 rounded' : 'text-red-500'}`}>
                             {item.urgent ? '⚠️ Acción Requerida' : (item.event_type === 'match' ? 'Próximo Encuentro' : 'Próxima Actividad')}
                          </span>
                          <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-tight truncate" style={{ color: 'var(--text-main)' }}>
                             {item.title}
                          </h2>
                          <div className="flex items-center gap-2 mt-2">
                             <span className={`w-2 h-2 rounded-full animate-pulse ${item.urgent ? 'bg-red-500' : 'bg-red-600'}`}></span>
                             <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
                                {item.isPast ? 'Finalizado el ' : ''}{new Date(item.start_time).toLocaleString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                             </span>
                          </div>
                       </div>

                       <div className="flex items-center justify-between gap-4 pt-4">
                          <div className="flex-1 flex flex-col items-center gap-3 text-center">
                             <div className="w-16 h-16 rounded-2xl bg-white border-2 flex items-center justify-center p-2 shadow-inner overflow-hidden" style={{ borderColor: 'var(--border-main)' }}>
                                <img src="/logo_osos.webp" alt="Osos" className="w-full h-full object-contain" />
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-widest leading-none" style={{ color: 'var(--text-main)' }}>Osos <br/><span className="text-[7px] opacity-40">{item.category_name}</span></span>
                          </div>
                          
                          <div className="px-4 py-2 bg-red-600/10 rounded-full border border-red-600/20">
                             <span className="text-xs font-black italic uppercase text-red-600">
                                {item.event_type === 'match' ? 'VS' : '•'}
                             </span>
                          </div>

                          <div className="flex-1 flex flex-col items-center gap-3 text-center">
                             <div className="w-16 h-16 rounded-2xl bg-white border-2 flex items-center justify-center p-2 shadow-inner overflow-hidden" style={{ borderColor: 'var(--border-main)' }}>
                                {item.event_type === 'match' ? (
                                  <div className="w-full h-full flex items-center justify-center bg-zinc-50 font-display font-black text-2xl text-zinc-300">
                                     {item.rival_name ? item.rival_name[0] : '?'}
                                  </div>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-zinc-50">
                                     <SvgIcon src={`/icons/${item.event_type === 'training' ? 'gym-dumbbell' : 'compass'}-svgrepo-com.svg`} className="w-8 h-8 text-zinc-300" />
                                  </div>
                                )}
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-widest leading-none truncate w-full" style={{ color: 'var(--text-main)' }}>
                                {item.event_type === 'match' ? (item.rival_name || 'RIVAL') : item.location_name || 'CAMPO'}
                             </span>
                          </div>
                       </div>

                       <button 
                         onClick={() => navigate(item.urgent ? `/admin/matches/${item.id}/stats` : '/admin/calendar')} 
                         className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all ${item.urgent ? 'bg-white text-red-600 shadow-white/10' : 'bg-red-600 text-white shadow-red-900/40'}`}
                       >
                          {item.urgent ? 'Llenar Estadísticas 🏈' : 'Ver detalles en Agenda'}
                       </button>
                    </div>
                 </div>
              )) : (
                 <div className="w-full card p-12 text-center opacity-40 border-dashed border-2" style={{ borderColor: 'var(--border-main)' }}>
                    <p className="text-[10px] font-black uppercase tracking-widest">Sin actividades programadas</p>
                 </div>
              )}
           </div>
        </section>

        {/* Action Grid (Native App Feel) */}
        <section className="grid grid-cols-4 gap-3">
           {[
             { label: 'Roster', icon: 'group', link: '/players/list' },
             { label: 'Pagos', icon: 'table', link: '/admin/payments' },
             { label: 'Stats', icon: 'analytics', link: '/estadisticas' },
             { label: 'Avisos', icon: 'comment', link: '/admin/announcements' }
           ].map((item, i) => (
             <Link key={i} to={item.link} className="flex flex-col items-center gap-2.5 group active:scale-90 transition-all">
                <div className="w-[70px] h-[70px] rounded-3xl flex items-center justify-center shadow-sm group-hover:border-red-500 transition-all border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                   <SvgIcon src={`/icons/${item.icon}-svgrepo-com.svg`} className="w-7 h-7 transition-colors" style={{ color: 'var(--text-dim)' }} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-red-600 transition-colors" style={{ color: 'var(--text-dim)' }}>{item.label}</span>
             </Link>
           ))}
        </section>

        {/* Results Strip (Touch Friendly) */}
        <section className="pt-2">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] italic italic" style={{ color: 'var(--text-dim)' }}>Resultados Recientes</h3>
              <div className="w-8 h-px" style={{ backgroundColor: 'var(--border-main)' }}></div>
           </div>
           <div className="flex gap-4 overflow-x-auto pb-6 -mx-6 px-6 no-scrollbar touch-pan-x">
              {lastResults.length > 0 ? lastResults.map(match => (
                 <div key={match.id} className="card min-w-[240px] p-6 relative overflow-hidden group/card active:scale-[0.98] transition-transform">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                       <SvgIcon src="/icons/trophy-svgrepo-com.svg" className="w-12 h-12 text-white" />
                    </div>
                    
                    <div className="flex justify-between items-start mb-4">
                       <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-red-600 text-white rounded-md">{match.category_name}</span>
                       <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>{new Date(match.match_date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}</span>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-end">
                           <div className="flex flex-col">
                              <span className="text-xs font-black uppercase tracking-widest leading-none" style={{ color: 'var(--text-dim)' }}>Osos</span>
                              <span className="text-3xl font-display font-black italic leading-none" style={{ color: 'var(--text-main)' }}>{match.score_osos || 0}</span>
                           </div>
                           <div className="text-[10px] font-black opacity-20 pb-1">VS</div>
                           <div className="flex flex-col items-end">
                              <span className="text-xs font-black uppercase tracking-widest leading-none truncate max-w-[80px]" style={{ color: 'var(--text-dim)' }}>{(match.rival_name || 'RIVAL').split(' ')[0]}</span>
                              <span className="text-3xl font-display font-black italic leading-none" style={{ color: 'var(--text-main)' }}>{match.score_rival || 0}</span>
                           </div>
                        </div>
                       
                       <Link 
                          to={`/admin/matches/${match.id}/stats`}
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border hover:border-red-600 transition-colors group/btn shadow-sm"
                          style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)' }}
                       >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover/btn:text-red-500 transition-colors" style={{ color: 'var(--text-dim)' }}>
                             <path d="M12 20V10M18 20V4M6 20v-6" />
                          </svg>
                          <span className={`${match.stats_count > 0 ? 'text-red-600' : ''} text-[9px] font-black uppercase tracking-widest group-hover/btn:text-red-600 transition-colors`} style={{ color: match.stats_count > 0 ? 'text-red-600' : 'var(--text-dim)' }}>{match.stats_count > 0 ? 'Editar Stats' : 'Registrar Stats'}</span>
                       </Link>
                    </div>
                 </div>
              )) : (
                <div className="text-center w-full py-8 text-xs font-black uppercase tracking-[0.2em] opacity-60 italic italic" style={{ color: 'var(--text-dim)' }}>Sin resultados históricos</div>
              )}
           </div>
        </section>
      </main>

      {/* Persistent Bottom Tab Bar (App Feel) */}
      <nav className="fixed bottom-0 left-0 w-full backdrop-blur-xl border-t px-6 pt-4 pb-8 z-50 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.08)] transition-colors" style={{ backgroundColor: 'var(--nav-bg)', borderColor: 'var(--border-main)' }}>
         <div className="max-w-md mx-auto flex justify-between items-center px-4">
            <Link to="/admin/dashboard" className={`flex flex-col items-center gap-1.5 ${location.pathname === '/admin/dashboard' ? 'text-red-600' : ''} active:scale-90 transition-all`} style={{ color: location.pathname === '/admin/dashboard' ? '#dc2626' : 'var(--text-dim)' }}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill={location.pathname === '/admin/dashboard' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path d="M9 22V12h6v10"/></svg>
               <span className="text-[10px] font-black uppercase tracking-widest">Feed</span>
            </Link>
            <Link to="/admin/calendar" className={`flex flex-col items-center gap-1.5 ${location.pathname === '/admin/calendar' ? 'text-red-600' : ''} active:scale-90 transition-all`} style={{ color: location.pathname === '/admin/calendar' ? '#dc2626' : 'var(--text-dim)' }}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill={location.pathname === '/admin/calendar' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
               <span className="text-[10px] font-black uppercase tracking-widest">Agenda</span>
            </Link>
            <div className="relative -top-10">
               <div className="w-16 h-16 bg-red-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-red-900/40 border-4 active:scale-[0.85] transition-transform" style={{ borderColor: 'var(--bg-main)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><path d="M12 5v14M5 12h14"/></svg>
               </div>
            </div>
            <Link to="/admin/announcements" className={`flex flex-col items-center gap-1.5 ${location.pathname === '/admin/announcements' ? 'text-red-600' : ''} active:scale-90 transition-all relative`} style={{ color: location.pathname === '/admin/announcements' ? '#dc2626' : 'var(--text-dim)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill={location.pathname === '/admin/announcements' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2" style={{ borderColor: 'var(--bg-main)' }}></span>
                <span className="text-[10px] font-black uppercase tracking-widest">Inbox</span>
             </Link>
            <Link to="/admin/settings" className={`flex flex-col items-center gap-1.5 ${location.pathname === '/admin/settings' ? 'text-red-600' : ''} active:scale-90 transition-all`} style={{ color: location.pathname === '/admin/settings' ? '#dc2626' : 'var(--text-dim)' }}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill={location.pathname === '/admin/settings' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33-1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
               <span className="text-[10px] font-black uppercase tracking-widest">Config</span>
            </Link>
         </div>
      </nav>
    </div>
  );
};

export default Dashboard;
