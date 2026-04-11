import React, { useEffect, useState } from 'react';
import SvgIcon from '../components/SvgIcon';
import AddTeamModal from '../components/AddTeamModal';
import { Link, useNavigate } from 'react-router-dom';

const TeamList = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState(null);

  const fetchTeams = async () => {
    try {
      const res = await fetch('/api/teams');
      if (!res.ok) return;
      const data = await res.json();
      setTeams(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleEdit = (team) => {
    setTeamToEdit(team);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (id === 1) {
        alert("No se puede eliminar el equipo principal del club.");
        return;
    }
    if (window.confirm(`¿Estás seguro de eliminar a "${name}"? Esta acción no se puede deshacer.`)) {
      try {
        const res = await fetch(`/api/teams/${id}`, { method: 'DELETE' });
        if (res.ok) {
           fetchTeams();
        } else {
           alert("Error al eliminar el equipo.");
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTeamToEdit(null);
  };

  const rivals = teams.filter(t => t.is_club_oso !== 1);

  return (
    <div className="bg-[#0a0a0a] text-[#e5e5e5] font-outfit min-h-screen flex flex-col relative pb-32">
      <header className="flex justify-between items-center px-6 py-8 border-b border-white/5 sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <button onClick={() => navigate('/admin/settings')} className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-white transition-all">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <span className="text-sm font-black uppercase italic tracking-tighter text-white">Gestión de Rivales</span>
        <div className="w-10"></div>
      </header>

      <main className="px-6 py-10 max-w-md mx-auto w-full">
        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-2 italic">CONTROL DE RIVALES</p>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Mantenimiento<br/>de Equipos</h1>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="bg-zinc-950 border border-zinc-900 rounded-[2rem] p-6 shadow-xl text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Total Rivales</p>
            <p className="text-3xl font-black text-white italic tracking-tighter">{rivals.length}</p>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 rounded-[2rem] p-6 shadow-xl text-center">
             <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Sincronizados</p>
             <p className="text-3xl font-black text-red-600 italic tracking-tighter">YES</p>
          </div>
        </div>

        <div className="space-y-4">
          {rivals.map((team) => (
            <div key={team.id} className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-6 shadow-2xl">
              <div className="flex justify-between items-start">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-black rounded-2xl border border-zinc-800 p-2 flex items-center justify-center overflow-hidden shrink-0">
                      {team.logo_url ? <img src={team.logo_url} alt="Logo" className="w-full h-full object-contain" /> : <div className="text-[10px] text-center text-zinc-700 font-black">LOGO</div>}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-black text-white tracking-tight leading-none mb-1 uppercase italic">{team.name}</h3>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {team.home_stadium || 'Estadio N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                        onClick={() => handleEdit(team)}
                        className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-white transition-colors border border-white/5 shadow-lg active:scale-95"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button 
                        onClick={() => handleDelete(team.id, team.name)}
                        className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center text-red-500 hover:bg-red-600/20 transition-colors border border-red-500/10 active:scale-95"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
              </div>
            </div>
          ))}
          
          {rivals.length === 0 && (
            <div className="text-center py-20 bg-zinc-950 border border-dashed border-zinc-900 rounded-[2.5rem]">
               <p className="text-zinc-600 font-black uppercase text-xs tracking-widest italic">No hay rivales en la base de datos</p>
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-24 right-6 z-40 max-w-md mx-auto w-full left-0 flex justify-end px-6 pointer-events-none">
        <button 
          onClick={() => { setTeamToEdit(null); setIsModalOpen(true); }}
          className="w-16 h-16 bg-red-600 rounded-[2rem] shadow-2xl shadow-red-900/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform pointer-events-auto border-4 border-black/10"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>

      <nav className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-xl border-t border-white/5 z-50 rounded-t-[2.5rem] pb-8 pt-4">
         <div className="max-w-md mx-auto px-8 flex justify-between items-center">
            <Link to="/players/list" className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-all">
               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
               <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Roster</span>
            </Link>
            <button className="flex flex-col items-center gap-2 opacity-100">
               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e30514" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
               <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">Rivales</span>
            </button>
            <Link to="/estadisticas" className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-all">
               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
               <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Stats</span>
            </Link>
         </div>
      </nav>

      {isModalOpen && (
        <AddTeamModal 
          teamToEdit={teamToEdit}
          onClose={handleCloseModal} 
          onSuccess={() => { handleCloseModal(); fetchTeams(); }} 
        />
      )}
    </div>
  );
};

export default TeamList;
