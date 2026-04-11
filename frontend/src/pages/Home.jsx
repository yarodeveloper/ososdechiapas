import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { InstagramEmbed } from 'react-social-media-embed';

// --- Improved Components (Mobile Optimized) ---

const LiveTicker = ({ match }) => {
  const navigate = useNavigate();
  return (
    <div
      className="bg-black border-b border-zinc-900 py-3 px-6 flex justify-between items-center cursor-pointer active:bg-zinc-900 transition-colors z-[100] sticky top-0 backdrop-blur-md bg-black/80 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
      onClick={() => navigate('/login')}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-sm shadow-red-600"></div>
          <div className="absolute inset-0 w-1.5 h-1.5 bg-red-600 rounded-full animate-ping opacity-75"></div>
        </div>
        <span className="text-[9px] uppercase font-black tracking-widest text-zinc-500 whitespace-nowrap pt-0.5">Live Match</span>
      </div>

      <div className="flex items-center gap-6 md:gap-12 font-display font-black text-[14px] md:text-lg tracking-tighter italic italic">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-[10px] hidden md:block opacity-40">OSOS</span>
          <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{match?.home_score ?? 0}</span>
        </div>

        <div className="flex flex-col items-center justify-center gap-0.5 min-w-[50px]">
          <span className="text-red-600 text-[9px] font-black uppercase tracking-widest leading-none">{match?.current_quarter || match?.quarter || 'LIVE'}</span>
          <span className="text-[10px] font-bold text-zinc-600 tracking-tighter tabular-nums leading-none">{match?.time_left || '15:00'}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{match?.visitor_score ?? match?.away_score ?? 0}</span>
          <span className="text-zinc-500 text-[10px] uppercase truncate max-w-[60px] md:max-w-none opacity-40">{match?.visitor_name || match?.opponent || 'RIVAL'}</span>
        </div>
      </div>

      <div className="text-[9px] font-black text-zinc-500 uppercase flex items-center gap-1 group">
        <span className="hidden md:block opacity-40">Ver Detalle</span>
        <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center group-active:translate-x-1 transition-transform">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M9 18l6-6-6-6" /></svg>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="py-5 px-6 flex justify-between items-center relative z-50">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center shadow-2xl overflow-hidden shadow-red-900/10 transform-gpu hover:scale-105 transition-transform">
          <img src="/logo_osos.webp" alt="Logo Osos" className="w-10 h-10 object-contain drop-shadow-lg" />
        </div>
        <span className="font-display font-black text-xl tracking-tighter uppercase italic italic">Osos de Chiapas</span>
      </div>
      <button onClick={() => setIsOpen(!isOpen)} className="w-10 h-10 flex items-center justify-center text-white active:scale-95 transition-transform">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 8h16M4 16h16" /></svg>
      </button>
    </nav>
  );
};

const Hero = () => (
  <header className="relative min-h-[80vh] flex flex-col justify-end pb-12 px-6 overflow-hidden">
    <div className="absolute inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
      <img
        src="https://images.unsplash.com/photo-1566577739112-5180d4bf9390?q=80&w=1926&auto=format&fit=crop"
        alt="Fútbol Americano"
        className="w-full h-full object-cover object-[65%_center] opacity-40 grayscale contrast-125"
      />
    </div>

    <div className="relative z-10 animate-fade">
      <div className="w-12 h-1 bg-red-600 mb-5"></div>
      <h1 className="text-5xl md:text-8xl font-display font-black uppercase italic italic leading-[0.85] mb-5 tracking-tighter">
        Dominando <br />El Campo
      </h1>
      <p className="max-w-[280px] md:max-w-md text-zinc-400 text-sm md:text-base mb-10 font-medium leading-relaxed">
        Forjando la élite del fútbol americano en el corazón de Chiapas.
      </p>
      <button className="btn-primary w-full md:w-auto text-base py-4 shadow-2xl shadow-red-900/40">
        Ver el Playbook <svg className="ml-2 mt-0.5" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
      </button>
    </div>
  </header>
);

const ResultsGrid = () => (
  <section className="py-20 px-6">
    <div className="flex justify-between items-end mb-8">
      <div>
        <span className="text-red-600 font-display font-black text-[10px] uppercase tracking-[0.2em] block mb-1">Historial</span>
        <h2 className="text-4xl font-display font-black uppercase italic italic">Resultados</h2>
      </div>
      <div className="flex gap-2">
        <div className="w-8 h-1 bg-red-600 opacity-20"></div>
        <div className="w-4 h-1 bg-red-600"></div>
      </div>
    </div>

    <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar touch-pan-x">
      {[1, 2, i => i % 2 === 0].map((item, i) => (
        <div key={i} className="min-w-[260px] md:min-w-[300px] card p-6 group">
          <div className="flex justify-between items-center mb-6">
            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${i === 0 ? 'bg-red-600/10 text-red-500' : 'bg-zinc-800 text-zinc-500'}`}>
              {i === 0 ? 'Victoria' : 'Derrota'}
            </span>
            <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Oct 12</span>
          </div>
          <p className="text-zinc-500 text-[11px] font-black uppercase mb-2 tracking-widest">vs {i === 0 ? 'Aguilas' : 'Lobos'}</p>
          <div className="flex items-center justify-between">
            <span className="text-4xl font-display font-black group-active:text-red-500 transition-colors italic italic tracking-tighter">
              {i === 0 ? '28 - 14' : '21 - 24'}
            </span>
            <div className="w-12 h-12 rounded-2xl bg-zinc-800/50 flex items-center justify-center p-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-600"><path d="M12 2L4 5v11l8 3 8-3V5l-8-3z" /></svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const StatsPromo = () => {
  const navigate = useNavigate();
  return (
    <section className="py-12 px-6">
      <div 
        onClick={() => navigate('/estadisticas')}
        className="card p-8 relative overflow-hidden group cursor-pointer border-red-600/30 bg-gradient-to-br from-zinc-900 to-black active:scale-[0.98] transition-all"
      >
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-500">
          <img src="/icons/stats-svgrepo-com.svg" className="w-24 h-24 brightness-0 invert" alt="Stats" />
        </div>
        
        <div className="relative z-10">
          <span className="text-red-500 font-display font-black text-[10px] uppercase tracking-[0.3em] block mb-2">Game Center</span>
          <h2 className="text-3xl font-display font-black uppercase italic italic mb-4">Centro de <br/>Estadísticas</h2>
          <p className="text-zinc-500 text-xs font-medium max-w-[200px] mb-6 leading-relaxed">
            Consulta los records, líderes de la temporada y el desempeño de la manada.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white">
            Ver Player Cards <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeedComponent = () => {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
     fetch('/api/social').then(res=>res.json()).then(data=>setPosts(data)).catch(()=>{});
  }, []);

  return (
    <section className="py-24 px-6 bg-zinc-950 border-t border-zinc-900 border-b border-zinc-900">
      <div className="text-center mb-12">
        <div className="inline-block px-3 py-1 bg-zinc-900 rounded-full mb-4 border border-zinc-800 text-[9px] font-black uppercase tracking-[0.25em] text-red-600/60">
          Comunidad Osos
        </div>
        <h2 className="text-2xl font-display font-black uppercase italic italic tracking-tight mb-2">La vida de un Oso, no se detiene</h2>
        <p className="text-zinc-500 font-medium text-xs leading-relaxed">Vive el día a día de la manada desde el campo. Apoya dando ♡</p>
      </div>

      <div className="flex gap-6 flex-col md:flex-row md:overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar md:-mx-6 md:px-6 w-full items-center md:items-start">
        {posts.length > 0 ? posts.map(post => (
          <div key={post.id} className="w-full md:min-w-[328px] md:max-w-[400px] snap-center shrink-0 shadow-2xl rounded-[2.5rem] bg-black border border-white/5 relative overflow-hidden flex justify-center items-center p-2 isolate">
            <InstagramEmbed url={post.url} width="100%" captioned />
          </div>
        )) : (
           <div className="text-center w-full py-16 opacity-50 border border-zinc-800 border-dashed rounded-3xl mx-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Cargando Highlights Oficiales</span>
           </div>
        )}
      </div>

      <div className="flex justify-center flex-col items-center gap-4 mt-8">
        <a href="https://instagram.com/" target="_blank" rel="noreferrer" className="w-full max-w-xs border border-zinc-800 hover:border-red-600 hover:bg-red-600/10 py-5 px-8 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all">
          Siguenos @ososdechiapas
        </a>
      </div>
    </section>
  );
};

const CaptureForm = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simplified POST for faster experience
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).finally(() => {
      setLoading(false);
      setSuccess(true);
    });
  }

  return (
    <section className="py-24 px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-display font-black uppercase italic italic mb-4">Únete a la Élite</h2>
        <p className="text-zinc-500 font-medium text-sm leading-relaxed px-6">
          Forma parte de la tradición más grande del estado. Pruebas abiertas todo el año.
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <Link to="/login" className="btn-primary py-5">
          Acceso Portal Familiar
        </Link>

        <div className="flex items-center gap-3 py-4">
          <div className="flex-grow h-px bg-zinc-900"></div>
          <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">¿Nuevo Oso?</span>
          <div className="flex-grow h-px bg-zinc-900"></div>
        </div>

        {success ? (
          <div className="bg-red-600/10 text-red-500 border border-red-600/20 p-6 rounded-3xl text-center animate-fade">
            <p className="font-display font-black uppercase italic italic mb-1">¡Registro Exitoso!</p>
            <p className="text-xs font-semibold">Bienvenido a la manada, contactaremos pronto.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <input
              placeholder="Tu Nombre" required
              className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-sm focus:border-red-600 outline-none placeholder:text-zinc-600"
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              placeholder="Tu WhatsApp" required type="tel"
              className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-sm focus:border-red-600 outline-none placeholder:text-zinc-600"
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
            <button
              disabled={loading}
              className="w-full border border-red-600/50 text-red-500 font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl active:bg-red-600 active:text-white transition-all transform active:scale-[0.98]"
            >
              {loading ? 'Preparando Roster...' : 'Solicitar una Prueba Personalizada'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

const FooterComponent = () => (
  <footer className="py-24 px-6 bg-black border-t border-zinc-900 text-center pb-32">
    <div className="flex flex-col items-center gap-4 mb-10">
      <div className="font-display font-black text-3xl uppercase italic italic tracking-tighter">Osos Chiapas</div>
      <div className="w-10 h-1 bg-red-600/30"></div>
      <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em]">The Obsidian Elite • MDXXVI</p>
    </div>

    <div className="grid grid-cols-2 gap-y-6 gap-x-4 max-w-xs mx-auto text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-16">
      <a href="#">Join the Pack</a>
      <a href="#">Player Portal</a>
      <a href="#">Schedules</a>
      <a href="#">Legal Info</a>
    </div>

    <p className="text-zinc-800 text-[9px] font-bold">
      © 2026 CLUB OSOS DE CHIAPAS. PROYECTO ELITE.
    </p>
  </footer>
);

// --- Main Hero Page ---

const Home = () => {
  const navigate = useNavigate();
  const [liveMatch, setLiveMatch] = useState({ home_score: 24, away_score: 17, opponent: 'AGLS' });

  useEffect(() => {
    // Smart Access Check
    if (localStorage.getItem('token')) {
      navigate('/admin/dashboard');
    }

    fetch('/api/matches/live')
      .then(res => res.json())
      .then(data => data && setLiveMatch(data))
      .catch(() => { });
  }, [navigate]);

  return (
    <div className="bg-black text-white min-h-screen selection:bg-red-600 selection:text-white">
      <LiveTicker match={liveMatch} />
      <Navbar />
      <Hero />
      <ResultsGrid />
      <StatsPromo />
      <FeedComponent />
      <CaptureForm />
      <FooterComponent />
    </div>
  );
};

export default Home;
