import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SvgIcon from '../components/SvgIcon';

const MatchStatsCapture = () => {
    const { matchId } = useParams();
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
                const mRes = await fetch(`/api/matches/${matchId}`);
                if (!mRes.ok) throw new Error('Match not found');
                const mData = await mRes.json();
                setMatch(mData);

                // 2. Get Roster for that category
                const pRes = await fetch(`/api/players/category/${mData.category_id}`);
                const pData = await pRes.json();
                
                // 3. Get Existing stats if any
                const perfRes = await fetch(`/api/stats/match/${matchId}/performances`);
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
        setStats(prev => ({
            ...prev,
            [playerId]: {
                ...prev[playerId],
                [field]: value
            }
        }));
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
            <header className="sticky top-0 z-50 backdrop-blur-md border-b px-6 py-4" style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-main)' }}>
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-dim)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <div className="text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Planilla Digital</p>
                        <h1 className="text-sm font-black uppercase italic" style={{ color: 'var(--text-main)' }}>VS {match?.opponent || match?.visitor_name || 'Rival'}</h1>
                    </div>
                    <button 
                        onClick={handleSave} 
                        disabled={saving || players.length === 0}
                        className="text-xs font-black uppercase tracking-widest disabled:opacity-50"
                        style={{ color: 'var(--primary)' }}
                    >
                        {saving ? '...' : 'Save'}
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
                    <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-[var(--primary)]"></div>
                            <h2 className="text-2xl font-display font-black uppercase italic tracking-tighter" style={{ color: 'var(--text-main)' }}>Registro de Desempeño</h2>
                        </div>
                        <button 
                            onClick={() => setShowGlossary(true)} 
                            className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors active:scale-90"
                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-dim)' }}
                        >
                            <SvgIcon src="/icons/question-svgrepo-com.svg" className="w-5 h-5" />
                        </button>
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
                                        <div className="w-full h-full flex items-center justify-center font-bold" style={{ color: 'var(--text-muted)' }}>{player.name[0]}</div>
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-black text-sm uppercase tracking-wide truncate" style={{ color: 'var(--text-main)' }}>{player.name}</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>#{player.jersey_number || '00'} • {player.position_name || 'JDR'}</p>
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

                            <div className="space-y-6">
                                {/* OFENSIVA */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-3 bg-[var(--primary)]"></div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>Sección Ofensiva</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest ml-1" style={{ color: 'var(--text-muted)' }}>Pass Yds (QB)</label>
                                            <input 
                                                type="number" 
                                                className="w-full border rounded-xl px-4 py-2 text-sm font-black outline-none focus:border-[var(--primary)] transition-colors"
                                                style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                                                value={stats[player.id]?.yards_passing || 0}
                                                onChange={(e) => handleStatChange(player.id, 'yards_passing', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest ml-1" style={{ color: 'var(--text-muted)' }}>Rush Yds (Car)</label>
                                            <input 
                                                type="number" 
                                                className="w-full border rounded-xl px-4 py-2 text-sm font-black outline-none focus:border-[var(--primary)] transition-colors"
                                                style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                                                value={stats[player.id]?.yards_rushing || 0}
                                                onChange={(e) => handleStatChange(player.id, 'yards_rushing', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest ml-1" style={{ color: 'var(--text-muted)' }}>Rec Yds (Rec)</label>
                                            <input 
                                                type="number" 
                                                className="w-full border rounded-xl px-4 py-2 text-sm font-black outline-none focus:border-[var(--primary)] transition-colors"
                                                style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                                                value={stats[player.id]?.yards_receiving || 0}
                                                onChange={(e) => handleStatChange(player.id, 'yards_receiving', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest ml-1" style={{ color: 'var(--text-muted)' }}>TD-OF (Touchdown)</label>
                                            <input 
                                                type="number" 
                                                className="w-full border rounded-xl px-4 py-2 text-sm font-black outline-none focus:border-[var(--primary)] transition-colors"
                                                style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--primary)', borderOpacity: 0.3, color: 'var(--text-main)' }}
                                                value={stats[player.id]?.td_offense || 0}
                                                onChange={(e) => handleStatChange(player.id, 'td_offense', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* DEFENSIVA */}
                                <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--border-main)' }}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-3 bg-blue-600"></div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>Sección Defensiva</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest ml-1" style={{ color: 'var(--text-muted)' }}>TCK (Tackles)</label>
                                            <input 
                                                type="number" 
                                                className="w-full border rounded-xl px-4 py-2 text-sm font-black outline-none focus:border-[var(--primary)] transition-colors"
                                                style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                                                value={stats[player.id]?.tackles || 0}
                                                onChange={(e) => handleStatChange(player.id, 'tackles', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest ml-1" style={{ color: 'var(--text-muted)' }}>INT (Intercep)</label>
                                            <input 
                                                type="number" 
                                                className="w-full border rounded-xl px-4 py-2 text-sm font-black outline-none focus:border-[var(--primary)] transition-colors"
                                                style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                                                value={stats[player.id]?.interceptions || 0}
                                                onChange={(e) => handleStatChange(player.id, 'interceptions', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest ml-1" style={{ color: 'var(--text-muted)' }}>Sacks (Captura)</label>
                                            <input 
                                                type="number" 
                                                className="w-full border rounded-xl px-4 py-2 text-sm font-black outline-none focus:border-[var(--primary)] transition-colors"
                                                style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                                                value={stats[player.id]?.sacks || 0}
                                                onChange={(e) => handleStatChange(player.id, 'sacks', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest ml-1" style={{ color: 'var(--text-muted)' }}>TD-DF (Defensivo)</label>
                                            <input 
                                                type="number" 
                                                className="w-full border rounded-xl px-4 py-2 text-sm font-black outline-none focus:border-[var(--primary)] transition-colors"
                                                style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                                                value={stats[player.id]?.td_defense || 0}
                                                onChange={(e) => handleStatChange(player.id, 'td_defense', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* ESPECIALES */}
                                <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--border-main)' }}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-3 bg-amber-500"></div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>Equipos Especiales</h4>
                                    </div>
                                    <div className="grid grid-cols-1">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest ml-1" style={{ color: 'var(--text-muted)' }}>Ext (Puntos Extra / PAT)</label>
                                            <input 
                                                type="number" 
                                                className="w-full border rounded-xl px-4 py-2 text-sm font-black outline-none focus:border-[var(--primary)] transition-colors"
                                                style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                                                value={stats[player.id]?.points_extra || 0}
                                                onChange={(e) => handleStatChange(player.id, 'points_extra', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {players.length === 0 && (
                        <div className="text-center py-20 border border-dashed rounded-[2.5rem]" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                            <p className="font-black uppercase text-[10px] tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>No hay jugadores en esta categoría</p>
                            <Link to="/players/new" className="font-bold text-xs uppercase tracking-widest underline underline-offset-4" style={{ color: 'var(--primary)' }}>
                                Ir a Alta de Jugador
                            </Link>
                        </div>
                    )}
                </div>

                <div className="mt-12">
                    <button 
                        onClick={handleSave}
                        disabled={saving || players.length === 0}
                        className="w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl active:scale-95 transition-all text-white"
                        style={{ backgroundColor: 'var(--primary)', shadowColor: 'rgba(var(--primary-rgb), 0.4)' }}
                    >
                        {saving ? 'Procesando...' : 'Finalizar Estadísticas'}
                    </button>
                    <p className="text-center text-[10px] uppercase font-bold mt-4 tracking-widest" style={{ color: 'var(--text-muted)' }}>Al finalizar, los totales se reflejarán en las Player Cards.</p>
                </div>
            </main>
        </div>
    );
};

export default MatchStatsCapture;
