// Única fuente de datos de ejemplo: la usa scripts/init-db.js (MySQL) y el respaldo en memoria.
// Las fotos son URLs de Unsplash: se pueden cambiar por archivos propios en /public/img.
const u = (id, w = 900, h) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${w}${h ? `&h=${h}` : ''}`;

const IMG = {
  platter: '1579871494447-9811cf80d66c',
  rolls: '1553621042-f6e147245754',
  rolls2: '1611143669185-af224c5e3252',
  nigiri: '1617196034796-73dfa7b1fd56',
  sashimi: '1583623025817-d180a2221d0a',
  maki: '1579584425555-c3ce17fd4351',
  boat: '1534482421-64566f976cfa',
  salmon: '1559410545-0bdcd187e0a6',
  dumpling: '1496116218417-1a781b1c416c',
  ramen: '1569718212165-3a8278d5f624',
  cocktail: '1514362545857-3bc16c4c7d1b',
  cocktail2: '1551024709-8f23befc6f87',
  room: '1514933651103-005eec06c04b',
  room2: '1517248135467-4c7edcad34c4',
  room3: '1414235077428-338989a2e8c0',
};

const t = (k) => u(IMG[k], 240, 240);
const b = (k) => u(IMG[k], 1200, 700);

const categories = [
  {
    slug: 'rolls-clasicos', name: 'Rolls Clásicos', subtitle: 'Los de siempre, hechos como se debe',
    image: b('rolls'), image2: b('maki'), image3: b('rolls2'),
    items: [
      ['California Roll', 'Kanikama, palta, pepino y sésamo tostado.', 8500, 'rolls', 1],
      ['Philadelphia Roll', 'Salmón rosado, queso crema y cebolla de verdeo.', 9200, 'rolls2', 1],
      ['Ebi Furai Roll', 'Langostino empanizado, palta y salsa tonkatsu.', 9800, 'maki', 0],
      ['Tuna Roll', 'Atún fresco, pepino y mayonesa de wasabi.', 9500, 'platter', 0],
      ['Vegetariano Roll', 'Palta, zanahoria, pepino y espárragos grillados.', 7600, 'boat', 0],
      ['Sake Avocado Roll', 'Salmón, palta y un toque de sésamo negro.', 9400, 'salmon', 0],
    ],
  },
  {
    slug: 'rolls-especiales', name: 'Rolls Especiales', subtitle: 'Creaciones de la casa, con carácter',
    image: b('rolls2'), image2: b('platter'), image3: b('boat'),
    items: [
      ['Sora Dragon', 'Langostino tempura, palta, salmón flameado y salsa unagi.', 12500, 'platter', 1],
      ['Volcán Rojo', 'Kanikama, queso crema, atún picante y crocante de panko.', 11800, 'maki', 1],
      ['Tigre Crocante', 'Salmón, ciboulette, salsa acevichada y tobiko.', 11500, 'rolls2', 0],
      ['Jardín del Pacífico', 'Palta, mango, langostino y salsa de maracuyá.', 11900, 'boat', 0],
      ['Noche en Tokio', 'Pez mantequilla, trufa negra y sal en escamas.', 13900, 'nigiri', 0],
      ['Ceviche Roll', 'Pesca blanca marinada, cebolla morada y leche de tigre.', 12200, 'salmon', 0],
    ],
  },
  {
    slug: 'sashimi-nigiris', name: 'Sashimi & Nigiris', subtitle: 'Pescado fresco, cortado a la orden',
    image: b('sashimi'), image2: b('nigiri'), image3: b('salmon'),
    items: [
      ['Sashimi de Salmón', 'Ocho láminas de salmón rosado seleccionado del día.', 10500, 'sashimi', 1],
      ['Sashimi Mixto', 'Salmón, atún y pez mantequilla. Doce láminas.', 14500, 'salmon', 1],
      ['Nigiri de Salmón', 'Dos piezas sobre arroz tibio de sushi.', 9000, 'nigiri', 0],
      ['Nigiri de Atún', 'Dos piezas con un toque de salsa de soja.', 9800, 'platter', 0],
      ['Nigiri Flameado', 'Salmón sopletado con mayonesa de ají amarillo.', 10200, 'boat', 0],
      ['Tabla Omakase', 'Selección del chef: 16 piezas variadas.', 24500, 'rolls', 0],
    ],
  },
  {
    slug: 'entradas', name: 'Entradas Calientes', subtitle: 'Para abrir la mesa',
    image: b('dumpling'), image2: b('ramen'), image3: b('room3'),
    items: [
      ['Gyozas de Cerdo', 'Seis piezas a la plancha con salsa ponzu.', 7200, 'dumpling', 1],
      ['Edamame', 'Vainas al vapor con sal marina y limón.', 5200, 'ramen', 0],
      ['Tempura de Langostinos', 'Cinco langostinos en tempura liviana.', 10900, 'maki', 0],
      ['Ramen Tonkotsu', 'Caldo de cerdo, huevo marinado y cebolla de verdeo.', 11800, 'ramen', 0],
    ],
  },
  {
    slug: 'bebidas', name: 'Bebidas & Sake', subtitle: 'Cócteles, vinos y destilados japoneses',
    image: b('cocktail'), image2: b('cocktail2'), image3: b('room'),
    items: [
      ['Sake Junmai', 'Servido frío o tibio. Copa 90 ml.', 6800, 'cocktail2', 1],
      ['Yuzu Spritz', 'Yuzu, espumante brut y soda de pepino.', 7500, 'cocktail', 1],
      ['Matcha Sour', 'Whisky japonés, matcha y limón.', 8200, 'cocktail2', 0],
      ['Cerveza Japonesa', 'Lager ligera, botella 355 ml.', 4500, 'cocktail', 0],
    ],
  },
];

const gallery = {
  hero: u(IMG.boat, 1920), about: u(IMG.room2, 1200), reserve: u(IMG.room3, 1600),
  heroDish: u(IMG.platter, 1400), menuBg: u(IMG.maki, 1600),
  menuHero: u(IMG.rolls2, 1920), card1: u(IMG.platter, 500), card2: u(IMG.room, 500), card3: u(IMG.room2, 500),
};

module.exports = { categories: categories.map((c) => ({
  ...c,
  items: c.items.map(([name, description, price, img, featured]) => ({ name, description, price, image: t(img), featured })),
})), gallery };
