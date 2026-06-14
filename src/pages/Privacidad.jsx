import React from 'react';

export default function Privacidad() {
  return (
    <div style={S.page}>
      <div style={S.card}>
        <h1 style={S.title}>Política de Privacidad</h1>
        <p style={S.updated}>Última actualización: junio 2026</p>

        <p style={S.text}>
          <strong>VIGIA Apps</strong> ("nosotros") opera la aplicación <strong>Pancho&Meli</strong> 
          ("la app"), un servicio de compañía basado en inteligencia artificial para adultos mayores.
          Tu privacidad es fundamental para nosotros. Esta política explica qué datos recopilamos, 
          cómo los usamos y cómo los protegemos.
        </p>

        <h2 style={S.subtitle}>1. Datos que recopilamos</h2>
        <p style={S.text}>
          <strong>Del familiar que se registra:</strong> nombre, dirección de email, contraseña 
          (almacenada de forma encriptada), y teléfono de contacto de emergencia.
        </p>
        <p style={S.text}>
          <strong>Del adulto mayor:</strong> nombre, edad (opcional), país, y preferencia de 
          compañero (Pancho o Meli).
        </p>
        <p style={S.text}>
          <strong>Conversaciones:</strong> los mensajes intercambiados entre el adulto mayor y su 
          compañero de charlas se almacenan para que el compañero pueda recordar conversaciones 
          anteriores y brindar una experiencia personalizada.
        </p>
        <p style={S.text}>
          <strong>Datos de pago:</strong> los pagos son procesados por MercadoPago. Nosotros NO 
          almacenamos datos de tarjetas de crédito ni información financiera. MercadoPago maneja 
          esa información bajo sus propias políticas de seguridad.
        </p>

        <h2 style={S.subtitle}>2. Privacidad de las conversaciones</h2>
        <p style={S.text}>
          <strong>Las conversaciones son privadas.</strong> El contenido de las charlas entre el 
          adulto mayor y su compañero (Pancho o Meli) es confidencial. Los familiares que 
          administran la cuenta NO tienen acceso al contenido de las conversaciones. 
          La única excepción es el botón de emergencia: si el adulto mayor lo activa, se envía 
          una alerta al familiar indicando que necesita asistencia, sin revelar el contenido de 
          las charlas.
        </p>

        <h2 style={S.subtitle}>3. Uso de inteligencia artificial</h2>
        <p style={S.text}>
          Pancho y Meli son compañeros de charlas impulsados por inteligencia artificial 
          (tecnología de Anthropic). No son personas reales. Las conversaciones son procesadas 
          por la API de Anthropic para generar respuestas. Anthropic no utiliza las conversaciones 
          de los usuarios para entrenar sus modelos cuando se accede a través de su API.
        </p>

        <h2 style={S.subtitle}>4. Cómo usamos los datos</h2>
        <p style={S.text}>
          Usamos los datos recopilados exclusivamente para: brindar el servicio de compañía, 
          personalizar la experiencia del adulto mayor, procesar pagos, enviar alertas de 
          emergencia al familiar, y mejorar la calidad del servicio. No vendemos, alquilamos 
          ni compartimos datos personales con terceros con fines publicitarios.
        </p>

        <h2 style={S.subtitle}>5. Almacenamiento y seguridad</h2>
        <p style={S.text}>
          Los datos se almacenan en servidores seguros proporcionados por Supabase (ubicados 
          en São Paulo, Brasil). Implementamos medidas de seguridad estándar de la industria 
          para proteger la información. La contraseña del familiar se almacena de forma 
          encriptada y nunca es visible para nosotros.
        </p>

        <h2 style={S.subtitle}>6. Derechos del usuario</h2>
        <p style={S.text}>
          Tenés derecho a: acceder a tus datos personales, solicitar la corrección de datos 
          incorrectos, solicitar la eliminación de tu cuenta y todos los datos asociados, y 
          retirar tu consentimiento en cualquier momento. Para ejercer estos derechos, escribinos 
          a <strong>vigia24app@gmail.com</strong>.
        </p>

        <h2 style={S.subtitle}>7. Menores de edad</h2>
        <p style={S.text}>
          Pancho&Meli está diseñado para adultos mayores. El registro lo realiza un familiar 
          mayor de 18 años. No recopilamos intencionalmente datos de menores de edad.
        </p>

        <h2 style={S.subtitle}>8. Cambios en esta política</h2>
        <p style={S.text}>
          Podemos actualizar esta política ocasionalmente. Notificaremos los cambios 
          significativos por email o mediante un aviso en la app. El uso continuado del 
          servicio después de los cambios constituye aceptación de la política actualizada.
        </p>

        <h2 style={S.subtitle}>9. Contacto</h2>
        <p style={S.text}>
          Si tenés preguntas sobre esta política, escribinos a: <strong>vigia24app@gmail.com</strong>
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
