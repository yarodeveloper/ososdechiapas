import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLeads = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await fetch('/api/leads');
            const data = await res.json();
            setLeads(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching leads:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const res = await fetch(`/api/leads/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchLeads();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const deleteLead = async (id) => {
        if (!window.confirm('¿Eliminar este prospecto permanentemente?')) return;
        try {
            const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
            if (res.ok) fetchLeads();
        } catch (err) {
            console.error('Error deleting lead:', err);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-600/10 text-amber-500 border-amber-600/20';
            case 'contacted': return 'bg-blue-600/10 text-blue-500 border-blue-600/20';
            case 'converted': return 'bg-green-600/10 text-green-500 border-green-600/20';
            case 'discarded': return 'bg-zinc-800 text-zinc-500 border-zinc-700';
            default: return 'bg-zinc-800 text-zinc-400';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Pendiente';
            case 'contacted': return 'Contactado';
            case 'converted': return 'Ya es Oso';
            case 'discarded': return 'Descartado';
            default: return status;
        }
    };

    const filteredLeads = leads.filter(l => filter === 'all' || l.status === filter);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-display font-black italic uppercase tracking-widest text-zinc-500" style={{ backgroundColor: 'var(--bg-main)' }}>Rastreando Prospectos...</div>;

    return (
        <div className="min-h-screen font-body pb-32 selection:bg-red-600 transition-colors duration-300" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
            
            {/* Header Area */}
            <header className="fixed top-0 left-0 w-full backdrop-blur-xl border-b z-50 transition-colors" style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-main)' }}>
                <div className="max-w-md mx-auto px-6 py-5 flex justify-between items-center">
                    <button onClick={() => navigate('/admin/dashboard')} className="w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-900/50 border border-zinc-800 text-zinc-400">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="font-display font-black text-xs uppercase tracking-[0.3em] italic">Inbox <span className="text-red-600">Prospectos</span></span>
                    <div className="w-10"></div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 pt-24 space-y-8">
                
                {/* Stats Summary */}
                <section className="grid grid-cols-2 gap-4">
                    <div className="card p-6 border-2" style={{ borderColor: 'var(--border-main)' }}>
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-1">Nuevos Hoy</span>
                        <p className="text-3xl font-display font-black italic tracking-tighter text-red-600">
                            {leads.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length}
                        </p>
                    </div>
                    <div className="card p-6 border-2" style={{ borderColor: 'var(--border-main)' }}>
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-1">Por Contactar</span>
                        <p className="text-3xl font-display font-black italic tracking-tighter" style={{ color: 'var(--text-main)' }}>
                            {leads.filter(l => l.status === 'pending').length}
                        </p>
                    </div>
                </section>

                {/* Filters */}
                <section className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                    {['all', 'pending', 'contacted', 'converted', 'discarded'].map(f => (
                        <button 
                            key={f} 
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${filter === f ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-900/20' : ''}`}
                            style={{ 
                                backgroundColor: filter === f ? '' : 'var(--bg-card)', 
                                color: filter === f ? 'white' : 'var(--text-dim)',
                                borderColor: filter === f ? '' : 'var(--border-main)'
                            }}
                        >
                            {f === 'all' ? 'Todos' : getStatusLabel(f)}
                        </button>
                    ))}
                </section>

                {/* Leads List */}
                <section className="space-y-4">
                    {filteredLeads.length > 0 ? filteredLeads.map(lead => (
                        <div key={lead.id} className="card p-6 border-2 animate-fade relative overflow-hidden" style={{ borderColor: lead.status === 'pending' ? 'rgba(220, 38, 38, 0.2)' : 'var(--border-main)' }}>
                            
                            {lead.status === 'pending' && (
                                <div className="absolute top-0 right-0 w-16 h-16 bg-red-600/10 rounded-bl-[3rem] flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="flex justify-between items-start pr-8">
                                    <div>
                                        <h3 className="text-lg font-black uppercase italic tracking-tighter leading-none mb-1" style={{ color: 'var(--text-main)' }}>{lead.name}</h3>
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${getStatusStyle(lead.status)}`}>
                                            {getStatusLabel(lead.status)}
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-bold text-zinc-500">{new Date(lead.created_at).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
                                    <div className="flex items-center gap-2">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                        <span>Edad: {lead.child_age || '--'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.81 12.81 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                                        <span>{lead.phone}</span>
                                    </div>
                                </div>

                                {lead.message && (
                                    <p className="text-[10px] italic leading-relaxed text-zinc-400 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800">
                                        "{lead.message}"
                                    </p>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <a 
                                        href={`https://wa.me/52${lead.phone.replace(/\D/g,'')}?text=Hola%20${lead.name},%20vimos%20tu%20interés%20en%20Club%20Osos%20de%20Chiapas.%20¡Bienvenido%20a%20la%20manada!`} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="flex-1 bg-green-600 py-3 rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-green-900/20 active:scale-95 transition-all"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                        WhatsApp
                                    </a>
                                    <div className="flex gap-2">
                                        <select 
                                            value={lead.status}
                                            onChange={(e) => updateStatus(lead.id, e.target.value)}
                                            className="px-4 border rounded-xl text-[8px] font-black uppercase outline-none focus:border-red-600"
                                            style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-dim)', borderColor: 'var(--border-main)' }}
                                        >
                                            <option value="pending">Marcar Pendiente</option>
                                            <option value="contacted">Marcar Contactado</option>
                                            <option value="converted">Convertir a Jugador</option>
                                            <option value="discarded">Descartar</option>
                                        </select>
                                        <button 
                                            onClick={() => deleteLead(lead.id)}
                                            className="w-11 h-11 border rounded-xl flex items-center justify-center hover:text-red-500 transition-colors"
                                            style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)', color: 'var(--text-muted)' }}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-20 opacity-40 italic italic">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Bandeja vacía</p>
                            <p className="text-[9px] font-bold">No hay prospectos en esta categoría</p>
                        </div>
                    )}
                </section>
            </main>

            {/* Floating Notification Helper */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-[280px] z-[60]">
                 <div className="bg-red-600 text-white p-4 rounded-3xl shadow-2xl flex items-center gap-4 animate-slide-up">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 20V10M18 20V4M6 20v-6" /></svg>
                      </div>
                      <div>
                         <p className="text-[9px] font-black uppercase tracking-widest leading-none mb-1">Crecimiento Club</p>
                         <p className="text-[10px] font-bold opacity-90 leading-tight">Tienes {leads.filter(l => l.status === 'pending').length} prospectos esperando respuesta.</p>
                      </div>
                 </div>
            </div>

        </div>
    );
};

export default AdminLeads;
