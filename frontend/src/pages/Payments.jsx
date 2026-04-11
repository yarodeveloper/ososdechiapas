import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Payments = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewCharge, setShowNewCharge] = useState(false);
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        user_id: '',
        amount: '',
        description: '',
        due_date: new Date().toISOString().split('T')[0],
        category_id: ''
    });

    useEffect(() => {
        fetchData();
        fetchUsers();
        fetchCategories();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/payments');
            const data = await res.json();
            setPayments(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users/parents'); 
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setCategories(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleNewCharge = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowNewCharge(false);
                fetchData();
                setFormData({ ...formData, amount: '', description: '' });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const updateStatus = async (id, newStatus, method = 'Efectivo/Manual') => {
        const confirmMsg = newStatus === 'paid' ? '¿Confirmar este pago?' : '¿Regresar a PENDIENTE?';
        if (!window.confirm(confirmMsg)) return;
        
        try {
            const res = await fetch(`/api/payments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    status: newStatus, 
                    payment_method: method,
                    paid_at: newStatus === 'paid' ? new Date().toISOString() : null
                })
            });
            if (res.ok) fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const deletePayment = async (id) => {
        if (!window.confirm('¿ELIMINAR este cargo permanentemente?')) return;
        try {
            const res = await fetch(`/api/payments/${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'paid': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'validating': return 'text-amber-500 bg-amber-500/10 border-amber-500/20 animate-pulse';
            case 'pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'late': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
        }
    };

    const filteredPayments = payments.filter(p => {
        const matchesCat = filterCategory === 'all' || p.category_id?.toString() === filterCategory;
        const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
        return matchesCat && matchesStatus;
    });

    const pendingValidations = payments.filter(p => p.status === 'validating');

    if (loading) return <div className="bg-black min-h-screen flex items-center justify-center text-white">Sincronizando Finanzas...</div>;

    return (
        <div className="bg-black text-white min-h-screen font-body pb-32 selection:bg-red-600 overflow-x-hidden">
            <header className="fixed top-0 left-0 w-full bg-black/90 backdrop-blur-xl border-b border-zinc-900 z-50">
                <div className="max-w-md mx-auto px-6 py-5 flex justify-between items-center">
                    <button onClick={() => navigate('/admin/dashboard')} className="text-zinc-400 hover:text-white transition-colors">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="font-display font-black text-xs uppercase tracking-[0.3em] italic">Finanzas <span className="text-red-600">Osos</span></span>
                    <button 
                        onClick={() => setShowNewCharge(!showNewCharge)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${showNewCharge ? 'bg-red-600 text-white shadow-lg shadow-red-900/40 rotate-45' : 'bg-zinc-900 text-zinc-400'}`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                    </button>
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 pt-24 space-y-8">
                
                {/* New Charge Form */}
                {showNewCharge && (
                    <section className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 animate-slide-up shadow-2xl">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8 leading-none">
                            Generar<br/><span className="text-red-600">Nuevo Cobro</span>
                        </h2>
                        <form onSubmit={handleNewCharge} className="space-y-6">
                            <select 
                                required 
                                value={formData.user_id} 
                                onChange={e => setFormData({ ...formData, user_id: e.target.value })}
                                className="w-full bg-black border border-zinc-900 rounded-2xl py-4 px-5 text-[10px] font-black uppercase outline-none focus:border-red-600 text-zinc-400"
                            >
                                <option value="">SELECCIONAR PADRE/TUTOR</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                            </select>

                            <input 
                                required 
                                value={formData.description} 
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-black border border-zinc-900 rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:border-red-600 text-white placeholder-zinc-700" 
                                placeholder="Concepto del cobro (Ej: Colegiatura Abril)" 
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    required 
                                    type="number" 
                                    min="0"
                                    step="0.01"
                                    value={formData.amount} 
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full bg-black border border-zinc-900 rounded-2xl py-4 px-5 text-sm font-black outline-none focus:border-red-600 text-white placeholder-zinc-700" 
                                    placeholder="Monto $" 
                                />
                                <input 
                                    required 
                                    type="date" 
                                    value={formData.due_date} 
                                    onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                    className="w-full bg-black border border-zinc-900 rounded-2xl py-4 px-5 text-sm font-black outline-none focus:border-red-600 text-zinc-400" 
                                />
                            </div>

                            <select 
                                value={formData.category_id} 
                                onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                className="w-full bg-black border border-zinc-900 rounded-2xl py-4 px-5 text-[10px] font-black uppercase outline-none focus:border-red-600 text-zinc-400"
                            >
                                <option value="">APLICA A CATEGORÍA (OPCIONAL)</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>

                            <button type="submit" className="w-full bg-red-600 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest active:scale-95 transition-all shadow-xl shadow-red-900/20">
                                EMITIR CARGO
                            </button>
                        </form>
                    </section>
                )}

                {/* Pending Validations Banner */}
                {pendingValidations.length > 0 && (
                    <section className="bg-amber-600/10 border border-amber-600/20 p-6 rounded-[2rem] space-y-4 animate-fade shadow-2xl shadow-amber-900/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-black animate-bounce">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            </div>
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-amber-500">Tickets por Validar ({pendingValidations.length})</h2>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase leading-relaxed italic">Padres de familia han reportado pagos por transferencia. Te corresponde validar el ingreso.</p>
                        <button onClick={() => setFilterStatus('validating')} className="w-full py-3 bg-amber-600 rounded-xl text-[9px] font-black uppercase tracking-widest text-black shadow-lg">IR A VALIDACIONES</button>
                    </section>
                )}

                {/* Stats Summary */}
                <section className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-[2rem] shadow-xl">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_8px_red]"></div>
                             <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">PENDIENTE</p>
                        </div>
                        <p className="text-2xl font-display font-black italic tracking-tighter text-white leading-none">$ {payments.filter(p => p.status !== 'paid').reduce((acc, p) => acc + parseFloat(p.amount), 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-green-600/5 border border-green-600/10 p-5 rounded-[2rem] shadow-xl">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_green]"></div>
                             <p className="text-[8px] font-black uppercase tracking-widest text-green-600">COBRADO</p>
                        </div>
                        <p className="text-2xl font-display font-black italic tracking-tighter text-green-500 leading-none">$ {payments.filter(p => p.status === 'paid').reduce((acc, p) => acc + parseFloat(p.amount), 0).toLocaleString()}</p>
                    </div>
                </section>

                {/* Filters */}
                <section className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    <select 
                        value={filterCategory} 
                        onChange={e => setFilterCategory(e.target.value)}
                        className="bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500 outline-none focus:border-red-600 shrink-0"
                    >
                        <option value="all">TODAS LAS CATEGORÍAS</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select 
                        value={filterStatus} 
                        onChange={e => setFilterStatus(e.target.value)}
                        className="bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-4 text-[9px] font-black uppercase tracking-widest text-zinc-500 outline-none focus:border-red-600 shrink-0"
                    >
                        <option value="all">TODOS LOS ESTATUS</option>
                        <option value="validating">POR VALIDAR ⚠️</option>
                        <option value="pending">SOLO PENDIENTES</option>
                        <option value="paid">SOLO PAGADOS</option>
                    </select>
                </section>

                {/* List */}
                <section className="space-y-4 pb-20">
                    {filteredPayments.map(p => (
                        <div key={p.id} className={`bg-zinc-950 border rounded-[2.5rem] p-6 flex flex-col gap-6 shadow-2xl transition-all ${p.status === 'validating' ? 'border-amber-600/20' : 'border-zinc-900'}`}>
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-600 italic leading-none">{p.category_name || 'GENERAL'}</span>
                                    <h3 className="text-base font-black text-white uppercase italic tracking-tight">{p.parent_name}</h3>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{p.description}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase border mb-2 inline-block ${getStatusStyle(p.status)}`}>
                                        {p.status === 'validating' ? 'Por Validar' : p.status}
                                    </span>
                                    <p className="text-2xl font-display font-black italic tracking-tighter text-white leading-none">$ {parseFloat(p.amount).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Ticket / Approval Section */}
                            <div className="pt-5 border-t border-white/5 flex flex-col gap-4">
                                {p.receipt_url && (
                                    <div className="bg-black/50 border border-amber-600/10 rounded-2xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-500">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3"/></svg>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Referencia: {p.payment_method || 'SPEI'}</span>
                                                <a href={p.receipt_url} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-amber-500 uppercase tracking-widest underline">Ver Ticket Adjunto</a>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => updateStatus(p.id, 'paid', p.payment_method)}
                                            className="px-6 py-2 bg-amber-600 text-black text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg active:scale-95 transition-all"
                                        >
                                            APROBAR
                                        </button>
                                    </div>
                                )}

                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                                        {p.status === 'paid' ? `PAGADO: ${new Date(p.paid_at).toLocaleDateString()}` : `VENCE: ${new Date(p.due_date).toLocaleDateString()}`}
                                    </span>
                                    <div className="flex gap-3">
                                        {p.status !== 'paid' && !p.receipt_url && (
                                            <button onClick={() => updateStatus(p.id, 'paid')} className="text-zinc-600 hover:text-green-500 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest transition-all">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                                                Liquidar
                                            </button>
                                        )}
                                        <button onClick={() => deletePayment(p.id)} className="text-zinc-800 hover:text-red-500 transition-colors">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            </main>

            <nav className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-zinc-900 px-6 pt-4 pb-8 z-50 rounded-t-[2.5rem]">
                <div className="max-w-md mx-auto flex justify-between items-center px-4">
                    <Link to="/admin/dashboard" className="flex flex-col items-center gap-1.5 text-zinc-600">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">Inicio</span>
                    </Link>
                    <button className="flex flex-col items-center gap-1.5 text-red-600">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.82v-1.91c-1.24-.21-2.45-.66-3.48-1.39l1.1-1.74c.94.62 1.95 1.05 2.87 1.25.79.17 1.63.12 2.37-.15.42-.15.75-.45.92-.81.18-.38.16-.83-.05-1.19-.34-.6-1.1-1.01-2.48-1.48-1.73-.59-3.23-1.42-3.8-2.65-.29-.63-.33-1.33-.11-1.93.22-.59.66-1.07 1.23-1.34 1.14-.54 2.5-.66 3.77-.42V5h2.82v1.9c1.06.16 2.06.51 2.97 1.05l-1.01 1.74c-.87-.49-1.78-.81-2.73-.95-.76-.11-1.51-.01-2.22.28-.35.15-.62.4-.76.71-.13.31-.11.66.05.95.27.48.97.91 2.35 1.34 1.73.54 3.01 1.32 3.6 2.51.27.56.33 1.18.18 1.76-.14.58-.49 1.09-.98 1.41-1.02.66-2.3 1-3.6 1.01z"/></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">Finanzas</span>
                    </button>
                    <Link to="/admin/settings" className="flex flex-col items-center gap-1.5 text-zinc-600">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1V15a2 2 0 01-2-2 2 2 0 012-2v-.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2v.09a1.65 1.65 0 00-1.51 1z"/></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">Ajustes</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
};

export default Payments;
