import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ─── Skeleton Card ────────────────────────────────────────────────────────────
// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="card p-4 flex items-center gap-4 animate-pulse shadow-sm">
    <div className="w-14 h-14 rounded-2xl flex-shrink-0" style={{ backgroundColor: 'var(--bg-main)' }} />
    <div className="flex-1 space-y-2">
      <div className="h-4 rounded-lg w-3/4" style={{ backgroundColor: 'var(--bg-main)' }} />
      <div className="flex gap-2">
        <div className="h-3 rounded w-16" style={{ backgroundColor: 'var(--bg-main)' }} />
        <div className="h-3 rounded w-12" style={{ backgroundColor: 'var(--bg-main)' }} />
      </div>
    </div>
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

  const isInactive = player.status === 'inactive';

  return (
    <div
      onClick={() => navigate(`/players/${player.id}`)}
      className={`card p-4 flex items-center gap-4 group cursor-pointer active:scale-[0.98] transition-all duration-200 shadow-sm ${isInactive ? 'opacity-60 grayscale-[0.5] hover:grayscale-0' : 'hover:border-red-500/20'}`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 rounded-2xl border overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)' }}>
          {player.photo_url ? (
            <img
              src={player.photo_url}
              alt={player.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-black text-base tracking-tight" style={{ color: 'var(--text-dim)' }}>{initials}</span>
          )}
        </div>
        {/* Position badge on avatar */}
        {player.position_name && (
          <div className={`absolute -bottom-1.5 -right-1.5 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md tracking-wider leading-none ${isInactive ? 'bg-zinc-500' : 'bg-red-600'}`}>
            {abbr}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-black text-sm uppercase tracking-wide transition-colors truncate leading-tight ${isInactive ? '' : 'group-hover:text-red-600'}`} style={{ color: isInactive ? 'var(--text-muted)' : 'var(--text-main)' }}>
          {player.name}
        </h3>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {player.category_name && (
            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-dim)' }}>
              {player.category_name}
            </span>
          )}
          {player.position_name && (
            <span className={`text-[9px] font-bold uppercase tracking-wider ${isInactive ? '' : 'text-red-600'}`} style={{ color: isInactive ? 'var(--text-muted)' : '' }}>
              {player.position_name.replace(/\s*\([^)]*\)/, '')}
            </span>
          )}
        </div>
      </div>

      {/* Arrow / Badge */}
      {isInactive ? (
        <span className="text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded border" style={{ color: 'var(--text-dim)', backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)' }}>Baja</span>
      ) : (
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          className="group-hover:text-red-600 group-hover:translate-x-0.5 transition-all flex-shrink-0"
          style={{ color: 'var(--border-main)' }}
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      )}
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
  const [activeStatus, setActiveStatus] = useState('active'); // 'active' or 'inactive'
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

    if (activeStatus !== 'all') {
      result = result.filter(p => (p.status || 'active') === activeStatus);
    }

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(p => p.name?.toLowerCase().includes(q));
    }

    return result;
  }, [players, activeCategory, searchText, activeStatus]);

  return (
    <div className="font-body min-h-screen selection:bg-red-600/10 transition-colors duration-300" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 w-full backdrop-blur-xl border-b z-50 transition-colors" style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-main)' }}>
        <div className="max-w-md mx-auto px-5 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="w-9 h-9 flex items-center justify-center transition-colors"
            style={{ color: 'var(--text-dim)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          <span className="font-black text-xs uppercase tracking-[0.25em] italic">Roster Oficial</span>

          <button
            onClick={() => { setShowSearch(s => !s); setSearchText(''); }}
            className={`w-9 h-9 flex items-center justify-center transition-colors ${showSearch ? 'text-red-600' : ''}`}
            style={{ color: showSearch ? '' : 'var(--text-dim)' }}
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
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-dim)' }}
              >
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                autoFocus={showSearch}
                type="text"
                placeholder="Buscar jugador..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-colors"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
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
            Directorio de <span className="text-red-600">Jugadores</span>
          </h1>
          <p className="text-xs font-medium" style={{ color: 'var(--text-dim)' }}>
            {loading ? 'Cargando...' : (
              activeStatus === 'active' 
                ? `${filtered.length} guerrero${filtered.length !== 1 ? 's' : ''} en activo`
                : `${filtered.length} jugador${filtered.length !== 1 ? 's' : ''} en archivo`
            )}
          </p>
        </div>

        {/* ── Status Tabs ────────────────────────────────────────────────── */}
        {!loading && (
          <div className="flex p-1 rounded-2xl border mb-5 shadow-sm transition-colors" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
            <button 
              onClick={() => setActiveStatus('active')}
              className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${activeStatus === 'active' ? 'shadow-sm' : ''}`}
              style={{ 
                backgroundColor: activeStatus === 'active' ? 'var(--bg-main)' : 'transparent',
                color: activeStatus === 'active' ? 'var(--text-main)' : 'var(--text-dim)'
              }}
            >
              Roster Activo
            </button>
            <button 
              onClick={() => setActiveStatus('inactive')}
              className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${activeStatus === 'inactive' ? 'shadow-sm' : ''}`}
              style={{ 
                backgroundColor: activeStatus === 'inactive' ? 'var(--bg-main)' : 'transparent',
                color: activeStatus === 'inactive' ? 'var(--text-main)' : 'var(--text-dim)'
              }}
            >
              Archivo / Bajas
            </button>
          </div>
        )}

        {/* ── Category Filters ────────────────────────────────────────────── */}
        {!loading && categories.length > 0 && (
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeCategory === 'all'
                  ? 'bg-red-600 text-white shadow-md shadow-red-100 border-red-600'
                  : 'border hover:border-red-600/30'
              }`}
              style={{ 
                backgroundColor: activeCategory === 'all' ? '' : 'var(--bg-card)',
                color: activeCategory === 'all' ? '' : 'var(--text-dim)',
                borderColor: activeCategory === 'all' ? '' : 'var(--border-main)'
              }}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id.toString())}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat.id.toString()
                    ? 'bg-red-600 text-white shadow-md shadow-red-100 border-red-600'
                    : 'border hover:border-red-600/30'
                }`}
                style={{ 
                  backgroundColor: activeCategory === cat.id.toString() ? '' : 'var(--bg-card)',
                  color: activeCategory === cat.id.toString() ? '' : 'var(--text-dim)',
                  borderColor: activeCategory === cat.id.toString() ? '' : 'var(--border-main)'
                }}
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
            </>
          ) : filtered.length > 0 ? (
            filtered.map((player, i) => (
              <PlayerCard key={player.id} player={player} index={i} />
            ))
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-dim)' }}>
                   <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-dim)' }}>No hay resultados.</p>
            </div>
          )}
        </div>
      </main>

      {/* ── FAB Add Player ────────────────────────────────────────────────── */}
      <div className="fixed bottom-24 right-0 left-0 max-w-md mx-auto px-5 flex justify-end z-40 pointer-events-none">
        <Link
          to="/players/new"
          className="w-14 h-14 bg-red-600 rounded-2xl shadow-lg shadow-red-900/20 flex items-center justify-center hover:scale-110 active:scale-90 transition-transform pointer-events-auto"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Link>
      </div>

      {/* ── Bottom Nav ────────────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 w-full backdrop-blur-xl border-t z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] transition-colors" style={{ backgroundColor: 'var(--nav-bg)', borderColor: 'var(--border-main)' }}>
        <div className="max-w-md mx-auto px-8 py-3 flex justify-between items-center">
          <Link to="/admin/dashboard" className="flex flex-col items-center gap-1 transition-colors" style={{ color: 'var(--text-dim)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path d="M9 22V12h6v10" />
            </svg>
            <span className="text-[8px] font-bold uppercase tracking-widest">Inicio</span>
          </Link>

          <Link to="/players/list" className="flex flex-col items-center gap-1 text-red-600">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            <span className="text-[8px] font-bold uppercase tracking-widest">Roster</span>
          </Link>

          <Link to="/admin/calendar" className="flex flex-col items-center gap-1 transition-colors" style={{ color: 'var(--text-dim)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            <span className="text-[8px] font-bold uppercase tracking-widest">Agenda</span>
          </Link>

          <button className="flex flex-col items-center gap-1 transition-colors" style={{ color: 'var(--text-dim)' }}>
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
