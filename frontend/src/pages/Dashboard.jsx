import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SvgIcon from '../components/SvgIcon';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    lastResults: [],
    leadsCount: 0
  });
  const [highlights, setHighlights] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef(null);
  
  const [activeResultsIndex, setActiveResultsIndex] = useState(0);
  const resultsRef = useRef(null);

  const scrollToResults = (index) => {
    if (resultsRef.current && dashboardData.lastResults[index]) {
      setActiveResultsIndex(index);
      resultsRef.current.scrollTo({
        left: index * 276, // 260px card + 16px gap
        behavior: 'smooth'
      });
    }
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isCoach = user.role === 'coach';

  useEffect(() => {
    // Auth Check
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');

    const fetchDashboardData = async () => {
      try {
        const [nextRes, pastRes, leadsRes] = await Promise.all([
          fetch('/api/calendar'),
          fetch('/api/calendar?history=true'),
          fetch('/api/leads')
        ]);
        const nextData = await nextRes.json();
        const pastData = await pastRes.json();
        const leadsData = await leadsRes.json();
        
        const highlightsArr = [];
        const pendingStats = pastData.filter(e => e.event_type === 'match' && (e.stats_count === 0 || !e.score_osos));
        pendingStats.slice(0, 2).forEach(m => highlightsArr.push({ ...m, isPast: true, urgent: true }));
        const upcoming = nextData.filter(e => !highlightsArr.some(h => h.id === e.id)).slice(0, 3);
        upcoming.forEach(e => highlightsArr.push({ ...e, isPast: false }));

        setHighlights(highlightsArr);
        setDashboardData({
          lastResults: Array.isArray(pastData) ? pastData.slice(0, 8) : [],
          leadsCount: Array.isArray(leadsData) ? leadsData.filter(l => l.status === 'pending').length : 0
        });
      } catch (err) {
        console.error('Data error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Socket.io for Real-time Leads
    const socket = io('/');
    socket.on('new_lead', (data) => {
        setDashboardData(prev => ({ ...prev, leadsCount: prev.leadsCount + 1 }));
        if (Notification.permission === 'granted') {
            new Notification('¡Nuevo Prospecto!', { body: `${data.name} quiere unirse a la manada.` });
        }
    });

    return () => socket.disconnect();
  }, [navigate]);

  const handleScroll = () => {
    if (carouselRef.current && highlights.length > 0) {
        const scrollLeft = carouselRef.current.scrollLeft;
        const firstChild = carouselRef.current.children[0];
        if (firstChild) {
            const cardWidth = firstChild.offsetWidth + 24; 
            const newIndex = Math.round(scrollLeft / cardWidth);
            if (newIndex !== activeIndex) {
                setActiveIndex(newIndex);
            }
        }
    }
  };

  const scrollTo = (index) => {
    if (carouselRef.current && highlights.length > 0) {
        const firstChild = carouselRef.current.children[0];
        if (firstChild) {
            const cardWidth = firstChild.offsetWidth + 24;
            carouselRef.current.scrollTo({ left: cardWidth * index, behavior: 'smooth' });
            setActiveIndex(index);
        }
    }
  };

  const { lastResults } = dashboardData;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
    const hr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${day} ${hr} HRS`;
  };

  const [editScores, setEditScores] = useState({});

  const openScoreEditor = (match) => {
    setEditScores(prev => ({
      ...prev,
      [match.id]: { osos: match.score_osos ?? 0, rival: match.score_rival ?? 0, editing: true, saving: false }
    }));
  };

  const changeScore = (matchId, team, delta) => {
    setEditScores(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], [team]: Math.max(0, (prev[matchId]?.[team] ?? 0) + delta) }
    }));
  };

  const saveScore = async (matchId) => {
    const s = editScores[matchId];
    setEditScores(prev => ({ ...prev, [matchId]: { ...s, saving: true } }));
    try {
      await fetch(`/api/calendar/${matchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score_osos: s.osos, score_rival: s.rival })
      });
      setDashboardData(prev => ({
        ...prev,
        lastResults: prev.lastResults.map(m => m.id === matchId ? { ...m, score_osos: s.osos, score_rival: s.rival } : m)
      }));
      setEditScores(prev => ({ ...prev, [matchId]: { ...s, editing: false, saving: false } }));
    } catch {
      setEditScores(prev => ({ ...prev, [matchId]: { ...s, saving: false } }));
    }
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
              <div className="flex items-center gap-4">
                  {/* Left / Right scroll buttons for PC */}
                  {highlights?.length > 1 && (
                      <div className="hidden md:flex gap-2">
                          <button 
                              onClick={() => scrollTo(activeIndex - 1)} 
                              disabled={activeIndex === 0}
                              className="w-8 h-8 rounded-full flex items-center justify-center border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800"
                              style={{ borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                          >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                          </button>
                          <button 
                              onClick={() => scrollTo(activeIndex + 1)} 
                              disabled={activeIndex >= highlights.length - 1}
                              className="w-8 h-8 rounded-full flex items-center justify-center border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800"
                              style={{ borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                          >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                          </button>
                      </div>
                  )}
                  {/* Dots */}
                  <div className="flex gap-1.5 cursor-pointer">
                     {highlights?.map((_, i) => (
                        <div 
                           key={i} 
                           onClick={() => scrollTo(i)}
                           className="h-1.5 rounded-full transition-all" 
                           style={{ backgroundColor: i === activeIndex ? 'var(--primary)' : 'var(--border-main)', width: i === activeIndex ? '16px' : '6px' }}
                        ></div>
                     ))}
                  </div>
              </div>
           </div>

           <div 
               ref={carouselRef}
               onScroll={handleScroll}
               className="flex gap-6 overflow-x-auto no-scrollbar -mx-6 px-6 snap-x snap-mandatory pb-4 smooth-scroll"
           >
              {highlights?.length > 0 ? highlights.map((item, idx) => (
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
                         onClick={() => navigate((item.urgent && !isCoach) ? `/admin/matches/${item.id}/stats` : '/admin/calendar')} 
                         className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all ${(item.urgent && !isCoach) ? 'bg-white text-red-600 shadow-white/10' : 'bg-red-600 text-white shadow-red-900/40'}`}
                       >
                          {(item.urgent && !isCoach) ? 'Llenar Estadísticas 🏈' : 'Ver detalles en Agenda'}
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
             ...(!isCoach ? [{ label: 'Pagos', icon: 'table', link: '/admin/payments' }] : []),
             { label: 'Stats', icon: 'analytics', link: '/estadisticas' },
             { label: 'Avisos', icon: 'comment', link: '/admin/announcements' },
             ...(!isCoach ? [{ label: 'Prospectos', icon: 'target', link: '/admin/leads', count: dashboardData.leadsCount }] : [])
           ].map((item, i) => (
             <Link key={i} to={item.link} className="flex flex-col items-center gap-2.5 group active:scale-90 transition-all relative">
                <div className="w-[70px] h-[70px] rounded-3xl flex items-center justify-center shadow-sm group-hover:border-red-500 transition-all border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                   <SvgIcon src={`/icons/${item.icon}-svgrepo-com.svg`} className="w-7 h-7 transition-colors" style={{ color: 'var(--text-dim)' }} />
                </div>
                {item.count > 0 && (
                   <div className="absolute top-0 right-0 w-6 h-6 bg-red-600 rounded-full border-2 border-[var(--bg-main)] flex items-center justify-center text-[10px] font-black text-white shadow-lg animate-bounce">
                      {item.count}
                   </div>
                )}
                <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-red-600 transition-colors" style={{ color: 'var(--text-dim)' }}>{item.label}</span>
             </Link>
           ))}
        </section>

        {/* Results Strip (Touch Friendly) */}
        <section className="pt-2">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] italic" style={{ color: 'var(--text-dim)' }}>Resultados Recientes</h3>
              <div className="flex items-center gap-4">
                 {dashboardData.lastResults?.length > 1 && (
                    <div className="hidden md:flex gap-2">
                       <button 
                          onClick={() => scrollToResults(activeResultsIndex - 1)} 
                          disabled={activeResultsIndex === 0}
                          className="w-8 h-8 rounded-full flex items-center justify-center border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800"
                          style={{ borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                       >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 19l-7-7 7-7" /></svg>
                       </button>
                       <button 
                          onClick={() => scrollToResults(activeResultsIndex + 1)} 
                          disabled={activeResultsIndex === dashboardData.lastResults.length - 1}
                          className="w-8 h-8 rounded-full flex items-center justify-center border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800"
                          style={{ borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                       >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 5l7 7-7 7" /></svg>
                       </button>
                    </div>
                 )}
                 <div className="w-8 h-px md:hidden" style={{ backgroundColor: 'var(--border-main)' }}></div>
              </div>
           </div>
           <div ref={resultsRef} className="flex gap-4 overflow-x-auto pb-6 -mx-6 px-6 no-scrollbar touch-pan-x smooth-scroll">
              {dashboardData.lastResults?.length > 0 ? dashboardData.lastResults.map(match => {
                 const es = editScores[match.id];
                 const isEditing = es?.editing;
                 const isSaving = es?.saving;
                 const displayOsos = isEditing ? es.osos : (match.score_osos ?? '—');
                 const displayRival = isEditing ? es.rival : (match.score_rival ?? '—');
                 const hasScore = match.score_osos != null;

                 return (
                    <div key={match.id} className="min-w-[260px] relative overflow-hidden rounded-[2rem] transition-all"
                       style={{
                          backgroundColor: 'var(--bg-card)',
                          border: isEditing ? '2px solid var(--primary)' : '1px solid var(--border-main)',
                          boxShadow: isEditing ? '0 0 0 4px rgba(220,38,38,0.1)' : 'none'
                       }}>
                       <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>
                       </div>

                       <div className="p-5 space-y-4 relative z-10">
                          <div className="flex justify-between items-start">
                             <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-red-600 text-white rounded-md">{match.category_name}</span>
                             <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
                                {new Date(match.start_time).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                             </span>
                          </div>

                          {!isEditing ? (
                             <button className={`w-full text-left ${isCoach ? '' : 'group'}`} onClick={() => !isCoach && openScoreEditor(match)} disabled={isCoach}>
                                <div className="flex justify-between items-end">
                                   <div className="flex flex-col">
                                      <span className="text-[9px] font-black uppercase tracking-widest leading-none mb-1" style={{ color: 'var(--text-dim)' }}>Osos</span>
                                      <span className="text-4xl font-display font-black italic leading-none" style={{ color: 'var(--text-main)' }}>{displayOsos}</span>
                                   </div>
                                   <div className="flex flex-col items-center pb-1">
                                      <span className="text-[10px] font-black opacity-30">-</span>
                                      {!hasScore && (
                                         <span className="text-[7px] font-black uppercase tracking-widest mt-1 px-1.5 py-0.5 rounded-full animate-pulse"
                                            style={{ backgroundColor: 'rgba(220,38,38,0.15)', color: 'var(--primary)' }}>
                                            Sin marcador
                                         </span>
                                      )}
                                   </div>
                                   <div className="flex flex-col items-end">
                                      <span className="text-[9px] font-black uppercase tracking-widest leading-none mb-1 truncate max-w-[80px]" style={{ color: 'var(--text-dim)' }}>
                                         {(match.rival_name || 'RIVAL').split(' ')[0]}
                                      </span>
                                      <span className="text-4xl font-display font-black italic leading-none" style={{ color: 'var(--text-main)' }}>{displayRival}</span>
                                   </div>
                                </div>
                             </button>
                          ) : (
                             <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                   <span className="text-[9px] font-black uppercase tracking-widest w-14" style={{ color: 'var(--text-dim)' }}>Osos</span>
                                   <div className="flex items-center gap-2">
                                      <button onClick={() => changeScore(match.id, 'osos', -1)}
                                         className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-800 text-zinc-100 font-black">-</button>
                                      <span className="text-xl font-display font-black italic w-8 text-center">{es.osos}</span>
                                      <button onClick={() => changeScore(match.id, 'osos', 1)}
                                         className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-600 text-white font-black">+</button>
                                   </div>
                                </div>
                                <div className="flex items-center justify-between">
                                   <span className="text-[9px] font-black uppercase tracking-widest w-14 truncate" style={{ color: 'var(--text-dim)' }}>
                                      {(match.rival_name || 'RIVAL').split(' ')[0]}
                                   </span>
                                   <div className="flex items-center gap-2">
                                      <button onClick={() => changeScore(match.id, 'rival', -1)}
                                         className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-800 text-zinc-100 font-black">-</button>
                                      <span className="text-xl font-display font-black italic w-8 text-center">{es.rival}</span>
                                      <button onClick={() => changeScore(match.id, 'rival', 1)}
                                         className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-800 text-zinc-100 font-black">+</button>
                                   </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                   <button onClick={() => setEditScores(prev => ({ ...prev, [match.id]: { ...es, editing: false } }))}
                                      className="flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border"
                                      style={{ borderColor: 'var(--border-main)', color: 'var(--text-dim)' }}>
                                      Cancelar
                                   </button>
                                   <button onClick={() => saveScore(match.id)} disabled={isSaving}
                                      className="flex-[2] py-2 rounded-xl text-[8px] font-black uppercase tracking-widest bg-red-600 text-white flex items-center justify-center gap-1">
                                      {isSaving ? '...' : 'Guardar'}
                                   </button>
                                </div>
                             </div>
                          )}
                          
                          {!isCoach && (
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
                          )}
                       </div>
                    </div>
                 );
              }) : (
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
            {/* Add button removed as requested */}
            <Link to="/admin/announcements" className={`flex flex-col items-center gap-1.5 ${location.pathname === '/admin/announcements' ? 'text-red-600' : ''} active:scale-90 transition-all relative`} style={{ color: location.pathname === '/admin/announcements' ? '#dc2626' : 'var(--text-dim)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill={location.pathname === '/admin/announcements' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2" style={{ borderColor: 'var(--bg-main)' }}></span>
                <span className="text-[10px] font-black uppercase tracking-widest">Inbox</span>
             </Link>
            {!isCoach && (
               <Link to="/admin/settings" className={`flex flex-col items-center gap-1.5 ${location.pathname === '/admin/settings' ? 'text-red-600' : ''} active:scale-90 transition-all`} style={{ color: location.pathname === '/admin/settings' ? '#dc2626' : 'var(--text-dim)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={location.pathname === '/admin/settings' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33-1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">Config</span>
               </Link>
            )}
         </div>
      </nav>
    </div>
  );
};

export default Dashboard;
