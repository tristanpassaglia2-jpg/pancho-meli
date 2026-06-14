import React from 'react';

export default function Terminos() {
  return (
    <div style={S.page}>
      <div style={S.card}>
        <h1 style={S.title}>Términos y Condiciones</h1>
        <p style={S.updated}>Última actualización: junio 2026</p>

        <p style={S.text}>
          Al utilizar <strong>Pancho&Meli</strong> ("la app"), operada por <strong>VIGIA Apps</strong> 
          ("nosotros"), aceptás estos términos y condiciones. Si no estás de acuerdo, 
          no utilices el servicio.
        </p>

        <h2 style={S.subtitle}>1. Descripción del servicio</h2>
        <p style={S.text}>
          Pancho&Meli es un servicio de compañía basado en inteligencia artificial para adultos 
          mayores. Ofrece conversación, juegos cognitivos, entretenimiento y un botón de 
          emergencia. Pancho y Meli son personajes ficticios impulsados por IA; no son personas 
          reales ni profesionales de la salud.
        </p>

        <h2 style={S.subtitle}>2. No es un servicio médico</h2>
        <p style={S.text}>
          <strong>Pancho&Meli NO es un sustituto de atención médica, psicológica ni de 
          emergencias.</strong> No brinda diagnósticos, tratamientos ni consejos médicos. 
          Ante cualquier emergencia de salud, contactá a los servicios de emergencia locales. 
          El botón de emergencia de la app notifica al familiar registrado, pero no reemplaza 
          al sistema de emergencias.
        </p>

        <h2 style={S.subtitle}>3. Registro y cuentas</h2>
        <p style={S.text}>
          El registro lo realiza un familiar mayor de 18 años, quien es responsable de la 
          cuenta, la configuración y el pago. El familiar genera un enlace de acceso para el 
          adulto mayor, quien no necesita registrarse. El familiar es responsable de mantener 
          la confidencialidad de su contraseña.
        </p>

        <h2 style={S.subtitle}>4. Suscripción y pagos</h2>
        <p style={S.text}>
          El servicio ofrece un período de prueba gratuito de 7 días desde el momento del 
          registro. Finalizado el período de prueba, se requiere una suscripción mensual de 
          ARS $13.500 (precio sujeto a modificaciones con previo aviso). Los pagos se procesan 
          a través de MercadoPago de forma recurrente y automática cada mes.
        </p>
        <p style={S.text}>
          Podés cancelar tu suscripción en cualquier momento desde MercadoPago. La cancelación 
          toma efecto al finalizar el período ya pagado. No se realizan reembolsos por períodos 
          parciales.
        </p>

        <h2 style={S.subtitle}>5. Uso aceptable</h2>
        <p style={S.text}>
          Te comprometés a usar la app de forma responsable. No está permitido: intentar 
          acceder a cuentas ajenas, usar la app para actividades ilegales, intentar extraer 
          o manipular los sistemas de inteligencia artificial, ni compartir contenido ofensivo 
          o dañino a través del servicio.
        </p>

        <h2 style={S.subtitle}>6. Privacidad de las conversaciones</h2>
        <p style={S.text}>
          Las conversaciones entre el adulto mayor y su compañero son confidenciales. 
          Consultá nuestra <a href="/privacidad" style={{color:'#075E54'}}>Política de 
          Privacidad</a> para más detalles sobre cómo manejamos los datos.
        </p>

        <h2 style={S.subtitle}>7. Limitación de responsabilidad</h2>
        <p style={S.text}>
          Pancho&Meli se ofrece "tal como está". No garantizamos que el servicio sea 
          ininterrumpido o libre de errores. Las respuestas generadas por la inteligencia 
          artificial pueden contener inexactitudes. No somos responsables por decisiones 
          tomadas en base a las conversaciones con los compañeros de charlas. Nuestra 
          responsabilidad máxima se limita al monto pagado por el servicio en el último mes.
        </p>

        <h2 style={S.subtitle}>8. Propiedad intelectual</h2>
        <p style={S.text}>
          Los personajes Pancho y Meli, el diseño de la app, y todos los contenidos 
          son propiedad de VIGIA Apps. Los usuarios conservan la propiedad de sus datos 
          personales y conversaciones.
        </p>

        <h2 style={S.subtitle}>9. Modificaciones</h2>
        <p style={S.text}>
          Nos reservamos el derecho de modificar estos términos. Los cambios significativos 
          serán notificados por email o mediante aviso en la app con al menos 15 días de 
          anticipación.
        </p>

        <h2 style={S.subtitle}>10. Cancelación y terminación</h2>
        <p style={S.text}>
          Podés cancelar tu cuenta en cualquier momento contactándonos a 
          vigia24app@gmail.com. Nos reservamos el derecho de suspender o cancelar cuentas 
          que violen estos términos.
        </p>

        <h2 style={S.subtitle}>11. Ley aplicable</h2>
        <p style={S.text}>
          Estos términos se rigen por las leyes de la República Argentina. Cualquier 
          controversia será sometida a los tribunales ordinarios de la ciudad de Córdoba, 
          provincia de Córdoba, Argentina.
        </p>

        <h2 style={S.subtitle}>12. Contacto</h2>
        <p style={S.text}>
          Para consultas sobre estos términos: <strong>vigia24app@gmail.com</strong>
        </p>
        <p style={S.text}>VIGIA Apps — Córdoba, Argentina</p>

        <a href="/" style={S.back}>← Volver al inicio</a>
      </div>
    </div>
  );
}

const S = {
  page: { minHeight:'100vh', background:'#FAFAFA', padding:'2rem 1rem', fontFamily:"'Segoe UI',system-ui,sans-serif" },
  card: { maxWidth:700, margin:'0 auto', background:'#fff', borderRadius:20, padding:'2rem 1.5rem', boxShadow:'0 4px 20px rgba(0,0,0,0.08)' },
  title: { fontSize:'1.8rem', fontWeight:800, color:'#1a1a1a', margin:'0 0 4px' },
  updated: { color:'#999', fontSize:'0.85rem', marginBottom:'1.5rem' },
  subtitle: { fontSize:'1.15rem', fontWeight:700, color:'#075E54', margin:'1.5rem 0 0.5rem' },
  text: { fontSize:'0.95rem', color:'#444', lineHeight:1.7, margin:'0 0 0.8rem' },
  back: { display:'inline-block', marginTop:'1.5rem', color:'#075E54', fontWeight:600, textDecoration:'none', fontSize:'0.95rem' }
};
