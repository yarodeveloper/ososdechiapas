import React, { useEffect, useState } from 'react';
import SvgIcon from '../components/SvgIcon';
import { Link, useNavigate } from 'react-router-dom';

const PlayerList = () => {
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();

  const fetchPlayers = async () => {
    try {
      const res = await fetch('/api/players');
      const data = await res.json();
      setPlayers(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  return (
    <div className="bg-black text-white font-body min-h-screen selection:bg-red-600/30">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-black/80 backdrop-blur-xl border-b border-zinc-900 z-50">
        <div className="max-w-md mx-auto px-6 py-5 flex justify-between items-center">
            <button onClick={() => navigate('/admin/dashboard')} className="text-red-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <span className="font-display font-black text-xs uppercase tracking-[0.2em] italic italic">Roster Oficial</span>
            <button className="text-zinc-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-24 pb-32 animate-fade">
        {/* Title Section */}
        <div className="mb-10">
          <div className="w-12 h-1 bg-red-600 mb-4"></div>
          <h1 className="text-4xl font-display font-black uppercase italic italic leading-none mb-2">Directorio de <br /><span className="text-gradient">Jugadores</span></h1>
          <p className="text-zinc-500 text-sm font-medium">Gestiona el talento de la manada.</p>
        </div>

        {/* Player List */}
        <div className="space-y-4">
          {players.map((player) => (
            <div key={player.id} className="card p-4 flex justify-between items-center group cursor-pointer active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-zinc-800 rounded-2xl border border-zinc-700 p-0.5 flex items-center justify-center overflow-hidden">
                  {player.photo_url ? (
                    <img src={player.photo_url} alt="Foto" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  )}
                </div>
                <div>
                  <h3 className="font-display font-black text-base uppercase italic italic group-hover:text-red-600 transition-colors">{player.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-red-600/10 text-red-500 text-[8px] px-2 py-0.5 rounded font-black tracking-widest uppercase">{player.position_name || 'Prospecto'}</span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{player.category_name}</span>
                  </div>
                </div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-700 group-hover:text-white transition-colors"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          ))}
          
          {players.length === 0 && (
            <div className="text-center py-16">
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                </div>
                <p className="text-zinc-600 text-sm font-medium">No hay guerreros registrados todavía.</p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-28 right-6 z-40 max-w-md mx-auto w-full left-0 flex justify-end px-6 pointer-events-none">
        <Link 
          to="/players/new"
          className="w-16 h-16 bg-red-600 rounded-2xl shadow-2xl shadow-red-900/50 flex items-center justify-center hover:scale-110 active:scale-90 transition-transform pointer-events-auto"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
        </Link>
      </div>

      {/* Bottom Sub-Navigation Navbar */}
      <nav className="fixed bottom-0 left-0 w-full bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-900 px-8 py-4 z-50">
           <div className="max-w-md mx-auto flex justify-between items-center">
              <Link to="/admin/dashboard" className="flex flex-col items-center gap-1 text-zinc-600 hover:text-white">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path d="M9 22V12h6v10"/></svg>
                 <span className="text-[9px] font-bold uppercase tracking-widest">Inicio</span>
              </Link>
              <Link to="/players/list" className="flex flex-col items-center gap-1 text-red-600">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                 <span className="text-[9px] font-bold uppercase tracking-widest">Roster</span>
              </Link>
              <Link to="/teams/list" className="flex flex-col items-center gap-1 text-zinc-600 hover:text-white">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20"/><path d="M2 12h20"/></svg>
                 <span className="text-[9px] font-bold uppercase tracking-widest">Rivales</span>
              </Link>
              <button className="flex flex-col items-center gap-1 text-zinc-600 hover:text-white">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                 <span className="text-[9px] font-bold uppercase tracking-widest">Stats</span>
              </button>
           </div>
      </nav>
    </div>
  );
};

export default PlayerList;
