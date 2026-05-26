const express = require("express");
const { MercadoPagoConfig, Preference } = require("mercadopago");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

// ── CONFIG ──
const TC = 1300; // Tipo de cambio USD → ARS

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const WA_NUMBER = "5493512345678";

// ── MAILER ──
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// ── EMAIL TEMPLATES ──
function templateAdmin(data) {
  const { producto, comprador, entrega, mp_id } = data;
  const arsTotal = ((producto.precio + (entrega.tipo === "envio" ? 500 / TC : 0)) * TC).toLocaleString("es-AR");

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head><meta charset="UTF-8"><style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #0e0c0a; color: #f5f0e8; margin: 0; padding: 0; }
    .wrap { max-width: 560px; margin: 0 auto; padding: 32px 20px; }
    .header { background: #c9a84c; padding: 24px 28px; text-align: center; }
    .header h1 { margin: 0; font-size: 1.3rem; font-weight: 700; color: #000; letter-spacing: 0.05em; text-transform: uppercase; }
    .card { background: #141210; border: 1px solid rgba(201,168,76,0.15); padding: 24px 28px; margin-top: 16px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(201,168,76,0.08); }
    .row:last-child { border-bottom: none; }
    .lbl { color: #9a9085; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.06em; }
    .val { color: #f5f0e8; font-size: 0.88rem; font-weight: 600; }
    .total { font-size: 1.2rem; color: #c9a84c; font-weight: 700; }
    .badge { background: #c9a84c; color: #000; padding: 3px 10px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
    .wa-btn { display: inline-block; margin-top: 20px; background: #25D366; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: 700; font-size: 0.82rem; letter-spacing: 0.06em; text-transform: uppercase; }
    footer { text-align: center; margin-top: 28px; color: #9a9085; font-size: 0.75rem; }
  </style></head>
  <body><div class="wrap">
    <div class="header"><h1>🛍️ Nueva venta — Arizona Jeans</h1></div>
    <div class="card">
      <div class="row"><span class="lbl">Producto</span><span class="val">${producto.nombre}</span></div>
      <div class="row"><span class="lbl">Categoría</span><span class="val">${producto.categoria}</span></div>
      <div class="row"><span class="lbl">Precio USD</span><span class="val">USD ${producto.precio}</span></div>
      <div class="row"><span class="lbl">Total ARS</span><span class="val total">$${arsTotal}</span></div>
    </div>
    <div class="card">
      <div class="row"><span class="lbl">Nombre</span><span class="val">${comprador.nombre}</span></div>
      <div class="row"><span class="lbl">Email</span><span class="val">${comprador.email}</span></div>
      <div class="row"><span class="lbl">Teléfono</span><span class="val">${comprador.telefono}</span></div>
      <div class="row"><span class="lbl">DNI</span><span class="val">${comprador.dni}</span></div>
    </div>
    <div class="card">
      <div class="row"><span class="lbl">Entrega</span><span class="val"><span class="badge">${entrega.tipo}</span></span></div>
      <div class="row"><span class="lbl">Dirección</span><span class="val">${entrega.direccion || "—"}</span></div>
      ${entrega.ciudad ? `<div class="row"><span class="lbl">Ciudad</span><span class="val">${entrega.ciudad}, ${entrega.provincia}</span></div>` : ""}
    </div>
    <div class="card">
      <div class="row"><span class="lbl">ID MercadoPago</span><span class="val">${mp_id || "—"}</span></div>
    </div>
    <div style="text-align:center">
      <a href="https://wa.me/${WA_NUMBER}?text=Hola+${encodeURIComponent(comprador.nombre)},+tu+pedido+de+${encodeURIComponent(producto.nombre)}+está+confirmado!" class="wa-btn">Contactar por WhatsApp</a>
    </div>
    <footer>Arizona Jeans · Moda · San José de la Dormida</footer>
  </div></body></html>`;
}

function templateCliente(data) {
  const { producto, comprador, entrega } = data;
  const arsTotal = (producto.precio * TC).toLocaleString("es-AR");

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head><meta charset="UTF-8"><style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #0e0c0a; color: #f5f0e8; margin: 0; padding: 0; }
    .wrap { max-width: 540px; margin: 0 auto; padding: 28px 16px; }
    .banner { background: #c9a84c; padding: 28px 24px; text-align: center; }
    .banner h1 { margin: 0 0 6px; font-size: 1.5rem; font-weight: 700; color: #000; }
    .banner p { margin: 0; color: rgba(0,0,0,0.6); font-size: 0.88rem; }
    .card { background: #141210; border: 1px solid rgba(201,168,76,0.15); padding: 22px 24px; margin-top: 14px; }
    .card h3 { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #c9a84c; margin: 0 0 14px; }
    .row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid rgba(201,168,76,0.06); }
    .row:last-child { border-bottom: none; }
    .lbl { color: #9a9085; font-size: 0.8rem; }
    .val { color: #f5f0e8; font-size: 0.85rem; font-weight: 600; }
    .price { color: #c9a84c; font-size: 1.1rem; font-weight: 700; }
    .footer-card { text-align: center; padding: 24px; background: #141210; border: 1px solid rgba(201,168,76,0.15); margin-top: 14px; }
    .wa-btn { display: inline-block; background: #25D366; color: #fff; padding: 11px 22px; text-decoration: none; font-weight: 700; font-size: 0.8rem; letter-spacing: 0.06em; text-transform: uppercase; margin-top: 10px; }
    footer { text-align: center; margin-top: 24px; color: #9a9085; font-size: 0.72rem; }
  </style></head>
  <body><div class="wrap">
    <div class="banner">
      <h1>✅ ¡Compra confirmada!</h1>
      <p>Gracias por tu compra, ${comprador.nombre}.</p>
    </div>
    <div class="card">
      <h3>Tu pedido</h3>
      <div class="row"><span class="lbl">Producto</span><span class="val">${producto.nombre}</span></div>
      <div class="row"><span class="lbl">Categoría</span><span class="val">${producto.categoria}</span></div>
      <div class="row"><span class="lbl">Total</span><span class="val price">ARS $${arsTotal}</span></div>
    </div>
    <div class="card">
      <h3>Entrega</h3>
      <div class="row"><span class="lbl">Modalidad</span><span class="val">${entrega.tipo === "retiro" ? "🏪 Retiro en local" : entrega.tipo === "interior" ? "🚚 Envío al interior" : "🏠 Envío a domicilio"}</span></div>
      ${entrega.tipo === "retiro" ? `<div class="row"><span class="lbl">Lugar</span><span class="val">San José de la Dormida, Córdoba</span></div>` : ""}
      ${entrega.tipo === "envio" ? `<div class="row"><span class="lbl">Dirección</span><span class="val">${entrega.direccion}</span></div>` : ""}
    </div>
    <div class="footer-card">
      <p style="color:#9a9085;font-size:0.83rem;margin:0 0 8px;">Te contactamos en menos de 1 hora para coordinar la entrega.</p>
      <a href="https://wa.me/${WA_NUMBER}?text=Hola!+Consulta+sobre+mi+compra+de+${encodeURIComponent(producto.nombre)}" class="wa-btn">Consultar por WhatsApp</a>
    </div>
    <footer>Arizona Jeans · Moda con identidad · San José de la Dormida, Córdoba</footer>
  </div></body></html>`;
}

// ── ROUTES ──

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, tienda: "Arizona Jeans", timestamp: new Date().toISOString() });
});

// Crear preferencia MP
app.post("/api/crear-preferencia", async (req, res) => {
  const { producto, comprador, entrega } = req.body;
  if (!producto || !comprador || !entrega) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    const precioBase = producto.precio * TC;
    const costoEnvio = entrega.tipo === "envio" ? 500 : 0;
    const precioTotal = Math.round(precioBase + costoEnvio);

    const preference = new Preference(client);
    const response = await preference.create({
      body: {
        items: [
          {
            id: producto.id,
            title: `${producto.nombre} — Arizona Jeans`,
            quantity: 1,
            currency_id: "ARS",
            unit_price: precioTotal,
          },
        ],
        payer: {
          name: comprador.nombre,
          email: comprador.email,
          phone: { number: comprador.telefono },
          identification: { type: "DNI", number: comprador.dni },
        },
        back_urls: {
          success: `${BASE_URL}/exito.html`,
          failure: `${BASE_URL}/error.html`,
          pending: `${BASE_URL}/pendiente.html`,
        },
        auto_return: "approved",
        metadata: { comprador, entrega, producto },
        statement_descriptor: "ARIZONA JEANS",
      },
    });

    // Send emails (async, don't await)
    const emailData = { producto, comprador, entrega, mp_id: response.id };
    const mailOptions = {
      adminTo: process.env.ADMIN_EMAIL || process.env.GMAIL_USER,
      clientTo: comprador.email,
    };

    Promise.all([
      transporter.sendMail({
        from: `"Arizona Jeans" <${process.env.GMAIL_USER}>`,
        to: mailOptions.adminTo,
        subject: `🛍️ Nueva venta: ${producto.nombre} — ${comprador.nombre}`,
        html: templateAdmin(emailData),
      }),
      transporter.sendMail({
        from: `"Arizona Jeans" <${process.env.GMAIL_USER}>`,
        to: mailOptions.clientTo,
        subject: `✅ Confirmación de compra — Arizona Jeans`,
        html: templateCliente(emailData),
      }),
    ]).catch(err => console.error("Email error:", err));

    res.json({ init_point: response.init_point, preference_id: response.id });
  } catch (err) {
    console.error("MP error:", err);
    res.status(500).json({ error: "Error al crear preferencia", detail: err.message });
  }
});

// Webhook MP
app.post("/api/webhook", async (req, res) => {
  console.log("Webhook recibido:", req.body);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Arizona Jeans API running on port ${PORT}`));

module.exports = app;
