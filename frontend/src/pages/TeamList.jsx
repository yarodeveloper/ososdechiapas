import React, { useEffect, useState } from 'react';
import SvgIcon from '../components/SvgIcon';
import AddTeamModal from '../components/AddTeamModal';
import { Link } from 'react-router-dom';

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nextMatch, setNextMatch] = useState('Ninguno'); // From Dashboard stats ideally, or just a placeholder for now

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

  return (
    <div className="bg-[#101010] text-[#e5e5e5] font-body min-h-screen flex flex-col relative">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-5 max-w-md mx-auto w-full border-b border-[#2a2a2a]/50">
        <button><SvgIcon src="/icons/bullet-list-svgrepo-com.svg" className="w-6 h-6 text-[#a3a3a3]" /></button>
        <span className="font-headline font-bold text-sm tracking-wide text-white">Gestión de Rivales</span>
        <button><SvgIcon src="/icons/discussion-search-svgrepo-com.svg" className="w-5 h-5 text-[#a3a3a3]" /></button>
      </header>

      <main className="flex-grow flex flex-col px-6 py-6 max-w-md mx-auto w-full pb-28">
        {/* Title Section */}
        <div className="mb-6">
          <p className="font-label text-[9px] uppercase tracking-[0.2em] text-primary-container font-extrabold mb-1">Database Central</p>
          <h1 className="font-headline text-3xl font-extrabold text-white tracking-tight">Rivales Registrados</h1>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#2a1b1b] rounded-xl p-4">
            <p className="font-label text-[8px] uppercase tracking-widest text-[#a3a3a3] mb-1">Total Equipos</p>
            <p className="font-headline text-xl font-bold text-white">{teams.length}</p>
          </div>
          <div className="bg-[#2a1b1b] rounded-xl p-4">
            <p className="font-label text-[8px] uppercase tracking-widest text-[#a3a3a3] mb-1">Próximo Encuentro</p>
            <p className="font-headline text-lg font-bold text-primary-container">{nextMatch}</p>
          </div>
        </div>

        {/* Team List */}
        <div className="space-y-3">
          {teams.map((team) => (
            <div key={team.id} className="bg-[#1a1111] hover:bg-[#221616] transition-colors border-l-4 border-primary-container rounded-r-xl p-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#120d0d] rounded-lg border border-[#2a2a2a] p-2 flex items-center justify-center overflow-hidden">
                  {team.logo_url ? <img src={team.logo_url} alt="Logo" className="w-full h-full object-contain" /> : <div className="text-xs text-center text-gray-500">No Logo</div>}
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-white tracking-wide">{team.name}</h3>
                  <div className="flex items-center space-x-1 mt-1 opacity-70">
                    <SvgIcon src="/icons/pin-svgrepo-com.svg" className="w-3 h-3 text-[#a3a3a3]" />
                    <span className="font-body text-[10px] text-[#a3a3a3]">{team.home_stadium || 'Sin Estadio'}</span>
                  </div>
                </div>
              </div>
              <SvgIcon src="/icons/arrow-open-right-svgrepo-com.svg" className="w-4 h-4 text-[#737373]" />
            </div>
          ))}
          
          {teams.length === 0 && (
            <div className="text-center py-10 text-[#737373] text-sm">No hay equipos registrados.</div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-6 z-40 max-w-md mx-auto w-full left-0 flex justify-end px-6 pointer-events-none">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-14 h-14 bg-primary-container rounded-full shadow-[0_4px_20px_rgba(227,5,20,0.5)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform pointer-events-auto"
        >
          <SvgIcon src="/icons/check-plus-svgrepo-com.svg" className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Bottom Sub-Navigation Navbar */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#111111] border-t border-[#2a2a2a] z-50">
         <div className="max-w-md mx-auto px-6 h-16 flex justify-between items-center">
            <Link to="/players/list" className="flex flex-col items-center justify-center group w-16 opacity-60 hover:opacity-100 transition-opacity">
               <SvgIcon src="/icons/group-svgrepo-com.svg" className="w-6 h-6 text-white mb-1" />
               <span className="text-[8px] font-label font-bold text-[#a3a3a3] uppercase tracking-widest">Roster</span>
            </Link>
            <button className="flex flex-col items-center justify-center group w-16 opacity-60 hover:opacity-100 transition-opacity">
               <SvgIcon src="/icons/ball-rugby-svgrepo-com.svg" className="w-5 h-5 text-white mb-1" />
               <span className="text-[8px] font-label font-semibold text-[#a3a3a3] uppercase tracking-widest">Games</span>
            </button>
            <button className="flex flex-col items-center justify-center group w-16 relative">
               <SvgIcon src="/icons/target-svgrepo-com.svg" className="w-6 h-6 text-primary-container mb-1" />
               <span className="text-[8px] font-label font-bold text-primary-container uppercase tracking-widest">Rivales</span>
            </button>
            <button className="flex flex-col items-center justify-center group w-16 opacity-60 hover:opacity-100 transition-opacity">
               <SvgIcon src="/icons/stats-svgrepo-com.svg" className="w-6 h-6 text-white mb-1" />
               <span className="text-[8px] font-label font-semibold text-[#a3a3a3] uppercase tracking-widest">Stats</span>
            </button>
         </div>
      </nav>

      {/* Modal Integration */}
      {isModalOpen && (
        <AddTeamModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => { setIsModalOpen(false); fetchTeams(); }} 
        />
      )}
    </div>
  );
};

export default TeamList;
