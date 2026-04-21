# Manova Gift Card - Setup en Netlify

## Variables de entorno
Configura estas variables en Netlify → Site Settings → Environment Variables:

```
MP_ACCESS_TOKEN=<tu token de Mercado Pago>
SENDGRID_API_KEY=<tu API key de SendGrid>
SHEETS_WEBHOOK_URL=<agregar despues cuando configures Google Sheets>
```

## Pasos para subir a Netlify:
1. Ve a netlify.com → Add new site → Deploy manually
2. Arrastra y suelta la carpeta completa `manova-netlify`
3. Ve a Site Settings → Environment Variables y agrega las variables de arriba
4. Listo!

## Estructura:
- `public/index.html` — La pagina principal
- `netlify/functions/create-preference.js` — Crea la preferencia en Mercado Pago
- `netlify/functions/send-gift.js` — Envia el correo con SendGrid y registra en Sheets
- `netlify.toml` — Configuracion de Netlify
