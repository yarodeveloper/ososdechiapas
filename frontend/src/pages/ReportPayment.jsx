import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ReportPayment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [method, setMethod] = useState('SPEI'); // SPEI, CARD, OXXO
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [bankSettings, setBankSettings] = useState({
        bank_name: '',
        bank_holder: '',
        bank_clabe: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            setBankSettings({
                bank_name: data.bank_name || 'Cargando...',
                bank_holder: data.bank_holder || 'Cargando...',
                bank_clabe: data.bank_clabe || 'Cargando...'
            });
        } catch (err) {
            console.error('Error fetching bank settings:', err);
        }
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;
        setFile(selected);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(selected);
    };

    const handleSubmit = async () => {
        if (!file) {
            alert('Por favor sube una foto de tu comprobante');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('payment_method', method === 'SPEI' ? 'Transferencia SPEI' : method === 'CARD' ? 'Tarjeta' : 'OXXO');
        formData.append('receipt', file);

        try {
            const res = await fetch(`/api/payments/${id}/report`, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                alert('¡Pago reportado! Validaremos tu comprobante a la brevedad.');
                navigate('/portal/payments');
            } else {
                alert('Error al enviar el reporte');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const copyClabe = () => {
        navigator.clipboard.writeText(bankSettings.bank_clabe);
        alert('CLABE copiada al portapapeles');
    };

    return (
        <div className="bg-[#0f0a0a] min-h-screen text-white font-outfit pb-12">
            <div className="max-w-md mx-auto">
                
                {/* ── Header ────────────────────────────────────────────────────────── */}
                <header className="px-6 py-6 flex justify-between items-center">
                    <button onClick={() => navigate(-1)} className="text-red-600">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-sm font-black uppercase tracking-[0.2em] italic">MÉTODOS DE PAGO</h1>
                    <div className="w-8 h-8 rounded-full border border-red-600/30 flex items-center justify-center bg-zinc-900 p-1">
                        <img src="/logo_osos.webp" alt="Osos" className="w-full h-full object-contain" />
                    </div>
                </header>

                <main className="px-6 space-y-8">
                    
                    {/* ── Method Selector ──────────────────────────────────────────────── */}
                    <section>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-5 ml-1 italic">SELECCIONA TU MÉTODO</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {/* Option 1: Card */}
                            <div 
                                onClick={() => setMethod('CARD')}
                                className={`relative h-36 rounded-2xl flex flex-col items-center justify-center transition-all border-2 cursor-pointer
                                    ${method === 'CARD' ? 'bg-[#2a1515] border-red-600 shadow-lg shadow-red-900/20' : 'bg-[#1a1212] border-transparent'}
                                `}
                            >
                                <svg width="32" height="32" viewBox="0 0 24 24" fill={method === 'CARD' ? '#dc2626' : '#555'} className="mb-4">
                                    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                                </svg>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-center px-4 leading-tight">
                                    TARJETA DE CRÉDITO/DÉBITO
                                </span>
                            </div>

                            <div className="space-y-4">
                                {/* Option 2: SPEI */}
                                <div 
                                    onClick={() => setMethod('SPEI')}
                                    className={`relative h-[4.5rem] rounded-2xl flex items-center px-5 gap-4 transition-all border-2 cursor-pointer
                                        ${method === 'SPEI' ? 'bg-[#2a1515] border-red-600 shadow-lg shadow-red-900/20' : 'bg-[#1a1212] border-transparent'}
                                    `}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill={method === 'SPEI' ? '#dc2626' : '#555'}>
                                        <path d="M3 21h18M3 10h18M5 10v11M19 10v11M12 10v11M2 10l10-7 10 7"/>
                                    </svg>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">TRANSFERENCIA SPEI</span>
                                    {method === 'SPEI' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-600 rounded-r"></div>}
                                </div>

                                {/* Option 3: OXXO */}
                                <div 
                                    onClick={() => setMethod('OXXO')}
                                    className={`relative h-[4.5rem] rounded-2xl flex items-center px-5 gap-4 transition-all border-2 cursor-pointer
                                        ${method === 'OXXO' ? 'bg-[#2a1515] border-red-600 shadow-lg shadow-red-900/20' : 'bg-[#1a1212] border-transparent'}
                                    `}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={method === 'OXXO' ? '#dc2626' : '#555'} strokeWidth="2.5">
                                        <path d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2M8 7v10M12 7v10M16 7v10"/>
                                    </svg>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">PAGO EN OXXO</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── Bank Details (Conditional) ──────────────────────────────────── */}
                    {method === 'SPEI' && (
                        <section className="bg-gradient-to-br from-[#1a1212] to-[#100a0a] border border-white/5 rounded-[2rem] p-7 relative">
                            <svg className="absolute top-6 right-6 text-red-600/30" width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                            </svg>
                            
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-1 leading-none">BANCO DESTINATARIO</p>
                                    <p className="text-xl font-black uppercase tracking-tight">{bankSettings.bank_name}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-1 leading-none">TITULAR</p>
                                    <p className="text-sm font-black uppercase tracking-tight">{bankSettings.bank_holder}</p>
                                </div>
                                <div className="bg-black/30 border border-white/5 rounded-2xl p-5 flex justify-between items-center">
                                    <div className="flex-grow pr-2">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-2 leading-none">CLABE INTERBANCARIA</p>
                                        <p className="text-lg font-black tracking-widest leading-none break-all">{bankSettings.bank_clabe}</p>
                                    </div>
                                    <button 
                                        onClick={copyClabe}
                                        className="bg-red-600 text-white px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-700 active:scale-90 transition-all shrink-0"
                                    >
                                        COPIAR<br/>CLABE
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ── Photo Upload Area ────────────────────────────────────────────── */}
                    <section>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-0.5 bg-red-600"></div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest italic">¿PAGASTE EN EFECTIVO O BANCO?</h3>
                        </div>

                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className={`h-64 rounded-[2.5rem] border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer p-4
                                ${preview ? 'bg-[#2a1515]/20 border-red-600' : 'bg-black/20 border-zinc-800 hover:border-zinc-600'}
                            `}
                        >
                            {preview ? (
                                <img src={preview} alt="Comprobante" className="w-full h-full object-contain rounded-2xl" />
                            ) : (
                                <>
                                    <div className="w-20 h-20 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mb-5 shadow-2xl">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="#dc2626">
                                            <path d="M12 11c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 2c0-3.31-2.69-6-6-6s-6 2.69-6 6c0 3.31 2.69 6 6 6s6-2.69 6-6zm4 0c0 5.52-4.48 10-10 10S2 18.52 2 13 6.48 3 12 3s10 4.48 10 10z"/>
                                            <path d="M12 9c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" opacity=".3"/>
                                            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-black uppercase tracking-tight text-center">Subir Foto de Ticket/Comprobante</p>
                                    <p className="text-[10px] text-zinc-500 mt-2 font-bold uppercase tracking-widest">JPG, PNG o PDF (Máx. 5MB)</p>
                                </>
                            )}
                            <input 
                                ref={fileInputRef} 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                    </section>

                    {/* ── Action Button ────────────────────────────────────────────────── */}
                    <div className="pt-4">
                        <button 
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-red-600 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-red-900/50 hover:bg-red-700 active:scale-95 transition-all"
                        >
                            {loading ? 'ENVIANDO...' : 'HECHO'}
                        </button>
                    </div>

                </main>
            </div>
        </div>
    );
};

export default ReportPayment;
