import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
    <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-zinc-800 rounded-lg w-3/4" />
      <div className="flex gap-2">
        <div className="h-3 bg-zinc-800 rounded w-16" />
        <div className="h-3 bg-zinc-800 rounded w-12" />
      </div>
    </div>
    <div className="w-5 h-5 bg-zinc-800 rounded" />
  </div>
);

// ─── Position abbreviation helper ────────────────────────────────────────────
const getPositionAbbr = (positionName) => {
  if (!positionName) return '—';
  const match = positionName.match(/\(([^)]+)\)/);
  return match ? match[1] : positionName.slice(0, 3).toUpperCase();
};

// ─── Player Card ──────────────────────────────────────────────────────────────
const PlayerCard = ({ player, index }) => {
  const navigate = useNavigate();
  const abbr = getPositionAbbr(player.position_name);
  const initials = player.name
    ? player.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div
      onClick={() => navigate(`/players/${player.id}`)}
      className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4 flex items-center gap-4 group cursor-pointer active:scale-[0.98] hover:border-red-600/40 hover:bg-zinc-900 transition-all duration-200"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 rounded-2xl border border-zinc-700/50 overflow-hidden bg-zinc-800 flex items-center justify-center">
          {player.photo_url ? (
            <img
              src={player.photo_url}
              alt={player.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-zinc-400 font-black text-base tracking-tight">{initials}</span>
          )}
        </div>
        {/* Position badge on avatar */}
        {player.position_name && (
          <div className="absolute -bottom-1.5 -right-1.5 bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md tracking-wider leading-none">
            {abbr}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-black text-sm uppercase tracking-wide text-white group-hover:text-red-500 transition-colors truncate leading-tight">
          {player.name}
        </h3>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {player.category_name && (
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md">
              {player.category_name}
            </span>
          )}
          {player.position_name && (
            <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">
              {player.position_name.replace(/\s*\([^)]*\)/, '')}
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <svg
        width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5"
        className="text-zinc-700 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all flex-shrink-0"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PlayerList = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [playersRes, catsRes] = await Promise.all([
          fetch('/api/players'),
          fetch('/api/categories'),
        ]);
        setPlayers(await playersRes.json());
        setCategories(await catsRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ─── Filtered players ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = players;

    if (activeCategory !== 'all') {
      result = result.filter(p => p.category_id === parseInt(activeCategory));
    }

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(p => p.name?.toLowerCase().includes(q));
    }

    return result;
  }, [players, activeCategory, searchText]);

  return (
    <div className="bg-black text-white font-body min-h-screen selection:bg-red-600/30">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 w-full bg-black/90 backdrop-blur-xl border-b border-zinc-900 z-50">
        <div className="max-w-md mx-auto px-5 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          <span className="font-black text-xs uppercase tracking-[0.25em] italic">Roster Oficial</span>

          <button
            onClick={() => { setShowSearch(s => !s); setSearchText(''); }}
            className={`w-9 h-9 flex items-center justify-center transition-colors ${showSearch ? 'text-red-500' : 'text-zinc-400 hover:text-white'}`}
          >
            {showSearch ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
            )}
          </button>
        </div>

        {/* Search bar (expandible) */}
        <div className={`overflow-hidden transition-all duration-300 ${showSearch ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="max-w-md mx-auto px-5 pb-3">
            <div className="relative">
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
              >
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                autoFocus={showSearch}
                type="text"
                placeholder="Buscar jugador..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-600/50 transition-colors"
              />
            </div>
          </div>
        </div>
      </header>

      <main className={`max-w-md mx-auto px-5 pb-32 ${showSearch ? 'pt-28' : 'pt-20'} transition-all`}>

        {/* ── Title ──────────────────────────────────────────────────────── */}
        <div className="mb-6 pt-4">
          <div className="w-8 h-0.5 bg-red-600 mb-3" />
          <h1 className="text-3xl font-black uppercase italic leading-none mb-1">
            Directorio de <span className="text-red-500">Jugadores</span>
          </h1>
          <p className="text-zinc-500 text-xs font-medium">
            {loading ? 'Cargando...' : (
              filtered.length === players.length
                ? `${players.length} guerrero${players.length !== 1 ? 's' : ''} en el roster`
                : `${filtered.length} de ${players.length} jugadores`
            )}
          </p>
        </div>

        {/* ── Category Filters ────────────────────────────────────────────── */}
        {!loading && categories.length > 0 && (
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeCategory === 'all'
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600'
              }`}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id.toString())}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat.id.toString()
                    ? 'bg-red-600 text-white'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* ── Player List ─────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : filtered.length > 0 ? (
            filtered.map((player, i) => (
              <PlayerCard key={player.id} player={player} index={i} />
            ))
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                {searchText ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                  </svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                  </svg>
                )}
              </div>
              <p className="text-zinc-600 text-sm font-medium">
                {searchText
                  ? `Sin resultados para "${searchText}"`
                  : 'No hay jugadores en esta categoría.'}
              </p>
              {searchText && (
                <button
                  onClick={() => setSearchText('')}
                  className="mt-3 text-red-500 text-xs font-bold uppercase tracking-widest"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── FAB Add Player ────────────────────────────────────────────────── */}
      <div className="fixed bottom-24 right-0 left-0 max-w-md mx-auto px-5 flex justify-end z-40 pointer-events-none">
        <Link
          to="/players/new"
          className="w-14 h-14 bg-red-600 rounded-2xl shadow-lg shadow-red-900/50 flex items-center justify-center hover:scale-110 active:scale-90 transition-transform pointer-events-auto"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Link>
      </div>

      {/* ── Bottom Nav ────────────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 w-full bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-900 z-50">
        <div className="max-w-md mx-auto px-8 py-3 flex justify-between items-center">
          <Link to="/admin/dashboard" className="flex flex-col items-center gap-1 text-zinc-600 hover:text-white transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path d="M9 22V12h6v10" />
            </svg>
            <span className="text-[8px] font-bold uppercase tracking-widest">Inicio</span>
          </Link>

          <Link to="/players/list" className="flex flex-col items-center gap-1 text-red-500">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
            <span className="text-[8px] font-bold uppercase tracking-widest">Roster</span>
          </Link>

          <Link to="/teams/list" className="flex flex-col items-center gap-1 text-zinc-600 hover:text-white transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20M2 12h20" />
            </svg>
            <span className="text-[8px] font-bold uppercase tracking-widest">Rivales</span>
          </Link>

          <button className="flex flex-col items-center gap-1 text-zinc-600 hover:text-white transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
            <span className="text-[8px] font-bold uppercase tracking-widest">Stats</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default PlayerList;
