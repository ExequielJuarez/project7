require('dotenv').config();
const os = require('os');
const path = require('path');
const express = require('express');
const compression = require('compression');
const db = require('./db');

const BUILD = Date.now();
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(compression());
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false }));

const nm = (p) => path.join(__dirname, 'node_modules', p);
app.use('/vendor/gsap', express.static(nm('gsap/dist')));
app.use('/vendor/lenis', express.static(nm('lenis/dist')));
// css/js siempre se revalidan (así los cambios llegan al instante); imágenes y fuentes sí se cachean
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '7d',
  setHeaders: (res, file) => { if (/\.(css|js)$/.test(file)) res.setHeader('Cache-Control', 'no-cache'); },
}));

const money = (n) => '$ ' + Number(n).toLocaleString('es-AR');
app.use((req, res, next) => {
  res.locals.money = money;
  res.locals.gallery = db.gallery;
  res.locals.path = req.path;
  res.locals.v = BUILD;
  next();
});

app.get('/', async (req, res, next) => {
  try {
    const menu = await db.getMenu();
    res.render('home', { menu, title: 'Sora Sushi Lounge — Sabores del Pacífico' });
  } catch (e) { next(e); }
});
app.get('/menu', async (req, res, next) => {
  try { res.render('menu', { menu: await db.getMenu(), title: 'Carta — Sora Sushi Lounge' }); } catch (e) { next(e); }
});
app.get('/reservas', (req, res) => res.render('reservas', { title: 'Reservas — Sora Sushi Lounge' }));
app.get('/nosotros', (req, res) => res.render('nosotros', { title: 'Nosotros — Sora Sushi Lounge' }));

app.get('/api/menu', async (req, res, next) => { try { res.json(await db.getMenu()); } catch (e) { next(e); } });

app.post('/api/reservas', async (req, res, next) => {
  try {
    const { name, phone, email, date, time, guests, notes } = req.body || {};
    const g = parseInt(guests, 10);
    if (!name?.trim() || !phone?.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !/^\d{2}:\d{2}$/.test(time || '') || !(g >= 1 && g <= 20))
      return res.status(400).json({ ok: false, error: 'Completá nombre, teléfono, fecha, horario y personas.' });
    if (new Date(date + 'T23:59:59') < new Date()) return res.status(400).json({ ok: false, error: 'La fecha ya pasó.' });
    const id = await db.createReservation({
      name: name.trim().slice(0, 120), phone: phone.trim().slice(0, 40), email: (email || '').trim().slice(0, 160),
      date, time, guests: g, notes: (notes || '').trim().slice(0, 500),
    });
    res.json({ ok: true, id });
  } catch (e) { next(e); }
});

// El precio siempre se recalcula en el servidor.
app.post('/api/pedido', async (req, res, next) => {
  try {
    const { name, phone, items } = req.body || {};
    if (!name?.trim() || !phone?.trim() || !Array.isArray(items) || !items.length)
      return res.status(400).json({ ok: false, error: 'Completá tus datos y agregá productos.' });
    const prices = await db.getPrices();
    let total = 0; const detail = [];
    for (const { id, qty } of items.slice(0, 50)) {
      const it = prices.get(+id); const q = Math.min(Math.max(parseInt(qty, 10) || 0, 0), 30);
      if (!it || !q) continue;
      total += it.price * q; detail.push({ id: it.id, name: it.name, qty: q, price: it.price });
    }
    if (!detail.length) return res.status(400).json({ ok: false, error: 'Carrito inválido.' });
    const id = await db.createOrder({ name: name.trim().slice(0, 120), phone: phone.trim().slice(0, 40), total, detail });
    res.json({ ok: true, id, total });
  } catch (e) { next(e); }
});

app.use((req, res) => res.status(404).render('404', { title: 'No encontrado' }));
app.use((err, req, res, next) => { // eslint-disable-line
  console.error(err);
  if (req.path.startsWith('/api/')) return res.status(500).json({ ok: false, error: 'Error del servidor' });
  res.status(500).send('Error del servidor');
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // 0.0.0.0 = accesible desde otros dispositivos de tu red (celu, tablet)

function lanUrls() {
  return Object.values(os.networkInterfaces()).flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal)
    .map((i) => `http://${i.address}:${PORT}`);
}

db.connect().then(() => app.listen(PORT, HOST, () => {
  console.log('\nSora Sushi listo:');
  console.log(`  PC:      http://localhost:${PORT}`);
  const lan = lanUrls();
  lan.forEach((u) => console.log(`  Celular: ${u}   (mismo Wi-Fi que la PC)`));
  if (!lan.length) console.log('  Celular: no se detectó IP de red local, revisá que estés conectado al Wi-Fi.');
  console.log('');
}));
