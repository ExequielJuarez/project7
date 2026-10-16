// Crea tablas y carga la carta: npm run db:init
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { categories } = require('../db/seedData');

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost', port: +(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });
  await conn.query(fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8'));
  await conn.query(`USE \`${process.env.DB_NAME || 'sora_sushi'}\``);
  await conn.query('SET FOREIGN_KEY_CHECKS=0; TRUNCATE items; TRUNCATE categories; SET FOREIGN_KEY_CHECKS=1;');
  for (const [ci, c] of categories.entries()) {
    const [r] = await conn.query(
      'INSERT INTO categories (slug,name,subtitle,image,image2,image3,position) VALUES (?,?,?,?,?,?,?)',
      [c.slug, c.name, c.subtitle, c.image, c.image2, c.image3, ci]);
    for (const [ii, it] of c.items.entries()) {
      await conn.query('INSERT INTO items (category_id,name,description,price,image,featured,position) VALUES (?,?,?,?,?,?,?)',
        [r.insertId, it.name, it.description, it.price, it.image, it.featured, ii]);
    }
  }
  console.log('Base lista: categorías e items cargados.');
  await conn.end();
})().catch((e) => { console.error(e); process.exit(1); });
