import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const PortalPayments = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialFilter = queryParams.get('filter') || 'pending';

    const [user, setUser] = useState(null);
    const [payments, setPayments] = useState([]);
    const [bankInfo, setBankInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState(initialFilter); // 'pending' or 'paid'

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        fetchPayments(parsedUser.id);
        fetchBankInfo();
        
        // Update view if query param changes
        if (queryParams.get('filter')) setView(queryParams.get('filter'));
    }, [location.search]);

    const fetchPayments = async (userId) => {
        try {
            const res = await fetch(`/api/payments/user/${userId}`);
            const data = await res.json();
            setPayments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching payments:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBankInfo = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            setBankInfo(data);
        } catch (err) { console.error(err); }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'paid': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'validating': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'late': return 'text-red-500 bg-red-600 text-white';
            default: return 'text-zinc-500 bg-zinc-500/10';
        }
    };

    if (loading) return <div className="bg-black min-h-screen flex items-center justify-center text-white italic">Sincronizando Estado de Cuenta...</div>;

    const filteredList = payments.filter(p => {
        if (view === 'paid') return p.status === 'paid';
        return p.status !== 'paid';
    });

    const totalPaid = payments.filter(p => p.status === 'paid').reduce((acc, p) => acc + parseFloat(p.amount), 0);
    const pendingItems = payments.filter(p => p.status !== 'paid' && p.status !== 'validating');
    const totalPending = pendingItems.reduce((acc, p) => acc + parseFloat(p.amount), 0);

    return (
        <div className="min-h-screen font-outfit pb-32 overflow-x-hidden" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
            <header className="fixed top-0 left-0 w-full backdrop-blur-xl border-b z-50 transition-colors" style={{ backgroundColor: 'var(--nav-bg)', borderColor: 'var(--border-main)' }}>
                <div className="max-w-md mx-auto px-6 h-18 flex items-center justify-between py-5">
                    <button onClick={() => navigate('/portal')} className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-90" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-dim)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                    <h1 className="text-xs font-black uppercase tracking-[0.3em] italic" style={{ color: 'var(--text-dim)' }}>Estado de <span className="text-red-600">Cuenta</span></h1>
                    <div className="w-10"></div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 pt-24 space-y-8">
                
                {/* ── Tabs ── */}
                <div className="flex p-1.5 rounded-2xl border shadow-xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                    <button 
                        onClick={() => setView('pending')}
                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${view === 'pending' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'opacity-40'}`}
                        style={view !== 'pending' ? { color: 'var(--text-main)' } : {}}
                    >
                        Deudas
                    </button>
                    <button 
                        onClick={() => setView('paid')}
                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${view === 'paid' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'opacity-40'}`}
                        style={view !== 'paid' ? { color: 'var(--text-main)' } : {}}
                    >
                        Mis Recibos
                    </button>
                </div>

                {view === 'pending' && bankInfo && bankInfo.bank_clabe && (
                    <section className="rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                        <div className="absolute top-0 right-0 p-4 opacity-5"><svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M3 21h18M3 10h18M5 10v11M19 10v11M12 10v11M2 10l10-7 10 7"/></svg></div>
                        <div className="relative z-10 space-y-4">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 italic leading-none">Datos de Transferencia (SPEI)</h2>
                            <div className="space-y-4 pt-2">
                                <div><p className="text-[8px] font-black uppercase tracking-widest mb-1 opacity-40">Banco</p><p className="text-sm font-black uppercase">{bankInfo.bank_name}</p></div>
                                <div><p className="text-[8px] font-black uppercase tracking-widest mb-1 opacity-40">CLABE</p><p className="text-lg font-mono font-black tracking-widest whitespace-nowrap">{bankInfo.bank_clabe}</p></div>
                                <div><p className="text-[8px] font-black uppercase tracking-widest mb-1 opacity-40">Titular</p><p className="text-xs font-bold uppercase italic line-clamp-1" style={{ color: 'var(--text-dim)' }}>{bankInfo.bank_holder}</p></div>
                            </div>
                        </div>
                    </section>
                )}

                <section className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] italic" style={{ color: 'var(--text-dim)' }}>
                            {view === 'paid' ? 'Historial de Pagos' : 'Cargos Pendientes'}
                        </h3>
                        {view === 'pending' && <span className="text-2xl font-black italic tracking-tighter" style={{ color: 'var(--text-main)' }}>$ {totalPending.toLocaleString()}</span>}
                        {view === 'paid' && <span className="text-2xl font-black italic tracking-tighter text-green-500">$ {totalPaid.toLocaleString()}</span>}
                    </div>

                    {filteredList.length === 0 ? (
                        <div className="rounded-[2.5rem] p-16 text-center italic opacity-30 text-xs uppercase font-black tracking-widest border border-dashed" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                            No hay {view === 'paid' ? 'recibos' : 'deudas'} registrados
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredList.map(p => (
                                <div key={p.id} className={`rounded-[2.5rem] p-6 shadow-xl transition-all border ${p.status === 'validating' ? 'border-amber-600/30' : ''}`} style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-[15px] font-black tracking-tight uppercase italic line-clamp-1" style={{ color: 'var(--text-main)' }}>{p.description}</h3>
                                            <p className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--text-dim)' }}>
                                                {p.status === 'paid' ? `PAGADO EL ${new Date(p.paid_at).toLocaleDateString()}` : `VENCE EL ${new Date(p.due_date).toLocaleDateString()}`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black italic tracking-tighter leading-none" style={{ color: 'var(--text-main)' }}>$ {parseFloat(p.amount).toLocaleString()}</p>
                                            <span className={`inline-block mt-2 text-[7px] font-black px-3 py-1 rounded-full uppercase border ${getStatusStyle(p.status)}`}>
                                                {p.status === 'validating' ? 'En Validación ⌛' : p.status}
                                            </span>
                                        </div>
                                    </div>

                                    {p.status !== 'paid' && p.status !== 'validating' && (
                                        <Link 
                                            to={`/portal/payments/${p.id}/report`}
                                            className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-500 py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all border border-red-600/20"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2v20m10-10H2"/></svg>
                                            Reportar Transferencia
                                        </Link>
                                    )}

                                    {p.status === 'validating' && (
                                        <div className="w-full bg-amber-600/5 border border-amber-600/10 py-4 rounded-2xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-amber-500">
                                            Ticket en revisión administrativa
                                        </div>
                                    )}

                                    {p.status === 'paid' && p.receipt_url && (
                                        <a 
                                            href={p.receipt_url} target="_blank" rel="noopener noreferrer"
                                            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest border active:scale-95 transition-all"
                                            style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)', color: 'var(--text-dim)' }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3"/></svg>
                                            Ver Mi Comprobante
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default PortalPayments;
