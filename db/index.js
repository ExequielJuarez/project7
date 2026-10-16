// Capa de datos: MySQL si está disponible; si no, respaldo en memoria con los mismos datos de ejemplo.
const mysql = require('mysql2/promise');
const seed = require('./seedData');

let pool = null;
let usingMysql = false;
const mem = { reservations: [], orders: [] };

async function connect() {
  try {
    const p = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: +(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sora_sushi',
      waitForConnections: true,
      connectionLimit: 10,
    });
    await p.query('SELECT 1');
    pool = p;
    usingMysql = true;
    console.log('[db] Conectado a MySQL');
  } catch (e) {
    console.warn(`[db] MySQL no disponible (${e.code || e.message}). Usando datos en memoria.`);
  }
}

async function getMenu() {
  if (!usingMysql) {
    return seed.categories.map((c, ci) => ({
      id: ci + 1, ...c, items: c.items.map((it, ii) => ({ id: (ci + 1) * 100 + ii + 1, ...it })),
    }));
  }
  const [cats] = await pool.query('SELECT * FROM categories ORDER BY position');
  const [items] = await pool.query('SELECT * FROM items ORDER BY position');
  return cats.map((c) => ({ ...c, items: items.filter((i) => i.category_id === c.id) }));
}

async function createReservation(r) {
  if (!usingMysql) { mem.reservations.push({ id: mem.reservations.length + 1, ...r }); return mem.reservations.length; }
  const [res] = await pool.query(
    'INSERT INTO reservations (name, phone, email, date, time, guests, notes) VALUES (?,?,?,?,?,?,?)',
    [r.name, r.phone, r.email || null, r.date, r.time, r.guests, r.notes || null]);
  return res.insertId;
}

async function createOrder(o) {
  if (!usingMysql) { mem.orders.push({ id: mem.orders.length + 1, ...o }); return mem.orders.length; }
  const [res] = await pool.query('INSERT INTO orders (name, phone, total, detail) VALUES (?,?,?,?)',
    [o.name, o.phone, o.total, JSON.stringify(o.detail)]);
  return res.insertId;
}

async function getPrices() {
  const menu = await getMenu();
  const map = new Map();
  menu.forEach((c) => c.items.forEach((i) => map.set(i.id, i)));
  return map;
}

module.exports = { connect, getMenu, createReservation, createOrder, getPrices, gallery: seed.gallery, get usingMysql() { return usingMysql; } };
