import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  const [showInstall, setShowInstall] = useState(false);
  const [platform, setPlatform] = useState('other');
  const deferredPrompt = useRef(null);

  useEffect(() => {
    // Arrancar siempre desde arriba (arregla el salto de scroll en Safari)
    window.scrollTo(0, 0);

    const ua = navigator.userAgent || '';
    const iOS = /iP(hone|od|ad)/.test(ua) ||
      (ua.includes('Mac') && 'ontouchend' in document);
    const android = /Android/.test(ua);
    setPlatform(iOS ? 'ios' : android ? 'android' : 'other');

    const handler = (e) => { e.preventDefault(); deferredPrompt.current = e; };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt.current) {
      deferredPrompt.current.prompt();
      await deferredPrompt.current.userChoice;
      deferredPrompt.current = null;
    } else {
      setShowInstall(true);
    }
  };

  return (
    <div className="pm-wrap">
      <style>{CSS}</style>

      {/* ───────── HERO ───────── */}
      <header className="pm-hero">
        <span className="pm-eyebrow"><span className="pm-dot" />Compañía con IA · Argentina</span>
        <h1 className="pm-serif pm-h1">
          Que tenga con quién <span className="pm-em">charlar</span>, siempre.
        </h1>
        <p className="pm-lede">
          Pancho y Meli acompañan a tu ser querido todos los días: charlan,
          juegan, le ponen su música y avisan a la familia si algo pasa.
        </p>

        <div className="pm-faces">
          <div className="pm-face">
            <img src="/pancho.jpg" alt="Pancho" /><span className="pm-tag">Pancho</span>
          </div>
          <div className="pm-face">
            <img src="/meli.jpg" alt="Meli" /><span className="pm-tag">Meli</span>
          </div>
        </div>

        <div className="pm-chat">
          <div className="pm-chat-top">
            <img src="/meli.jpg" alt="Meli" />
            <div><div className="pm-nm">Meli</div><div className="pm-st">en línea</div></div>
          </div>
          <div className="pm-bubble pm-in">¿Va a ver los partidos de Argentina esta semana, Don Carlos?</div>
          <div className="pm-bubble pm-out">Uy, ni loco me los pierdo. Ando ansioso 😄</div>
          
          <div className="pm-bubble pm-in pm-typing"><span /><span /><span /></div>
        </div>

        <Link to="/entrar" className="pm-cta pm-cta-primary">Es para alguien que quiero</Link>
        <p className="pm-micro">7 días gratis · <b>Sin tarjeta</b> · Sin descargar nada</p>
      </header>

      {/* ───────── INSTALL ───────── */}
      <div className="pm-install">
        <button className="pm-install-bar" onClick={handleInstall}>
          <span className="pm-ic">📲</span>
          <span className="pm-install-txt">
            <span className="pm-t1">Instalá la app en el celular</span>
            <span className="pm-t2">Funciona en Android y iPhone</span>
          </span>
          <span className="pm-go">Instalar</span>
        </button>
      </div>

      {/* ───────── QUÉ HACE ───────── */}
      <section className="pm-sec">
        <div className="pm-kicker">Lo que hace cada día</div>
        <h2 className="pm-serif pm-h2">Un compañero, no un robot</h2>

        <div className="pm-feat"><span className="pm-fe">💬</span><div><h3>Charla de verdad</h3><p>Conversa con ida y vuelta, recuerda lo que hablaron ayer y comparte sus propias cosas. No interroga: acompaña.</p></div></div>
        <div className="pm-feat"><span className="pm-fe">🎵</span><div><h3>Su música de siempre</h3><p>Le pide un tango, un folklore o un bolero y se lo busca. La música que lo emociona, a un mensaje.</p></div></div>
        <div className="pm-feat"><span className="pm-fe">🌤️</span><div><h3>Saludo y compañía diaria</h3><p>Lo saluda a la mañana, le pregunta cómo durmió y cómo está el día. Una presencia constante.</p></div></div>
        <div className="pm-feat"><span className="pm-fe">🆘</span><div><h3>Aviso a la familia</h3><p>Si no se siente bien, avisa a la familia con un toque. Compañía con red de seguridad.</p></div></div>

        <div className="pm-games">
          <h3>Juegos y ejercicios para la mente</h3>
          <div className="pm-gcat">
            <div className="pm-gpill"><span className="pm-ge">🎯</span><span className="pm-gn">Clásicos</span><span className="pm-gd">Trivia, tutti frutti, bingo, refranes</span></div>
            <div className="pm-gpill"><span className="pm-ge">🧩</span><span className="pm-gn">Cognitivos</span><span className="pm-gd">Memoria, atención, agilidad mental</span></div>
            <div className="pm-gpill"><span className="pm-ge">🌍</span><span className="pm-gn">Idiomas</span><span className="pm-gd">Inglés y portugués, de a poquito</span></div>
            <div className="pm-gpill"><span className="pm-ge">🔮</span><span className="pm-gn">Adivinanzas</span><span className="pm-gd">Acertijos y cultura general</span></div>
          </div>
          <p className="pm-games-note">Y los pide hablando: «Pancho, juguemos al bingo» y listo.</p>
        </div>
      </section>

      {/* ───────── CÓMO FUNCIONA ───────── */}
      <section className="pm-sec pm-sec-cream">
        <div className="pm-kicker">En 2 minutos</div>
        <h2 className="pm-serif pm-h2">Cómo empezar</h2>
        <div className="pm-step"><div className="pm-n pm-serif">1</div><div><div className="pm-sh">Te registrás vos</div><div className="pm-sp">Como familiar, en dos minutos. Sin tarjeta para empezar.</div></div></div>
        <div className="pm-step"><div className="pm-n pm-serif">2</div><div><div className="pm-sh">Configurás a tu ser querido</div><div className="pm-sp">Su nombre y sus gustos. Después puede charlar con Pancho y con Meli, y cambiar cuando quiera.</div></div></div>
        <div className="pm-step"><div className="pm-n pm-serif">3</div><div><div className="pm-sh">Le pasás el link</div><div className="pm-sp">Por WhatsApp. Lo abre y ya tiene compañía, sin complicaciones.</div></div></div>
        <div className="pm-step-note">¿El abuelo se anima solo? <b>También puede registrarse él mismo</b> y probarlo sin ayuda de nadie.</div>
      </section>

      {/* ───────── DIFERENCIAL ───────── */}
      <section className="pm-sec">
        <div className="pm-diff">
          <h2 className="pm-serif">Compañía de verdad,<br />sin robots caros</h2>
          <p>Otros cobran cientos de dólares por un aparato. Pancho y Meli viven en el teléfono que tu ser querido ya tiene.</p>
          <div className="pm-rows">
            <div className="pm-row"><span className="pm-ck">✓</span>Sin comprar ningún aparato</div>
            <div className="pm-row"><span className="pm-ck">✓</span>En su propio celular, donde está cómodo</div>
            <div className="pm-row"><span className="pm-ck">✓</span>A un precio pensado para Argentina</div>
            <div className="pm-row"><span className="pm-ck">✓</span>Charlas 100% privadas, nunca un espía</div>
          </div>
        </div>
      </section>

      {/* ───────── PRECIO ───────── */}
      <section className="pm-sec pm-sec-cream">
        <div className="pm-kicker">Simple y accesible</div>
        <h2 className="pm-serif pm-h2">Un compa, todos los días</h2>
        <div className="pm-price">
          <div><span className="pm-amt pm-serif">$13.500</span><span className="pm-per"> /mes</span></div>
          <span className="pm-free">Primeros 7 días gratis</span>
          <ul>
            <li>Charlas ilimitadas todos los días</li>
            <li>Todos los juegos y ejercicios</li>
            <li>Música de su época</li>
            <li>Aviso a la familia</li>
          </ul>
          <Link to="/entrar" className="pm-cta pm-cta-primary">Empezar los 7 días gratis</Link>
          <p className="pm-micro" style={{ marginTop: 12 }}>Cancelás cuando quieras, sin vueltas.</p>
        </div>
      </section>

      {/* ───────── FOOTER ───────── */}
      <footer className="pm-footer">
        <div className="pm-foot-faces">
          <img src="/pancho.jpg" alt="Pancho" /><img src="/meli.jpg" alt="Meli" />
        </div>
        <div className="pm-fn pm-serif">Pancho&amp;Meli</div>
        <p>Compañía con IA para adultos mayores</p>
        <p>Hecho con 💛 en Córdoba, Argentina</p>
        <div className="pm-socials">
          <a href="https://instagram.com/panchoymeli.app" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://tiktok.com/@panchoymeli.app" target="_blank" rel="noreferrer">TikTok</a>
          <a href="https://youtube.com/@panchoymeli" target="_blank" rel="noreferrer">YouTube</a>
        </div>
        <p>¿Dudas? Escribinos a <b>vigia24app@gmail.com</b></p>
        <p className="pm-legal">
          <Link to="/privacidad">Política de Privacidad</Link>
          <span> · </span>
          <Link to="/terminos">Términos</Link>
        </p>
        <p className="pm-vigia">VIGIA Apps</p>
      </footer>

      {/* ───────── MODAL INSTALAR (iPhone / otros) ───────── */}
      {showInstall && (
        <div className="pm-modal" onClick={() => setShowInstall(false)}>
          <div className="pm-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="pm-modal-x" onClick={() => setShowInstall(false)}>✕</button>
            {platform === 'ios' ? (
              <>
                <h3 className="pm-serif">Instalar en iPhone</h3>
                <p className="pm-modal-sub">Es muy fácil, seguí estos 3 pasos:</p>
                <div className="pm-mstep"><span className="pm-mn">1</span><p>Tocá el botón <b>Compartir</b> abajo (el cuadradito con la flecha ⬆️)</p></div>
                <div className="pm-mstep"><span className="pm-mn">2</span><p>Deslizá y tocá <b>«Agregar a inicio»</b></p></div>
                <div className="pm-mstep"><span className="pm-mn">3</span><p>Tocá <b>«Agregar»</b> y listo: ya tenés el ícono en la pantalla</p></div>
              </>
            ) : (
              <>
                <h3 className="pm-serif">Instalar la app</h3>
                <p className="pm-modal-sub">Abrí esta página desde el navegador de tu celular:</p>
                <div className="pm-mstep"><span className="pm-mn">1</span><p>En <b>Android</b>: tocá el menú <b>⋮</b> arriba a la derecha y elegí <b>«Instalar app»</b> o <b>«Agregar a pantalla principal»</b></p></div>
                <div className="pm-mstep"><span className="pm-mn">2</span><p>En <b>iPhone</b>: abrila en Safari, tocá <b>Compartir</b> ⬆️ y <b>«Agregar a inicio»</b></p></div>
                <p className="pm-modal-sub" style={{ marginTop: 14 }}>El ícono va a aparecer como cualquier otra app. 💛</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const CSS = `
.pm-wrap{--linen:#F7F1E6;--linen2:#EFE6D5;--cream:#FFFDF8;--terra:#BC5836;--terra-d:#9E4527;--olive:#5E6B4F;--cacao:#322620;--cacao-soft:#5E4F45;--gold:#D29A52;
  max-width:480px;margin:0 auto;background:var(--linen);color:var(--cacao);overflow:hidden;
  font-family:'Nunito',system-ui,-apple-system,sans-serif;line-height:1.55;-webkit-font-smoothing:antialiased;color-scheme:light;}
.pm-wrap *{margin:0;padding:0;box-sizing:border-box;}
.pm-serif{font-family:'Fraunces','Georgia',serif;}

.pm-hero{padding:30px 24px 36px;background:radial-gradient(120% 80% at 50% 0%,#FBEFDD 0%,var(--linen) 55%);}
.pm-eyebrow{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--terra-d);background:#F3E2CF;padding:6px 12px;border-radius:100px;margin-bottom:20px;}
.pm-dot{width:7px;height:7px;border-radius:50%;background:var(--olive);}
.pm-h1{font-size:36px;line-height:1.08;font-weight:600;letter-spacing:-.01em;color:var(--cacao);margin-bottom:14px;}
.pm-em{color:var(--terra);font-style:italic;}
.pm-lede{font-size:16px;color:var(--cacao-soft);margin-bottom:24px;max-width:400px;}

.pm-faces{display:flex;align-items:flex-end;margin-bottom:22px;}
.pm-face{position:relative;}
.pm-face img{width:84px;height:84px;border-radius:20px;object-fit:cover;border:3px solid var(--cream);box-shadow:0 8px 22px rgba(50,38,32,.18);display:block;}
.pm-face:nth-child(2){margin-left:-14px;}
.pm-tag{position:absolute;bottom:-9px;left:50%;transform:translateX(-50%);font-size:11px;font-weight:800;color:var(--cacao);background:var(--cream);padding:2px 9px;border-radius:100px;box-shadow:0 2px 6px rgba(0,0,0,.1);}

.pm-chat{background:var(--cream);border-radius:22px;padding:16px;margin-bottom:26px;box-shadow:0 10px 30px rgba(50,38,32,.10);border:1px solid #EFE3D2;}
.pm-chat-top{display:flex;align-items:center;gap:9px;padding-bottom:11px;margin-bottom:12px;border-bottom:1px solid #F0E7D8;}
.pm-chat-top img{width:34px;height:34px;border-radius:50%;object-fit:cover;}
.pm-nm{font-weight:800;font-size:14px;}
.pm-st{font-size:11px;color:var(--olive);font-weight:700;}
.pm-bubble{max-width:82%;padding:10px 13px;border-radius:15px;font-size:14px;margin-bottom:9px;width:fit-content;}
.pm-in{background:var(--linen2);border-bottom-left-radius:5px;}
.pm-out{background:#E7EDE0;margin-left:auto;border-bottom-right-radius:5px;color:#3a4633;}
.pm-typing{display:inline-flex;gap:4px;padding:13px;margin-bottom:0;}
.pm-typing span{width:7px;height:7px;border-radius:50%;background:#B9A990;animation:pmtp 1.2s infinite;}
.pm-typing span:nth-child(2){animation-delay:.2s;}
.pm-typing span:nth-child(3){animation-delay:.4s;}
@keyframes pmtp{0%,60%,100%{transform:translateY(0);opacity:.5;}30%{transform:translateY(-5px);opacity:1;}}

.pm-cta{display:block;width:100%;text-align:center;padding:16px;border-radius:15px;font-family:'Nunito',sans-serif;font-size:16px;font-weight:800;cursor:pointer;border:none;text-decoration:none;transition:transform .12s ease;}
.pm-cta:active{transform:scale(.98);}
.pm-cta-primary{background:var(--terra);color:#fff;box-shadow:0 8px 20px rgba(188,88,54,.32);margin-bottom:11px;}
.pm-cta-ghost{background:transparent;color:var(--cacao);border:2px solid #D9C9B2;}
.pm-micro{text-align:center;font-size:13px;color:var(--cacao-soft);margin-top:14px;font-weight:600;}
.pm-micro b{color:var(--olive);}

.pm-install{margin:0 24px;}
.pm-install-bar{width:100%;background:var(--cacao);color:#F7F1E6;border-radius:16px;padding:15px 18px;display:flex;align-items:center;gap:13px;box-shadow:0 8px 22px rgba(50,38,32,.22);border:none;cursor:pointer;text-align:left;font-family:'Nunito',sans-serif;}
.pm-ic{font-size:24px;}
.pm-install-txt{display:flex;flex-direction:column;}
.pm-t1{font-weight:800;font-size:15px;}
.pm-t2{font-size:12px;opacity:.75;}
.pm-go{margin-left:auto;background:var(--gold);color:var(--cacao);font-weight:800;font-size:13px;padding:8px 14px;border-radius:10px;white-space:nowrap;}

.pm-sec{padding:42px 24px;}
.pm-sec-cream{background:var(--cream);}
.pm-kicker{font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--terra-d);text-align:center;margin-bottom:8px;}
.pm-h2{font-size:27px;font-weight:600;text-align:center;margin-bottom:26px;letter-spacing:-.01em;}

.pm-feat{background:var(--cream);border-radius:18px;padding:18px;margin-bottom:13px;border:1px solid #EFE3D2;display:flex;gap:14px;align-items:flex-start;}
.pm-fe{font-size:26px;flex-shrink:0;line-height:1;margin-top:2px;}
.pm-feat h3{font-size:16px;font-weight:800;margin-bottom:3px;}
.pm-feat p{font-size:13.5px;color:var(--cacao-soft);}

.pm-games{background:var(--linen2);border-radius:18px;padding:20px;margin-top:4px;}
.pm-games>h3{font-size:16px;font-weight:800;margin-bottom:14px;text-align:center;}
.pm-gcat{display:grid;grid-template-columns:1fr 1fr;gap:9px;}
.pm-gpill{background:var(--cream);border-radius:13px;padding:12px;text-align:center;border:1px solid #E9DCC8;display:flex;flex-direction:column;align-items:center;}
.pm-ge{font-size:22px;margin-bottom:5px;}
.pm-gn{font-size:12.5px;font-weight:800;margin-bottom:2px;}
.pm-gd{font-size:10.5px;color:var(--cacao-soft);line-height:1.3;}
.pm-games-note{text-align:center;font-size:12.5px;color:var(--cacao-soft);font-style:italic;margin-top:14px;}

.pm-step{display:flex;gap:15px;align-items:flex-start;margin-bottom:18px;}
.pm-n{width:38px;height:38px;flex-shrink:0;border-radius:12px;background:var(--olive);color:#fff;font-weight:600;font-size:18px;display:flex;align-items:center;justify-content:center;}
.pm-sh{font-weight:800;font-size:15px;margin-bottom:2px;}
.pm-sp{font-size:13.5px;color:var(--cacao-soft);}
.pm-step-note{background:#F3E2CF;border-radius:13px;padding:13px 16px;font-size:13px;color:var(--cacao-soft);margin-top:6px;}
.pm-step-note b{color:var(--terra-d);}

.pm-diff{background:var(--cacao);color:var(--linen);border-radius:22px;padding:30px 24px;text-align:center;}
.pm-diff h2{font-size:24px;font-weight:600;margin-bottom:14px;color:#fff;}
.pm-diff>p{font-size:15px;opacity:.82;margin-bottom:20px;}
.pm-rows{text-align:left;max-width:340px;margin:0 auto;}
.pm-row{display:flex;gap:11px;align-items:center;padding:9px 0;border-bottom:1px solid rgba(247,241,230,.12);font-size:14px;}
.pm-ck{color:var(--gold);font-weight:900;}

.pm-price{background:var(--cream);border-radius:24px;padding:30px 24px;text-align:center;box-shadow:0 12px 34px rgba(50,38,32,.10);border:1px solid #EFE3D2;}
.pm-amt{font-size:44px;font-weight:600;color:var(--terra);line-height:1;}
.pm-per{font-size:15px;color:var(--cacao-soft);font-weight:600;}
.pm-free{display:inline-block;background:#E7EDE0;color:var(--olive);font-weight:800;font-size:13px;padding:6px 14px;border-radius:100px;margin:14px 0 18px;}
.pm-price ul{list-style:none;text-align:left;max-width:260px;margin:0 auto 22px;}
.pm-price li{font-size:14px;padding:6px 0 6px 26px;position:relative;color:var(--cacao-soft);}
.pm-price li::before{content:'✓';position:absolute;left:0;color:var(--olive);font-weight:900;}

.pm-footer{padding:34px 24px 44px;text-align:center;border-top:1px solid #E5D9C5;margin-top:20px;}
.pm-foot-faces{display:flex;justify-content:center;gap:8px;margin-bottom:16px;}
.pm-foot-faces img{width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid var(--cream);}
.pm-fn{font-size:18px;font-weight:600;margin-bottom:6px;}
.pm-footer p{font-size:12.5px;color:var(--cacao-soft);margin:3px 0;}
.pm-socials{display:flex;justify-content:center;gap:16px;margin:16px 0;}
.pm-socials a{font-size:13px;font-weight:700;color:var(--terra-d);text-decoration:none;}
.pm-legal{margin-top:12px;}
.pm-legal a{color:var(--cacao-soft);text-decoration:underline;font-size:12px;}
.pm-vigia{margin-top:12px;opacity:.6;}

.pm-modal{position:fixed;inset:0;background:rgba(50,38,32,.55);display:flex;align-items:center;justify-content:center;padding:24px;z-index:999;}
.pm-modal-card{background:var(--cream);border-radius:22px;padding:26px 22px;max-width:380px;width:100%;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.3);}
.pm-modal-x{position:absolute;top:14px;right:14px;background:var(--linen2);border:none;width:30px;height:30px;border-radius:50%;font-size:14px;cursor:pointer;color:var(--cacao);}
.pm-modal-card h3{font-size:22px;font-weight:600;margin-bottom:6px;}
.pm-modal-sub{font-size:14px;color:var(--cacao-soft);margin-bottom:16px;}
.pm-mstep{display:flex;gap:12px;align-items:flex-start;margin-bottom:13px;}
.pm-mn{flex-shrink:0;width:26px;height:26px;border-radius:50%;background:var(--terra);color:#fff;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;}
.pm-mstep p{font-size:14px;color:var(--cacao);line-height:1.45;}

@media(max-width:380px){.pm-h1{font-size:31px;}}
`;
