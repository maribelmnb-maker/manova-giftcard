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

    const giftPayload = { giftCode, packName, packDesc: packDesc||'', price, recipientName, senderName, message, validUntil };
    const giftToken = Buffer.from(JSON.stringify(giftPayload)).toString('base64');
    const siteUrl = event.headers.referer || event.headers.origin || 'https://manovagiftcard.netlify.app';
    const baseUrl = new URL(siteUrl).origin;
    const giftLink = `${baseUrl}/regalo.html?t=${encodeURIComponent(giftToken)}`;

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // ── Email misterioso a mamá con cajita animada ──
    const emailHtml = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tienes un regalo 🎁</title>
<style>
  @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes wiggle { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
  @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
  .box { animation: bounce 2s ease-in-out infinite; display:inline-block; }
  .lid { animation: wiggle 1.5s ease-in-out infinite; display:inline-block; transform-origin: center bottom; }
  .btn { animation: pulse 2s ease-in-out infinite; }
</style>
</head>
<body style="margin:0;padding:0;background:#F5EDE0;font-family:'Georgia',serif;">
  <div style="max-width:520px;margin:0 auto;padding:2rem 1rem;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:1.5rem;">
      <p style="font-size:0.65rem;letter-spacing:0.25em;text-transform:uppercase;color:#A3794A;margin:0;">Manova Beauty Center</p>
    </div>

    <!-- Cajita animada en CSS/emoji -->
    <div style="text-align:center;margin-bottom:1.5rem;">
      <div class="box" style="font-size:5rem;line-height:1;display:block;">🎁</div>
    </div>

    <!-- Texto cálido -->
    <div style="text-align:center;margin-bottom:2rem;padding:0 1rem;">
      <p style="font-family:'Georgia',serif;font-style:italic;font-size:0.95rem;color:#A3794A;margin:0 0 0.5rem 0;">Para ${recipientName} 🌸</p>
      <p style="font-family:'Georgia',serif;font-size:1.7rem;font-weight:300;color:#6A331E;margin:0 0 0.8rem 0;line-height:1.3;">¡Tienes un regalo<br>esperándote!</p>
      <p style="font-size:0.9rem;color:#6A331E;line-height:1.7;margin:0;opacity:0.8;">${senderName} pensó en ti y te preparó<br>algo muy especial en Manova. ✨<br>Toca el botón para abrirlo 💝</p>
    </div>

    ${message ? `
    <!-- Mensaje especial -->
    <div style="background:white;border-radius:14px;border:1px solid rgba(163,121,74,0.2);padding:1.2rem 1.5rem;margin-bottom:2rem;text-align:center;">
      <p style="font-size:0.52rem;letter-spacing:0.2em;text-transform:uppercase;color:#6A331E;opacity:0.6;margin:0 0 0.6rem 0;">Un mensaje de ${senderName}</p>
      <p style="font-family:'Georgia',serif;font-style:italic;font-size:1.05rem;line-height:1.75;color:#040015;margin:0;">"${message}"</p>
    </div>
    ` : ''}

    <!-- Botón CTA grande -->
    <div style="text-align:center;margin-bottom:2rem;">
      <a href="${giftLink}" class="btn" style="display:inline-block;background:linear-gradient(135deg,#6A331E,#8B4422);color:#F5EDE0;padding:1.1rem 3rem;border-radius:50px;text-decoration:none;font-size:0.85rem;letter-spacing:0.18em;text-transform:uppercase;box-shadow:0 8px 24px rgba(106,51,30,0.3);">
        ✨ Abrir mi regalo ✨
      </a>
      <p style="font-size:0.7rem;color:#A3794A;margin:0.8rem 0 0 0;opacity:0.7;">Toca para vivir tu experiencia Manova 🌸</p>
    </div>

    <!-- Separador flores -->
    <div style="text-align:center;margin-bottom:1.5rem;font-size:1.2rem;letter-spacing:0.5rem;opacity:0.5;">🌸 🌷 🌸</div>

    <!-- Footer -->
    <div style="text-align:center;border-top:1px solid rgba(106,51,30,0.1);padding-top:1rem;">
      <p style="font-size:0.6rem;color:#A3794A;opacity:0.6;margin:0;line-height:1.8;">Manova Beauty Center · Mérida, Yucatán<br>¿Dudas? Escríbenos al <strong>990 103 7352</strong></p>
    </div>

  </div>
</body>
</html>`;

    // ── Email de confirmación al comprador ──
    const confirmHtml = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#F5EDE0;font-family:'Georgia',serif;">
  <div style="max-width:520px;margin:0 auto;padding:2rem 1rem;">
    <div style="text-align:center;margin-bottom:1.5rem;">
      <p style="font-size:0.65rem;letter-spacing:0.25em;text-transform:uppercase;color:#A3794A;margin:0;">Manova Beauty Center</p>
    </div>
    <div style="text-align:center;margin-bottom:1.5rem;">
      <p style="font-size:2.5rem;margin:0;">✅</p>
      <p style="font-family:'Georgia',serif;font-size:1.6rem;font-weight:300;color:#6A331E;margin:0.5rem 0 0.3rem 0;">¡Tu regalo está en camino!</p>
      <p style="font-size:0.9rem;color:#6A331E;opacity:0.75;margin:0;line-height:1.6;">Qué bonito detalle, ${senderName}. ${recipientName} lo va a adorar 🌸</p>
    </div>
    <div style="background:white;border-radius:14px;border:1px solid rgba(163,121,74,0.2);padding:1.3rem 1.5rem;margin-bottom:1.2rem;">
      <p style="font-size:0.52rem;letter-spacing:0.2em;text-transform:uppercase;color:#6A331E;opacity:0.6;margin:0 0 0.8rem 0;">Resumen de tu compra</p>
      <table style="width:100%;font-size:0.85rem;color:#6A331E;border-collapse:collapse;">
        <tr><td style="padding:0.3rem 0;opacity:0.65;border-bottom:1px solid rgba(163,121,74,0.1);">Regalo</td><td style="text-align:right;font-family:'Georgia',serif;font-style:italic;border-bottom:1px solid rgba(163,121,74,0.1);">${packName}</td></tr>
        <tr><td style="padding:0.3rem 0;opacity:0.65;border-bottom:1px solid rgba(163,121,74,0.1);">Para</td><td style="text-align:right;border-bottom:1px solid rgba(163,121,74,0.1);">${recipientName}</td></tr>
        <tr><td style="padding:0.3rem 0;opacity:0.65;border-bottom:1px solid rgba(163,121,74,0.1);">Monto</td><td style="text-align:right;font-weight:600;border-bottom:1px solid rgba(163,121,74,0.1);">$${Number(price).toLocaleString('es-MX')} MXN</td></tr>
        <tr><td style="padding:0.3rem 0;opacity:0.65;border-bottom:1px solid rgba(163,121,74,0.1);">Código</td><td style="text-align:right;font-family:'Georgia',serif;font-weight:600;letter-spacing:0.1em;border-bottom:1px solid rgba(163,121,74,0.1);">${giftCode}</td></tr>
        <tr><td style="padding:0.3rem 0;opacity:0.65;">Válido hasta</td><td style="text-align:right;">${validUntil}</td></tr>
      </table>
    </div>
    <div style="background:rgba(106,51,30,0.05);border-radius:10px;padding:0.9rem 1.2rem;margin-bottom:1.2rem;text-align:center;">
      <p style="font-size:0.8rem;color:#6A331E;margin:0;line-height:1.6;">Guarda este código por si se necesita:<br><strong style="font-size:1.1rem;letter-spacing:0.1em;">${giftCode}</strong></p>
    </div>
    <div style="text-align:center;margin-bottom:1.5rem;">
      <p style="font-size:0.8rem;color:#6A331E;opacity:0.7;margin:0;line-height:1.6;">¿Tienes alguna duda? Escríbenos al<br><strong>990 103 7352</strong></p>
    </div>
    <div style="text-align:center;border-top:1px solid rgba(106,51,30,0.1);padding-top:1rem;">
      <p style="font-size:0.6rem;color:#A3794A;opacity:0.6;margin:0;line-height:1.6;">Manova Beauty Center · Mérida, Yucatán<br>No reembolsable · No transferible</p>
    </div>
  </div>
</body>
</html>`;

    // ── Determinar destinatario de mamá ──
    let toEmail = null;
    let toName = recipientName;

    if (deliveryMethod === "both" || deliveryMethod === "email") {
      toEmail = emailContact;
      toName = recipientName;
    } else if (deliveryMethod === "self") {
      toEmail = buyerEmail || emailContact;
      toName = senderName;
    }

    // ── Enviar correo misterioso a mamá ──
    if (toEmail) {
      const subject = deliveryMethod === "self"
        ? `Tu tarjeta regalo Manova para ${recipientName}`
        : `${senderName} tiene una sorpresa para ti 🎁`;

      await sgMail.send({
        to: { email: toEmail, name: toName },
        from: { email: "manovabeautycenter@gmail.com", name: "Manova Beauty Center" },
        replyTo: "manovabeautycenter@gmail.com",
        subject,
        html: emailHtml,
      });
    }

    // ── Enviar confirmación al comprador ──
    const buyerEmailAddr = buyerEmail || null;
    if (buyerEmailAddr && deliveryMethod !== "self") {
      await sgMail.send({
        to: { email: buyerEmailAddr, name: buyerName || senderName },
        from: { email: "manovabeautycenter@gmail.com", name: "Manova Beauty Center" },
        replyTo: "manovabeautycenter@gmail.com",
        subject: `¡Listo! Tu regalo para ${recipientName} está en camino 🌸`,
        html: confirmHtml,
      });
    }

    // ── Registrar en Google Sheets ──
    const deliveryContact = whatsappContact || emailContact || '';
    if (process.env.SHEETS_WEBHOOK_URL) {
      const schedLabel = scheduleMethod === "now" ? "Inmediato" : `10 de mayo a las ${scheduleHour}`;
      await fetch(process.env.SHEETS_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha: new Date().toLocaleString("es-MX", { timeZone: "America/Merida" }),
          codigo: giftCode, pack: packName, monto: price,
          para: recipientName, de: senderName, mensaje: message,
          compradorNombre: buyerName||'', compradorTel: buyerPhone||'', compradorCorreo: buyerEmail||'',
          envio: deliveryMethod, whatsappMama: whatsappContact||'', correoMama: emailContact||'',
          contacto: deliveryContact, programacion: schedLabel, tipo: packType, linkRegalo: giftLink,
        }),
      });
    }

    // ── Notificación WhatsApp a Manova ──
    const whatsappMsg = encodeURIComponent(
      `🌸 *Nueva venta - Tarjeta Regalo Manova*\n\n` +
      `*Pack:* ${packName}\n` +
      `*Monto:* $${Number(price).toLocaleString("es-MX")} MXN\n` +
      `*Código:* ${giftCode}\n` +
      `*Para:* ${recipientName}\n` +
      `*De:* ${senderName}\n` +
      `*Comprador:* ${buyerName||'—'} · ${buyerPhone||'—'} · ${buyerEmail||'—'}\n` +
      `*Envío:* ${deliveryMethod} · WA: ${whatsappContact||'—'} · Email: ${emailContact||'—'}\n` +
      `*Cuándo:* ${scheduleMethod === "now" ? "Inmediato" : `10 de mayo ${scheduleHour}`}\n` +
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
