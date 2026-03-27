import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getPositionAbbr = (name) => {
  if (!name) return null;
  const m = name.match(/\(([^)]+)\)/);
  return m ? m[1] : name.slice(0, 3).toUpperCase();
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
};

const calcAge = (dateStr) => {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="animate-pulse space-y-6 pt-24 px-5 max-w-md mx-auto">
    <div className="flex items-end gap-4">
      <div className="w-24 h-24 rounded-3xl bg-zinc-800" />
      <div className="flex-1 space-y-3 pb-1">
        <div className="h-5 bg-zinc-800 rounded-lg w-3/4" />
        <div className="h-3 bg-zinc-800 rounded w-1/2" />
        <div className="h-3 bg-zinc-800 rounded w-1/3" />
      </div>
    </div>
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-14 bg-zinc-900 rounded-2xl" />
      ))}
    </div>
  </div>
);

// ─── Info Row ─────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value, icon }) => (
  <div className="flex items-center gap-4 py-3.5 border-b border-zinc-800/60 last:border-0">
    <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-white truncate">{value || '—'}</p>
    </div>
  </div>
);

// ─── Edit Field ───────────────────────────────────────────────────────────────
const EditField = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block ml-1">{label}</label>
    {children}
  </div>
);

const inputClass = "w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-600/60 transition-colors";
const selectClass = "w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-red-600/60 appearance-none transition-colors";

// ─── Main Component ───────────────────────────────────────────────────────────
const PlayerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [player, setPlayer]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Catalogs
  const [positions, setPositions]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [bloodTypes, setBloodTypes] = useState([]);

  // Edit form state
  const [formData, setFormData] = useState({});
  const [photoFile, setPhotoFile]     = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // ── Fetch player and catalogs ───────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, posRes, catRes, btRes] = await Promise.all([
          fetch(`/api/players/${id}`),
          fetch('/api/catalogs/positions'),
          fetch('/api/categories'),
          fetch('/api/catalogs/blood-types'),
        ]);
        const p = await pRes.json();
        setPlayer(p);
        setFormData({
          name:            p.name || '',
          birth_date:      p.birth_date ? p.birth_date.split('T')[0] : '',
          curp:            p.curp || '',
          position_id:     p.position_id || '',
          category_id:     p.category_id || '',
          blood_type_id:   p.blood_type_id || '',
          emergency_phone: p.emergency_phone || '',
          allergies:       p.allergies || '',
        });
        setPositions(await posRes.json());
        setCategories(await catRes.json());
        setBloodTypes(await btRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Photo handler ───────────────────────────────────────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Máximo 5MB'); return; }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // ── Save edit ───────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));
      if (photoFile) data.append('photo', photoFile);

      const res = await fetch(`/api/players/${id}`, { method: 'PUT', body: data });
      if (!res.ok) throw new Error(await res.text());

      // Refresh player data
      const updated = await fetch(`/api/players/${id}`);
      setPlayer(await updated.json());
      setEditing(false);
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/players/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      navigate('/players/list');
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
      setDeleting(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setPhotoFile(null);
    setPhotoPreview(null);
    // Reset form to current player data
    setFormData({
      name:            player.name || '',
      birth_date:      player.birth_date ? player.birth_date.split('T')[0] : '',
      curp:            player.curp || '',
      position_id:     player.position_id || '',
      category_id:     player.category_id || '',
      blood_type_id:   player.blood_type_id || '',
      emergency_phone: player.emergency_phone || '',
    });
  };

  if (loading) return <div className="bg-black min-h-screen"><Skeleton /></div>;
  if (!player) return (
    <div className="bg-black min-h-screen flex items-center justify-center text-zinc-500">
      Jugador no encontrado
    </div>
  );

  const age = calcAge(player.birth_date);
  const abbr = getPositionAbbr(player.position_name);
  const currentPhoto = photoPreview || player.photo_url;
  const initials = player.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <div className="bg-black text-white min-h-screen pb-32">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 w-full bg-black/90 backdrop-blur-xl border-b border-zinc-900 z-50">
        <div className="max-w-md mx-auto px-5 py-4 flex justify-between items-center">
          <button
            onClick={() => editing ? cancelEdit() : navigate('/players/list')}
            className="w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            {editing ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            )}
          </button>

          <span className="font-black text-xs uppercase tracking-[0.25em] italic">
            {editing ? 'Editar Jugador' : 'Perfil'}
          </span>

          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            disabled={saving}
            className={`text-xs font-black uppercase tracking-widest transition-colors ${
              editing
                ? saving
                  ? 'text-zinc-600'
                  : 'text-red-500 hover:text-red-400'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {editing ? (saving ? 'Guardando...' : 'Guardar') : 'Editar'}
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-5 pt-20">

        {/* ── Hero: Avatar + Name ─────────────────────────────────────────── */}
        <div className="flex items-end gap-5 py-6 border-b border-zinc-900 mb-6">
          {/* Photo */}
          <div
            className={`relative flex-shrink-0 ${editing ? 'cursor-pointer' : ''}`}
            onClick={() => editing && fileInputRef.current?.click()}
          >
            <div className="w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center">
              {currentPhoto ? (
                <img src={currentPhoto} alt={player.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-zinc-500">{initials}</span>
              )}
            </div>
            {abbr && !editing && (
              <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-lg tracking-wider">
                {abbr}
              </div>
            )}
            {editing && (
              <div className="absolute inset-0 rounded-3xl bg-black/50 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0 pb-1">
            <h1 className="text-xl font-black uppercase italic leading-tight truncate mb-2">
              {player.name}
            </h1>
            <div className="flex flex-wrap gap-1.5">
              {player.category_name && (
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-lg">
                  {player.category_name}
                </span>
              )}
              {player.position_name && (
                <span className="text-[9px] font-bold uppercase tracking-widest text-red-400 bg-red-950/40 border border-red-900/30 px-2 py-1 rounded-lg">
                  {abbr}
                </span>
              )}
              {age && (
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-lg">
                  {age} años
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── VIEW MODE ───────────────────────────────────────────────────── */}
        {!editing && (
          <>
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl px-5 mb-6">
              <InfoRow label="Nombre Completo" value={player.name}
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
              />
              <InfoRow label="Fecha de Nacimiento" value={`${formatDate(player.birth_date)}${age ? ` (${age} años)` : ''}`}
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>}
              />
              <InfoRow label="CURP" value={player.curp}
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>}
              />
              <InfoRow label="Posición" value={player.position_name}
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
              />
              <InfoRow label="Categoría" value={player.category_name}
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>}
              />
              <InfoRow label="Tipo de Sangre" value={player.blood_type_name}
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5"><path d="M12 2C6 8 4 12 4 15a8 8 0 0016 0c0-3-2-7-8-13z"/></svg>}
              />
              <InfoRow label="Contacto de Emergencia" value={player.emergency_phone}
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.06 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-.76a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 15.92z"/></svg>}
              />
              <InfoRow label="Alergias / Padecimientos" value={player.allergies}
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4M12 16h.01" /></svg>}
              />
            </div>

            {/* Delete button */}
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full py-3.5 rounded-2xl border border-zinc-800 text-zinc-500 text-xs font-black uppercase tracking-widest hover:border-red-900/60 hover:text-red-500 transition-all"
            >
              Eliminar Jugador
            </button>
          </>
        )}

        {/* ── EDIT MODE ───────────────────────────────────────────────────── */}
        {editing && (
          <div className="space-y-4">
            <EditField label="Nombre Completo">
              <input className={inputClass} type="text" placeholder="Nombre completo"
                value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
            </EditField>

            <EditField label="Fecha de Nacimiento">
              <input className={inputClass} type="date"
                value={formData.birth_date} onChange={e => setFormData(p => ({ ...p, birth_date: e.target.value }))} />
            </EditField>

            <EditField label="CURP">
              <input className={inputClass} type="text" maxLength={18} placeholder="18 caracteres"
                value={formData.curp}
                onChange={e => setFormData(p => ({ ...p, curp: e.target.value.toUpperCase() }))} />
            </EditField>

            <div className="grid grid-cols-2 gap-3">
              <EditField label="Posición">
                <select className={selectClass} value={formData.position_id}
                  onChange={e => setFormData(p => ({ ...p, position_id: e.target.value }))}>
                  <option value="">— Elegir —</option>
                  {positions.map(pos => <option key={pos.id} value={pos.id}>{pos.name}</option>)}
                </select>
              </EditField>
              <EditField label="Categoría">
                <select className={selectClass} value={formData.category_id}
                  onChange={e => setFormData(p => ({ ...p, category_id: e.target.value }))}>
                  <option value="">— Elegir —</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </EditField>
            </div>

            <EditField label="Tipo de Sangre">
              <select className={selectClass} value={formData.blood_type_id}
                onChange={e => setFormData(p => ({ ...p, blood_type_id: e.target.value }))}>
                <option value="">— Seleccionar —</option>
                {bloodTypes.map(bt => <option key={bt.id} value={bt.id}>{bt.name}</option>)}
              </select>
            </EditField>

            <EditField label="Contacto de Emergencia">
              <input className={inputClass} type="tel" placeholder="961 000 0000"
                value={formData.emergency_phone}
                onChange={e => setFormData(p => ({ ...p, emergency_phone: e.target.value }))} />
            </EditField>

            <EditField label="Alergias / Padecimientos">
              <input className={inputClass} type="text" placeholder="Ej. Asma, Penicilina..."
                value={formData.allergies}
                onChange={e => setFormData(p => ({ ...p, allergies: e.target.value }))} />
            </EditField>

            <button
              onClick={handleSave}
              disabled={saving}
              className={`w-full py-4 rounded-2xl font-black text-white text-sm uppercase tracking-widest transition-all ${
                saving ? 'bg-red-900/50' : 'bg-red-600 hover:bg-red-700 active:scale-95 shadow-lg shadow-red-900/40'
              }`}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        )}
      </main>

      {/* ── Delete Confirmation Modal ──────────────────────────────────────── */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center px-5 pb-10">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 w-full max-w-md">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-900/40 flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6M9 6V4h6v2" />
              </svg>
            </div>
            <h3 className="text-center font-black text-base uppercase tracking-wide mb-2">¿Eliminar jugador?</h3>
            <p className="text-center text-zinc-500 text-xs mb-6">
              Esta acción no se puede deshacer. Se eliminará <span className="text-white font-bold">{player.name}</span> del roster permanentemente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3.5 rounded-2xl border border-zinc-800 text-zinc-400 text-xs font-black uppercase tracking-widest hover:border-zinc-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3.5 rounded-2xl bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-700 active:scale-95 transition-all"
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerDetail;
