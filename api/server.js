const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ═══════════════════════════════════════════
// CONFIGURACIÓN — completar con tus variables
// ═══════════════════════════════════════════
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';
const BASE_URL        = process.env.BASE_URL        || 'http://localhost:3000';
const GMAIL_USER      = process.env.GMAIL_USER      || '';
const GMAIL_APP_PASS  = process.env.GMAIL_APP_PASSWORD || '';
const ADMIN_EMAIL     = process.env.ADMIN_EMAIL     || '';
const WA_NUMBER       = '5493521410478'; // ← reemplazar con el número real

// ── MERCADOPAGO ──────────────────────────────
let mpClient = null;
(async () => {
  if (!MP_ACCESS_TOKEN) return;
  try {
    const { MercadoPagoConfig, Preference } = require('mercadopago');
    mpClient = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });
    console.log('[AZ] MercadoPago inicializado ✓');
  } catch (e) {
    console.warn('[AZ] MercadoPago no disponible:', e.message);
  }
})();

// ── NODEMAILER ───────────────────────────────
function createTransport() {
  if (!GMAIL_USER || !GMAIL_APP_PASS) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASS }
  });
}

// ── EMAIL CLIENTE ────────────────────────────
function htmlCliente({ nombre, producto, precio, metodo, direccion }) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><style>
body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#f4f0e8;margin:0;padding:0;}
.wrap{max-width:560px;margin:32px auto;background:#0e0c0a;border:1px solid rgba(201,168,76,0.3);}
.header{background:#c9a84c;padding:28px 32px;text-align:center;}
.header h1{margin:0;color:#000;font-size:1.4rem;letter-spacing:.06em;text-transform:uppercase;}
.header p{margin:4px 0 0;color:#4a3800;font-size:.78rem;letter-spacing:.1em;}
.body{padding:28px 32px;color:#f5f0e8;}
.body h2{font-size:1.1rem;color:#c9a84c;margin-bottom:16px;border-bottom:1px solid rgba(201,168,76,0.2);padding-bottom:10px;}
.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:.85rem;}
.row .label{color:#9a9085;}
.row .value{color:#f5f0e8;font-weight:600;}
.footer{background:#141210;padding:18px 32px;text-align:center;color:#9a9085;font-size:.72rem;border-top:1px solid rgba(201,168,76,0.15);}
.btn{display:inline-block;margin-top:18px;padding:12px 28px;background:#25D366;color:#fff;text-decoration:none;font-weight:700;font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;}
</style></head>
<body>
<div class="wrap">
  <div class="header">
    <h1>Arizona Jeans</h1>
    <p>Moda · San José de la Dormida · Córdoba</p>
  </div>
  <div class="body">
    <h2>✨ ¡Pedido recibido, ${nombre}!</h2>
    <p style="color:#9a9085;font-size:.85rem;margin-bottom:18px;">Nos contactamos en menos de 24hs para coordinar la entrega.</p>
    <div class="row"><span class="label">Prenda</span><span class="value">${producto}</span></div>
    <div class="row"><span class="label">Precio</span><span class="value">$${Number(precio).toLocaleString('es-AR')} ARS</span></div>
    <div class="row"><span class="label">Método de pago</span><span class="value">${metodo}</span></div>
    ${direccion ? `<div class="row"><span class="label">Dirección</span><span class="value">${direccion}</span></div>` : ''}
    <a class="btn" href="https://wa.me/${WA_NUMBER}?text=Hola! Consulta sobre mi pedido reciente">
      Consultar por WhatsApp
    </a>
  </div>
  <div class="footer">© 2026 Arizona Jeans · San José de la Dormida · Córdoba</div>
</div>
</body></html>`;
}

// ── EMAIL ADMIN ──────────────────────────────
function htmlAdmin({ nombre, email, tel, dni, producto, precio, metodo, direccion, direccionUrl }) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;background:#f4f0e8;margin:0;padding:0;}
.wrap{max-width:560px;margin:32px auto;background:#0e0c0a;border:1px solid rgba(201,168,76,0.3);}
.header{background:#a8813a;padding:20px 28px;}
.header h1{margin:0;color:#fff;font-size:1.1rem;text-transform:uppercase;letter-spacing:.06em;}
.body{padding:24px 28px;color:#f5f0e8;}
.row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:.82rem;}
.row .label{color:#9a9085;}
.row .value{color:#f5f0e8;font-weight:600;text-align:right;max-width:60%;}
.map-btn{display:inline-block;margin-top:14px;padding:10px 22px;background:#c9a84c;color:#000;text-decoration:none;font-weight:700;font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;}
</style></head>
<body>
<div class="wrap">
  <div class="header"><h1>🛍️ Nuevo pedido — Arizona Jeans</h1></div>
  <div class="body">
    <div class="row"><span class="label">Cliente</span><span class="value">${nombre}</span></div>
    <div class="row"><span class="label">Email</span><span class="value">${email}</span></div>
    <div class="row"><span class="label">WhatsApp</span><span class="value">${tel||'—'}</span></div>
    <div class="row"><span class="label">DNI</span><span class="value">${dni||'—'}</span></div>
    <div class="row"><span class="label">Prenda</span><span class="value">${producto}</span></div>
    <div class="row"><span class="label">Precio</span><span class="value">$${Number(precio).toLocaleString('es-AR')} ARS</span></div>
    <div class="row"><span class="label">Método</span><span class="value">${metodo}</span></div>
    ${direccion ? `<div class="row"><span class="label">Dirección</span><span class="value">${direccion}</span></div>` : ''}
    ${direccionUrl ? `<a class="map-btn" href="${direccionUrl}" target="_blank">📍 Ver en Google Maps</a>` : ''}
  </div>
</div>
</body></html>`;
}

// ═══════════════════════════════════════════
// RUTAS
// ═══════════════════════════════════════════

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', tienda: 'Arizona Jeans', ts: new Date().toISOString() });
});

// Crear pago MercadoPago
app.post('/api/crear-pago', async (req, res) => {
  const { producto, precio, cantidad = 1, comprador } = req.body;
  if (!producto || !precio) return res.status(400).json({ error: 'Faltan datos' });

  // Enviar emails en paralelo (si están configurados)
  const transport = createTransport();
  if (transport && comprador?.email) {
    const metodoLabel = 'MercadoPago';
    const promises = [
      transport.sendMail({
        from: `"Arizona Jeans" <${GMAIL_USER}>`,
        to: comprador.email,
        subject: `✨ Pedido recibido — ${producto}`,
        html: htmlCliente({
          nombre: comprador.nombre,
          producto,
          precio,
          metodo: metodoLabel,
          direccion: comprador.direccion
        })
      }).catch(e => console.warn('Email cliente:', e.message))
    ];
    if (ADMIN_EMAIL) {
      promises.push(
        transport.sendMail({
          from: `"Arizona Jeans" <${GMAIL_USER}>`,
          to: ADMIN_EMAIL,
          subject: `🛍️ Nuevo pedido: ${producto} — ${comprador.nombre}`,
          html: htmlAdmin({ ...comprador, producto, precio, metodo: metodoLabel })
        }).catch(e => console.warn('Email admin:', e.message))
      );
    }
    await Promise.allSettled(promises);
  }

  // Si no hay token MP devolvemos error claro
  if (!MP_ACCESS_TOKEN || !mpClient) {
    return res.status(503).json({ error: 'MP_ACCESS_TOKEN no configurado' });
  }

  try {
    const { Preference } = require('mercadopago');
    const pref = new Preference(mpClient);
    const result = await pref.create({
      body: {
        items: [{ title: producto, unit_price: Number(precio), quantity: Number(cantidad), currency_id: 'ARS' }],
        payer: { name: comprador?.nombre, email: comprador?.email },
        back_urls: {
          success: `${BASE_URL}/exito.html`,
          failure: `${BASE_URL}/error.html`,
          pending: `${BASE_URL}/pendiente.html`
        },
        auto_return: 'approved',
        statement_descriptor: 'ARIZONA JEANS',
        external_reference: `${Date.now()}-${(comprador?.nombre||'').replace(/\s/g,'-')}`
      }
    });
    res.json({ init_point: result.init_point });
  } catch (e) {
    console.error('[AZ] MP error:', e.message);
    res.status(500).json({ error: 'Error al crear preferencia' });
  }
});

// Webhook MercadoPago
app.post('/api/webhook', async (req, res) => {
  const { type, data } = req.body;
  if (type === 'payment' && data?.id) {
    console.log('[AZ] Pago recibido:', data.id);
  }
  res.sendStatus(200);
});

// Ruta catch-all para SPAs
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[AZ] Arizona Jeans corriendo en puerto ${PORT}`));

module.exports = app;
