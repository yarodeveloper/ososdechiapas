import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SvgIcon from '../components/SvgIcon';

// ─── Position → Phase mapping ─────────────────────────────────────────────────
const POSITION_PHASES = {
    offense: ['quarterback', 'running back', 'wide receiver', 'tight end', 'offensive line', 'rb', 'qb', 'wr', 'te', 'ol'],
    defense: ['linebacker', 'cornerback', 'safety', 'defensive line', 'lb', 'cb', 'dl', 'defensive back', 'db'],
    special: ['kicker', 'punter', 'kick', 'punt', 'especiales', 'special'],
};

const getPlayerPhases = (player) => {
    const raw = (player.display_positions || player.position_name || '').toLowerCase();
    if (!raw) return { offense: true, defense: true, special: true };
    const phases = { offense: false, defense: false, special: false };
    Object.entries(POSITION_PHASES).forEach(([phase, keywords]) => {
        if (keywords.some(kw => raw.includes(kw))) phases[phase] = true;
    });
    if (!phases.offense && !phases.defense && !phases.special) {
        phases.offense = true; phases.defense = true; phases.special = true;
    }
    return phases;
};

// ─── Section header with phase badge ─────────────────────────────────────────
const SectionHeader = ({ label, color, isActive }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="w-1 h-3 rounded-full" style={{ backgroundColor: color, opacity: isActive ? 1 : 0.3 }} />
            <h4 className="text-[10px] font-black uppercase tracking-widest"
                style={{ color: isActive ? color : 'var(--text-muted)', opacity: isActive ? 1 : 0.5 }}>
                {label}
            </h4>
        </div>
        {isActive && (
            <span className="text-[8px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${color}20`, color: color, border: `1px solid ${color}40` }}>
                Tu zona ★
            </span>
        )}
    </div>
);

// ─── Stat input ───────────────────────────────────────────────────────────────
const StatInput = ({ label, value, onChange, isActive, accentColor }) => (
    <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-widest ml-1"
            style={{ color: isActive ? accentColor : 'var(--text-muted)', opacity: isActive ? 1 : 0.5 }}>
            {label}
        </label>
        <input
            type="number"
            min="0"
            className="w-full border rounded-xl px-4 py-2 text-sm font-black outline-none transition-all"
            style={{
                backgroundColor: 'var(--bg-main)',
                borderColor: isActive ? `${accentColor}60` : 'var(--border-main)',
                color: 'var(--text-main)',
                opacity: isActive ? 1 : 0.45,
                boxShadow: (isActive && value > 0) ? `0 0 0 2px ${accentColor}20` : 'none',
            }}
            value={value}
            onChange={onChange}
        />
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const MatchStatsCapture = () => {
    const { matchId } = useParams();
    const navigate = useNavigate();

    const [match, setMatch] = useState(null);
    const [players, setPlayers] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showGlossary, setShowGlossary] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const mRes = await fetch(`/api/matches/${matchId}`);
                if (!mRes.ok) throw new Error('Match not found');
                const mData = await mRes.json();
                setMatch(mData);

                const pRes = await fetch(`/api/players/category/${mData.category_id}`);
                const pData = await pRes.json();

                const perfRes = await fetch(`/api/stats/match/${matchId}/performances`);
                const perfData = await perfRes.json();
                const perfMap = {};
                perfData.forEach(p => { perfMap[p.player_id] = p; });

                const filteredPlayers = pData.filter(p => (p.status || 'active') === 'active' || perfMap[p.id]);
                setPlayers(filteredPlayers);

                const initialStats = {};
                filteredPlayers.forEach(p => {
                    if (perfMap[p.id]) {
                        initialStats[p.id] = { ...perfMap[p.id], is_mvp: !!perfMap[p.id].is_mvp };
                    } else {
                        initialStats[p.id] = {
                            player_id: p.id, touchdowns: 0, td_offense: 0, td_defense: 0,
                            yards_rushing: 0, yards_passing: 0, yards_receiving: 0,
                            tackles: 0, interceptions: 0, sacks: 0, points_extra: 0, is_mvp: false
                        };
                    }
                });
                setStats(initialStats);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [matchId]);

    const handleStatChange = (playerId, field, value) => {
        setStats(prev => ({ ...prev, [playerId]: { ...prev[playerId], [field]: value } }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/stats/match/${matchId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ performances: Object.values(stats) })
            });
            if (res.ok) {
                alert('Estadísticas guardadas con éxito');
                navigate('/admin/dashboard');
            } else {
                const err = await res.json();
                alert('Error al guardar: ' + err.message);
            }
        } catch (error) {
            console.error(error);
            alert('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
            <div className="w-12 h-12 border-t-2 rounded-full animate-spin mb-4" style={{ borderColor: 'var(--primary)' }}></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>Sincronizando Roster...</p>
        </div>
    );

    return (
        <div className="min-h-screen pb-32" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>

            {/* ── Header ──────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-50 backdrop-blur-md border-b px-6 py-4"
                style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-main)' }}>
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <button onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 active:scale-95 transition-all">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6" /></svg>
                        Volver
                    </button>
                    <div className="text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Planilla Digital</p>
                        <h1 className="text-sm font-black uppercase italic" style={{ color: 'var(--text-main)' }}>
                            VS {match?.opponent || match?.visitor_name || 'Rival'}
                        </h1>
                    </div>
                    <button onClick={handleSave} disabled={saving || players.length === 0}
                        className="text-xs font-black uppercase tracking-widest disabled:opacity-50"
                        style={{ color: 'var(--primary)' }}>
                        {saving ? '...' : 'Save'}
                    </button>
                </div>
            </header>

            {/* ── Glossary Modal ───────────────────────────────────────────── */}
            {showGlossary && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowGlossary(false)}></div>
                    <div className="relative border rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl overflow-hidden"
                        style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)' }}>
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-[var(--primary)]"></div>
                        <h2 className="text-xl font-display font-black uppercase italic tracking-tighter mb-6 flex items-center gap-3"
                            style={{ color: 'var(--text-main)' }}>
                            <span className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xs not-italic">?</span>
                            Glosario de Siglas
                        </h2>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
                            <div className="border-b pb-3" style={{ borderColor: 'var(--border-main)' }}>
                                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--primary)' }}>OFENSIVA (ATAQUE)</p>
                                <div className="space-y-2">
                                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}><b style={{ color: 'var(--text-main)' }}>Pass:</b> Yardas ganadas por pase (QB)</p>
                                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}><b style={{ color: 'var(--text-main)' }}>Rush:</b> Yardas ganadas por carrera (RB/QB)</p>
                                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}><b style={{ color: 'var(--text-main)' }}>Rec:</b> Yardas por recepción (WR/TE)</p>
                                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}><b style={{ color: 'var(--text-main)' }}>TD-OF:</b> Touchdowns ofensivos</p>
                                </div>
                            </div>
                            <div className="border-b pb-3" style={{ borderColor: 'var(--border-main)' }}>
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">DEFENSIVA</p>
                                <div className="space-y-2">
                                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}><b style={{ color: 'var(--text-main)' }}>TCK:</b> Tackles (Derribadas)</p>
                                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}><b style={{ color: 'var(--text-main)' }}>INT:</b> Intercepciones</p>
                                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}><b style={{ color: 'var(--text-main)' }}>Sacks:</b> Captura del QB rival</p>
                                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}><b style={{ color: 'var(--text-main)' }}>TD-DF:</b> TD defensivo (INT devuelta)</p>
                                </div>
                            </div>
                            <div className="pb-3">
                                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">EQUIPOS ESPECIALES</p>
                                <div className="space-y-2">
                                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}><b style={{ color: 'var(--text-main)' }}>Ext:</b> Puntos extra (PAT o conversión de 2)</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setShowGlossary(false)}
                            className="w-full mt-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                            style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>
                            Cerrar Ayuda
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main ────────────────────────────────────────────────────── */}
            <main className="max-w-md mx-auto px-5 pt-8">

                {/* Page title */}
                <div className="mb-8">
                    <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-[var(--primary)]"></div>
                            <h2 className="text-2xl font-display font-black uppercase italic tracking-tighter"
                                style={{ color: 'var(--text-main)' }}>Registro de Desempeño</h2>
                        </div>
                        <button onClick={() => setShowGlossary(true)}
                            className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors active:scale-90"
                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-dim)' }}>
                            <SvgIcon src="/icons/question-svgrepo-com.svg" className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                        Las secciones <span className="font-black" style={{ color: 'var(--primary)' }}>marcadas</span> corresponden a la posición del jugador. Todas son editables.
                    </p>
                </div>

                {/* Player cards */}
                <div className="space-y-6">
                    {players.map(player => {
                        const phases = getPlayerPhases(player);
                        const playerStat = stats[player.id] || {};
                        const initials = player.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
                        const positionList = (player.display_positions || player.position_name || '').split(',').map(s => s.trim()).filter(Boolean);

                        return (
                            <div key={player.id} className="border rounded-3xl overflow-hidden"
                                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>

                                {/* Player header row */}
                                <div className="flex items-center gap-4 p-5 pb-4 border-b" style={{ borderColor: 'var(--border-main)' }}>
                                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--bg-main)' }}>
                                        {player.photo_url
                                            ? <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
                                            : <div className="w-full h-full flex items-center justify-center font-black text-sm" style={{ color: 'var(--text-muted)' }}>{initials}</div>
                                        }
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <h3 className="font-black text-sm uppercase tracking-wide truncate" style={{ color: 'var(--text-main)' }}>{player.name}</h3>
                                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                            <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
                                                #{player.jersey_number || '00'}
                                            </span>
                                            {positionList.slice(0, 3).map((pos, i) => {
                                                const posLow = pos.toLowerCase();
                                                let chipColor = 'var(--primary)';
                                                if (POSITION_PHASES.defense.some(k => posLow.includes(k))) chipColor = '#3b82f6';
                                                else if (POSITION_PHASES.special.some(k => posLow.includes(k))) chipColor = '#f59e0b';
                                                return (
                                                    <span key={i} className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md tracking-wide"
                                                        style={{ backgroundColor: `${chipColor}18`, color: chipColor, border: `1px solid ${chipColor}30` }}>
                                                        {pos.replace(/\s*\([^)]*\)/, '').trim()}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    {/* MVP star */}
                                    <button
                                        onClick={() => handleStatChange(player.id, 'is_mvp', !playerStat.is_mvp)}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
                                        title="MVP del partido"
                                        style={{
                                            backgroundColor: playerStat.is_mvp ? 'var(--primary)' : 'var(--bg-main)',
                                            border: playerStat.is_mvp ? 'none' : '1px solid var(--border-main)',
                                            color: playerStat.is_mvp ? 'white' : 'var(--text-dim)'
                                        }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24"
                                            fill={playerStat.is_mvp ? 'currentColor' : 'none'}
                                            stroke="currentColor" strokeWidth="2.5">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Stat sections */}
                                <div className="p-5 space-y-4">

                                    {/* OFENSIVA */}
                                    <div className="rounded-2xl p-4 space-y-3 transition-all"
                                        style={{
                                            backgroundColor: phases.offense ? 'rgba(var(--primary-rgb, 220,38,38), 0.05)' : 'transparent',
                                            border: phases.offense ? '1px solid rgba(var(--primary-rgb, 220,38,38), 0.2)' : '1px solid transparent',
                                        }}>
                                        <SectionHeader label="Sección Ofensiva" color="var(--primary)" isActive={phases.offense} />
                                        <div className="grid grid-cols-2 gap-3">
                                            <StatInput label="Pass Yds (QB)" value={playerStat.yards_passing || 0} isActive={phases.offense} accentColor="var(--primary)"
                                                onChange={e => handleStatChange(player.id, 'yards_passing', parseInt(e.target.value) || 0)} />
                                            <StatInput label="Rush Yds (Car)" value={playerStat.yards_rushing || 0} isActive={phases.offense} accentColor="var(--primary)"
                                                onChange={e => handleStatChange(player.id, 'yards_rushing', parseInt(e.target.value) || 0)} />
                                            <StatInput label="Rec Yds (Rec)" value={playerStat.yards_receiving || 0} isActive={phases.offense} accentColor="var(--primary)"
                                                onChange={e => handleStatChange(player.id, 'yards_receiving', parseInt(e.target.value) || 0)} />
                                            <StatInput label="TD-OF (Touchdown)" value={playerStat.td_offense || 0} isActive={phases.offense} accentColor="var(--primary)"
                                                onChange={e => handleStatChange(player.id, 'td_offense', parseInt(e.target.value) || 0)} />
                                        </div>
                                    </div>

                                    {/* DEFENSIVA */}
                                    <div className="rounded-2xl p-4 space-y-3 transition-all"
                                        style={{
                                            backgroundColor: phases.defense ? 'rgba(59,130,246,0.05)' : 'transparent',
                                            border: phases.defense ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
                                        }}>
                                        <SectionHeader label="Sección Defensiva" color="#3b82f6" isActive={phases.defense} />
                                        <div className="grid grid-cols-2 gap-3">
                                            <StatInput label="TCK (Tackles)" value={playerStat.tackles || 0} isActive={phases.defense} accentColor="#3b82f6"
                                                onChange={e => handleStatChange(player.id, 'tackles', parseInt(e.target.value) || 0)} />
                                            <StatInput label="INT (Intercep)" value={playerStat.interceptions || 0} isActive={phases.defense} accentColor="#3b82f6"
                                                onChange={e => handleStatChange(player.id, 'interceptions', parseInt(e.target.value) || 0)} />
                                            <StatInput label="Sacks (Captura)" value={playerStat.sacks || 0} isActive={phases.defense} accentColor="#3b82f6"
                                                onChange={e => handleStatChange(player.id, 'sacks', parseInt(e.target.value) || 0)} />
                                            <StatInput label="TD-DF (Defensivo)" value={playerStat.td_defense || 0} isActive={phases.defense} accentColor="#3b82f6"
                                                onChange={e => handleStatChange(player.id, 'td_defense', parseInt(e.target.value) || 0)} />
                                        </div>
                                    </div>

                                    {/* ESPECIALES */}
                                    <div className="rounded-2xl p-4 space-y-3 transition-all"
                                        style={{
                                            backgroundColor: phases.special ? 'rgba(245,158,11,0.05)' : 'transparent',
                                            border: phases.special ? '1px solid rgba(245,158,11,0.2)' : '1px solid transparent',
                                        }}>
                                        <SectionHeader label="Equipos Especiales" color="#f59e0b" isActive={phases.special} />
                                        <StatInput label="Ext (Puntos Extra / PAT)" value={playerStat.points_extra || 0} isActive={phases.special} accentColor="#f59e0b"
                                            onChange={e => handleStatChange(player.id, 'points_extra', parseInt(e.target.value) || 0)} />
                                    </div>

                                </div>
                            </div>
                        );
                    })}

                    {players.length === 0 && (
                        <div className="text-center py-20 border border-dashed rounded-[2.5rem]"
                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                            <p className="font-black uppercase text-[10px] tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>
                                No hay jugadores en esta categoría
                            </p>
                            <Link to="/players/new" className="font-bold text-xs uppercase tracking-widest underline underline-offset-4"
                                style={{ color: 'var(--primary)' }}>
                                Ir a Alta de Jugador
                            </Link>
                        </div>
                    )}
                </div>

                {/* Save button */}
                <div className="mt-12">
                    <button onClick={handleSave} disabled={saving || players.length === 0}
                        className="w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl active:scale-95 transition-all text-white disabled:opacity-50"
                        style={{ backgroundColor: 'var(--primary)' }}>
                        {saving ? 'Procesando...' : 'Finalizar Estadísticas'}
                    </button>
                    <p className="text-center text-[10px] uppercase font-bold mt-4 tracking-widest" style={{ color: 'var(--text-muted)' }}>
                        Al finalizar, los totales se reflejarán en las Player Cards.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default MatchStatsCapture;