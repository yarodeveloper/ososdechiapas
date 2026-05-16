import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SvgIcon from '../components/SvgIcon';

// Position → phase detection
const PHASES = {
    offense: ['quarterback', 'running back', 'wide receiver', 'tight end', 'offensive line', 'qb', 'rb', 'wr', 'te', 'ol'],
    defense: ['linebacker', 'cornerback', 'safety', 'defensive line', 'lb', 'cb', 'dl', 'defensive back', 'db'],
    special: ['kicker', 'punter', 'kick', 'punt', 'especiales'],
};
const getPhases = (player) => {
    const raw = (player.display_positions || player.position_name || '').toLowerCase();
    if (!raw) return { offense: true, defense: true, special: true };
    const p = { offense: false, defense: false, special: false };
    Object.entries(PHASES).forEach(([phase, kws]) => { if (kws.some(k => raw.includes(k))) p[phase] = true; });
    if (!p.offense && !p.defense && !p.special) return { offense: true, defense: true, special: true };
    return p;
};

const AdminStats = () => {
    const { id: matchId } = useParams();
    const navigate = useNavigate();
    
    const [match, setMatch] = useState(null);
    const [players, setPlayers] = useState([]);
    const [stats, setStats] = useState({}); // { playerId: { touchdowns: 0, ... } }
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showGlossary, setShowGlossary] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                // 1. Get Match Info
                const mRes = await fetch(`/api/calendar`);
                const calData = await mRes.json();
                const currentMatch = calData.find(m => m.id === parseInt(matchId));
                if (!currentMatch) throw new Error('Match not found');
                setMatch(currentMatch);

                // 2. Get Roster for that category
                const pRes = await fetch(`/api/players/category/${currentMatch.category_id}`);
                const pData = await pRes.json();
                
                // 3. Get Existing stats if any
                const perfRes = await fetch(`/api/stats/match/${matchId}`);
                const perfData = await perfRes.json();
                const perfMap = {};
                perfData.forEach(p => {
                    perfMap[p.player_id] = p;
                });

                // 4. Filter: Only show active players OR players who already have stats for this match
                const filteredPlayers = pData.filter(p => (p.status || 'active') === 'active' || perfMap[p.id]);
                setPlayers(filteredPlayers);

                // 5. Initialize stats map with existing data or zeros
                const initialStats = {};
                filteredPlayers.forEach(p => {
                    if (perfMap[p.id]) {
                        initialStats[p.id] = {
                            ...perfMap[p.id],
                            is_mvp: !!perfMap[p.id].is_mvp // force boolean
                        };
                    } else {
                        initialStats[p.id] = {
                            player_id: p.id,
                            touchdowns: 0,
                            td_offense: 0,
                            td_defense: 0,
                            yards_rushing: 0,
                            yards_passing: 0,
                            yards_receiving: 0,
                            tackles: 0,
                            interceptions: 0,
                            sacks: 0,
                            points_extra: 0,
                            is_mvp: false
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
        let finalValue = value;
        if (typeof value !== 'boolean' && field !== 'is_mvp') {
            const numValue = parseInt(value);
            finalValue = isNaN(numValue) ? 0 : Math.max(0, numValue);
        }
        
        setStats(prev => ({
            ...prev,
            [playerId]: {
                ...prev[playerId],
                [field]: finalValue
            }
        }));
    };

    const increment = (playerId, field, delta = 1) => {
        const current = stats[playerId]?.[field] || 0;
        handleStatChange(playerId, field, current + delta);
    };

    const decrement = (playerId, field, delta = 1) => {
        const current = stats[playerId]?.[field] || 0;
        handleStatChange(playerId, field, Math.max(0, current - delta));
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
        <div className="min-h-screen pb-40" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
            <header className="sticky top-0 z-50 backdrop-blur-md border-b px-6 py-4" style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-main)' }}>
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl border group transition-all active:scale-90" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="drop-shadow-sm"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <div className="text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Planilla Digital</p>
                        <h1 className="text-sm font-black uppercase italic" style={{ color: 'var(--text-main)' }}>VS {match?.opponent || match?.rival_name || 'Rival'}</h1>
                    </div>
                    <button 
                        onClick={() => setShowGlossary(true)} 
                        className="w-10 h-10 rounded-xl border flex items-center justify-center transition-colors active:scale-90"
                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-dim)' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
                    </button>
                </div>
            </header>

            {/* Glossary Modal */}
            {showGlossary && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowGlossary(false)}></div>
                    <div className="relative border rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)' }}>
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-[var(--primary)]"></div>
                        <h2 className="text-xl font-display font-black uppercase italic tracking-tighter mb-6 flex items-center gap-3" style={{ color: 'var(--text-main)' }}>
                            <span className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xs not-italic">?</span>
                            Glosario de Siglas
                        </h2>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
                            <div className="border-b pb-3" style={{ borderColor: 'var(--border-main)' }}>
                                <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--primary)' }}>OFENSIVA (ATAQUE)</p>
                                <div className="space-y-2">
                                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}><b style={{ color: 'var(--text-main)' }}>Pass:</b> Yardas ganadas por pase (QB)</p>
                                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}><b style={{ color: 'var(--text-main)' }}>Rush:</b> Yardas ganadas por carrera (RB/QB)</p>
                                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}><b style={{ color: 'var(--text-main)' }}>Rec:</b> Yardas ganadas por recepción (WR/TE)</p>
                                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}><b style={{ color: 'var(--text-main)' }}>TD-OF:</b> Touchdowns anotados por la ofensiva</p>
                                </div>
                            </div>
                            <div className="border-b pb-3" style={{ borderColor: 'var(--border-main)' }}>
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">DEFENSIVA</p>
                                <div className="space-y-2">
                                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}><b style={{ color: 'var(--text-main)' }}>TCK:</b> Tackles (Derribadas realizadas)</p>
                                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}><b style={{ color: 'var(--text-main)' }}>INT:</b> Intercepciones (Robar pase rival)</p>
                                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}><b style={{ color: 'var(--text-main)' }}>Sacks:</b> Captura del Mariscal rival</p>
                                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}><b style={{ color: 'var(--text-main)' }}>TD-DF:</b> Touchdowns por defensa (INT devuelta)</p>
                                </div>
                            </div>
                            <div className="pb-3">
                                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">EQUIPOS ESPECIALES</p>
                                <div className="space-y-2">
                                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}><b style={{ color: 'var(--text-main)' }}>Ext:</b> Puntos extra (PAT o Conversión)</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setShowGlossary(false)} className="w-full mt-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>Cerrar Ayuda</button>
                    </div>
                </div>
            )}

            <main className="max-w-md mx-auto px-5 pt-8">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1.5 h-6 bg-[var(--primary)]"></div>
                        <h2 className="text-2xl font-display font-black uppercase italic tracking-tighter" style={{ color: 'var(--text-main)' }}>Registro de Desempeño</h2>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Ingresa las estadísticas clave por sección para cada jugador.</p>
                </div>

                <div className="space-y-6">
                    {players.map(player => (
                        <div key={player.id} className="border rounded-3xl p-5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                            <div className="flex items-center gap-4 mb-5 pb-4 border-b" style={{ borderColor: 'var(--border-main)' }}>
                                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--bg-main)' }}>
                                    {player.photo_url ? (
                                        <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-xs" style={{ color: 'var(--text-muted)' }}>{player.name[0]}</div>
                                    )}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <h3 className="font-black text-sm uppercase tracking-wide truncate" style={{ color: 'var(--text-main)' }}>{player.name}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                        <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>#{player.jersey_number || '00'}</span>
                                        {(player.display_positions || player.position_name || '').split(',').filter(Boolean).slice(0,3).map((pos, i) => {
                                            const pl = pos.toLowerCase().trim();
                                            let c = 'var(--primary)';
                                            if (PHASES.defense.some(k => pl.includes(k))) c = '#3b82f6';
                                            else if (PHASES.special.some(k => pl.includes(k))) c = '#f59e0b';
                                            return <span key={i} className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md" style={{ backgroundColor: `${c}18`, color: c, border: `1px solid ${c}30` }}>{pos.replace(/\s*\([^)]*\)/,'').trim()}</span>;
                                        })}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleStatChange(player.id, 'is_mvp', !stats[player.id]?.is_mvp)}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${stats[player.id]?.is_mvp ? 'text-white' : ''}`}
                                    style={{ 
                                        backgroundColor: stats[player.id]?.is_mvp ? 'var(--primary)' : 'var(--bg-main)',
                                        borderColor: 'var(--border-main)',
                                        borderWidth: stats[player.id]?.is_mvp ? '0px' : '1px'
                                    }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill={stats[player.id]?.is_mvp ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>
                                </button>
                            </div>

                            {(() => {
                                const ph = getPhases(player);
                                const StepField = ({ pid, fid, label, delta = 1, active, color, btnColor }) => (
                                    <div className="flex flex-col gap-2" style={{ opacity: active ? 1 : 0.45 }}>
                                        <span className="text-[9px] font-black uppercase tracking-tighter truncate"
                                            style={{ color: active ? color : 'var(--text-dim)' }}>{label}</span>
                                        <div className="flex items-center bg-zinc-950/80 rounded-xl border p-1"
                                            style={{ borderColor: active ? `${color}50` : 'var(--border-main)', boxShadow: active && (stats[pid]?.[fid] || 0) > 0 ? `0 0 0 2px ${color}20` : 'none' }}>
                                            <button onClick={() => decrement(pid, fid, delta)} className="w-7 h-7 rounded-lg flex items-center justify-center bg-zinc-800 text-zinc-100 active:scale-90 transition-transform font-black text-sm">-</button>
                                            <input type="number" value={stats[pid]?.[fid] || 0}
                                                onChange={e => handleStatChange(pid, fid, e.target.value)}
                                                className="w-10 bg-transparent text-center text-xs font-black outline-none text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                            <button onClick={() => increment(pid, fid, delta)}
                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-white active:scale-90 transition-transform font-black text-sm"
                                                style={{ backgroundColor: btnColor }}>+</button>
                                        </div>
                                    </div>
                                );
                                return (
                                    <div className="space-y-4">
                                        {/* OFENSIVA */}
                                        <div className="p-4 rounded-2xl transition-all"
                                            style={{ backgroundColor: ph.offense ? 'rgba(220,38,38,0.05)' : 'var(--bg-main)', border: ph.offense ? '1px solid rgba(220,38,38,0.25)' : '1px solid var(--border-main)' }}>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-3 rounded-full" style={{ backgroundColor: 'var(--primary)', opacity: ph.offense ? 1 : 0.3 }} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: ph.offense ? 'var(--primary)' : 'var(--text-muted)', opacity: ph.offense ? 1 : 0.5 }}>Ataque (Yardas)</span>
                                                </div>
                                                {ph.offense && <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(220,38,38,0.15)', color: 'var(--primary)', border: '1px solid rgba(220,38,38,0.3)' }}>Tu zona ★</span>}
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                                <StepField pid={player.id} fid="yards_passing" label="Pass Yds (QB)" delta={5} active={ph.offense} color="var(--primary)" btnColor="#dc2626" />
                                                <StepField pid={player.id} fid="yards_rushing" label="Rush Yds (Car)" delta={5} active={ph.offense} color="var(--primary)" btnColor="#dc2626" />
                                                <StepField pid={player.id} fid="yards_receiving" label="Rec Yds (WR)" delta={5} active={ph.offense} color="var(--primary)" btnColor="#dc2626" />
                                                <StepField pid={player.id} fid="td_offense" label="TD-OF (Ataque)" active={ph.offense} color="var(--primary)" btnColor="#dc2626" />
                                            </div>
                                        </div>
                                        {/* DEFENSIVA */}
                                        <div className="p-4 rounded-2xl transition-all"
                                            style={{ backgroundColor: ph.defense ? 'rgba(59,130,246,0.05)' : 'var(--bg-main)', border: ph.defense ? '1px solid rgba(59,130,246,0.25)' : '1px solid var(--border-main)' }}>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-3 rounded-full bg-blue-500" style={{ opacity: ph.defense ? 1 : 0.3 }} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: ph.defense ? '#3b82f6' : 'var(--text-muted)', opacity: ph.defense ? 1 : 0.5 }}>Defensa</span>
                                                </div>
                                                {ph.defense && <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}>Tu zona ★</span>}
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                                <StepField pid={player.id} fid="td_defense" label="TD-DF (Defensa)" active={ph.defense} color="#3b82f6" btnColor="#2563eb" />
                                                <StepField pid={player.id} fid="tackles" label="TCK (Tackles)" active={ph.defense} color="#3b82f6" btnColor="#2563eb" />
                                                <StepField pid={player.id} fid="interceptions" label="INT (Intercep)" active={ph.defense} color="#3b82f6" btnColor="#2563eb" />
                                                <StepField pid={player.id} fid="sacks" label="Sacks (Captura)" active={ph.defense} color="#3b82f6" btnColor="#2563eb" />
                                            </div>
                                        </div>
                                        {/* ESPECIALES */}
                                        <div className="p-4 rounded-2xl transition-all"
                                            style={{ backgroundColor: ph.special ? 'rgba(245,158,11,0.05)' : 'var(--bg-main)', border: ph.special ? '1px solid rgba(245,158,11,0.25)' : '1px solid var(--border-main)' }}>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-3 rounded-full bg-amber-500" style={{ opacity: ph.special ? 1 : 0.3 }} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: ph.special ? '#f59e0b' : 'var(--text-muted)', opacity: ph.special ? 1 : 0.5 }}>Equipos Especiales</span>
                                                </div>
                                                {ph.special && <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>Tu zona ★</span>}
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                                <StepField pid={player.id} fid="points_extra" label="Ext (Puntos Extra)" active={ph.special} color="#f59e0b" btnColor="#d97706" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    ))}

                    {players.length === 0 && (
                        <div className="text-center py-20 border border-dashed rounded-[2.5rem]" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                            <p className="font-black uppercase text-[10px] tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>No hay jugadores activos en esta categoría</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Floating Action Button for Saving */}
            <div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center px-6">
                <button 
                    onClick={handleSave}
                    disabled={saving || players.length === 0}
                    className="w-full max-w-sm py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl active:scale-95 transition-all text-white flex items-center justify-center gap-3"
                    style={{ backgroundColor: 'var(--primary)', boxShadow: '0 10px 40px -10px var(--primary)' }}
                >
                    {saving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/></svg>
                            Finalizar Estadísticas
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default AdminStats;
