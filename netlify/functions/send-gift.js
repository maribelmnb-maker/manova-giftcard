const sgMail = require("@sendgrid/mail");
const fetch = require("node-fetch");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type" },
      body: "",
    };
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const body = JSON.parse(event.body);
    const {
      giftCode, packName, packDesc, price, packType,
      recipientName, senderName, message,
      deliveryMethod, whatsappContact, emailContact,
      buyerName, buyerPhone, buyerEmail,
      scheduleMethod, scheduleHour,
      validUntil,
    } = body;

    // Generate unique gift link for mama
    const giftPayload = {
      giftCode, packName, packDesc: packDesc||'', price,
      recipientName, senderName, message, validUntil
    };
    const giftToken = Buffer.from(JSON.stringify(giftPayload)).toString('base64');
    const siteUrl = event.headers.referer || event.headers.origin || 'https://manova-regalo.netlify.app';
    const baseUrl = new URL(siteUrl).origin;
    const giftLink = `${baseUrl}/regalo.html?t=${encodeURIComponent(giftToken)}`;

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // ── Email HTML bonito con la tarjeta ──
    const emailHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tu regalo de Manova</title>
</head>
<body style="margin:0;padding:0;background:#F5EDE0;font-family:'Georgia',serif;">
  <div style="max-width:520px;margin:0 auto;padding:2rem 1rem;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:1.5rem;">
      <p style="font-size:0.7rem;letter-spacing:0.25em;text-transform:uppercase;color:#A3794A;margin:0">Manova Beauty Center</p>
    </div>

    <!-- Tarjeta regalo -->
    <div style="background:linear-gradient(148deg,#E7E4DB 0%,#EDE8DC 58%,#E0D9CC 100%);border-radius:20px;padding:2rem 2rem 1.8rem;box-shadow:0 20px 48px rgba(106,51,30,0.17);position:relative;overflow:hidden;margin-bottom:1.5rem;">

      <p style="font-size:0.55rem;letter-spacing:0.22em;text-transform:uppercase;color:#A3794A;margin:0 0 0.8rem 0;">♡ Día de las Madres · 2025</p>

      <p style="font-family:'Georgia',serif;font-style:italic;font-size:2rem;font-weight:300;color:#6A331E;margin:0 0 0.3rem 0;">${packName}</p>
      <p style="font-size:0.75rem;color:#A3794A;margin:0 0 1.5rem 0;">${packType === 'club' ? 'Manova Club · Suscripción mensual' : 'Experiencia en Manova Beauty Center'}</p>

      <div style="border-top:1px solid rgba(106,51,30,0.15);padding-top:1rem;display:flex;justify-content:space-between;align-items:flex-end;">
        <div>
          <p style="font-size:0.5rem;letter-spacing:0.22em;text-transform:uppercase;color:#A3794A;margin:0 0 0.2rem 0;">Para</p>
          <p style="font-family:'Georgia',serif;font-style:italic;font-size:1.3rem;font-weight:300;color:#6A331E;margin:0;">${recipientName}</p>
        </div>
        <div style="text-align:right;">
          <p style="font-size:0.5rem;letter-spacing:0.22em;text-transform:uppercase;color:#A3794A;margin:0 0 0.2rem 0;">De parte de</p>
          <p style="font-family:'Georgia',serif;font-style:italic;font-size:1.1rem;font-weight:300;color:#A3794A;margin:0;">${senderName}</p>
        </div>
      </div>
    </div>

    <!-- Mensaje -->
    ${message ? `
    <div style="background:white;border-radius:14px;border:1px solid rgba(163,121,74,0.2);padding:1.2rem 1.4rem;margin-bottom:1.2rem;">
      <p style="font-size:0.55rem;letter-spacing:0.2em;text-transform:uppercase;color:#6A331E;opacity:0.6;margin:0 0 0.5rem 0;">Mensaje especial</p>
      <p style="font-family:'Georgia',serif;font-style:italic;font-size:1rem;line-height:1.7;color:#040015;margin:0;border-left:2px solid #A3794A;padding-left:0.8rem;">${message}</p>
    </div>
    ` : ''}

    <!-- Código -->
    <div style="background:white;border-radius:14px;border:1px solid rgba(163,121,74,0.2);padding:1.2rem 1.4rem;margin-bottom:1.5rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <p style="font-size:0.52rem;letter-spacing:0.2em;text-transform:uppercase;color:#6A331E;opacity:0.6;margin:0 0 0.3rem 0;">Tu codigo de regalo</p>
          <p style="font-family:'Georgia',serif;font-size:1.5rem;font-weight:600;color:#040015;letter-spacing:0.1em;margin:0;">${giftCode}</p>
        </div>
        <div style="text-align:right;">
          <p style="font-size:0.55rem;color:#6A331E;opacity:0.55;margin:0;line-height:1.5;">Válida hasta<br>${validUntil}</p>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:1.5rem;">
      <p style="font-size:0.85rem;color:#6A331E;margin:0 0 1rem 0;">Para agendar tu cita llama o escribe a:</p>
      <a href="${giftLink}" style="display:inline-block;background:#6A331E;color:#E7E4DB;padding:0.8rem 2rem;border-radius:10px;text-decoration:none;font-size:0.75rem;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:0.8rem;">
        Abrir mi regalo 🎁
      </a><br>
      <a href="https://wa.me/529901037352" style="display:inline-block;background:transparent;color:#6A331E;border:1px solid #6A331E;padding:0.7rem 2rem;border-radius:10px;text-decoration:none;font-size:0.7rem;letter-spacing:0.14em;text-transform:uppercase;">
        Agendar en WhatsApp
      </a>
      <p style="font-size:0.75rem;color:#A3794A;margin:0.8rem 0 0 0;">990 103 7352 · Calle 18, Av. Cámara de Comercio 111, Merida</p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;border-top:1px solid rgba(106,51,30,0.1);padding-top:1rem;">
      <p style="font-size:0.6rem;color:#A3794A;opacity:0.6;margin:0;line-height:1.6;">Manova Beauty Center · Mérida, Yucatán<br>No reembolsable · No transferible</p>
    </div>

  </div>
</body>
</html>`;

    // ── Determinar destinatario ──
    let toEmail = null;
    let toName = recipientName;

    if (deliveryMethod === "both" || deliveryMethod === "email") {
      toEmail = emailContact;
      toName = recipientName;
    } else if (deliveryMethod === "self") {
      toEmail = buyerEmail || emailContact;
      toName = senderName;
    }

    // ── Enviar correo si hay email ──
    if (toEmail) {
      const subject = deliveryMethod === "self"
        ? `Tu tarjeta regalo Manova para ${recipientName}`
        : `${senderName} te regalo una experiencia en Manova Beauty Center`;

      await sgMail.send({
        to: { email: toEmail, name: toName },
        from: { email: "manovabeautycenter@gmail.com", name: "Manova Beauty Center" },
        replyTo: "manovabeautycenter@gmail.com",
        subject,
        html: emailHtml,
      });
    }

    // ── Registrar en Google Sheets via webhook ──
    if (process.env.SHEETS_WEBHOOK_URL) {
      const schedLabel = scheduleMethod === "now"
        ? "Inmediato"
        : `10 de mayo a las ${scheduleHour}`;

      await fetch(process.env.SHEETS_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha: new Date().toLocaleString("es-MX", { timeZone: "America/Merida" }),
          código: giftCode,
          pack: packName,
          monto: price,
          para: recipientName,
          de: senderName,
          mensaje: message,
          compradorNombre: buyerName||'',
          compradorTel: buyerPhone||'',
          compradorCorreo: buyerEmail||'',
          envio: deliveryMethod,
          whatsappMama: whatsappContact||'',
          correoMama: emailContact||'',
          contacto: deliveryContact||'',
          programacion: schedLabel,
          tipo: packType,
          linkRegalo: giftLink,
        }),
      });
    }

    // ── Notificacion WhatsApp a Manova (via link) ──
    const deliveryContact = whatsappContact || emailContact || '';
    const whatsappMsg = encodeURIComponent(
      `🌸 *Nueva venta - Tarjeta Regalo Manova*\n\n` +
      `*Pack:* ${packName}\n` +
      `*Monto:* $${Number(price).toLocaleString("es-MX")} MXN\n` +
      `*Codigo:* ${giftCode}\n` +
      `*Para:* ${recipientName}\n` +
      `*De:* ${senderName}\n` +
      `*Comprador:* ${buyerName||'—'} · ${buyerPhone||'—'} · ${buyerEmail||'—'}\n` +
      `*Envio:* ${deliveryMethod} · WA: ${whatsappContact||'—'} · Email: ${emailContact||'—'}\n` +
      `*Cuando:* ${scheduleMethod === "now" ? "Inmediato" : `10 de mayo ${scheduleHour}`}\n` +
      `*Link regalo:* ${giftLink}\n\n` +
      `✅ Pago confirmado via Mercado Pago`
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        emailSent: !!toEmail,
        whatsappUrl: `https://wa.me/529901037352?text=${whatsappMsg}`,
      }),
    };
  } catch (err) {
    console.error("send-gift error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
