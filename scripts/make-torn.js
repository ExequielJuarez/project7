// Genera el borde "papel rasgado" (SVG) que se usa como máscara. node scripts/make-torn.js
const fs = require('fs');
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const W = 1600, H = 60; const pts = []; let y = 26;
for (let x = 0; x <= W; x += 6) {
  y += (rnd() - 0.5) * 9; y = Math.max(8, Math.min(46, y + (26 - y) * 0.05));
  pts.push([x, y + (rnd() > 0.93 ? -8 : 0)]);
}
pts[pts.length - 1][1] = pts[0][1]; // empalme continuo al repetir
const d = 'M0 ' + H + ' L' + pts.map(([x, yy]) => `${x} ${yy.toFixed(1)}`).join(' L') + ` L${W} ${H} Z`;
fs.writeFileSync(__dirname + '/../public/img/torn.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path d="${d}" fill="#000"/></svg>`);

// Versión invertida: sólido arriba, borde irregular abajo (para el final de la página)
const dFlip = 'M0 0 L' + pts.map(([x, yy]) => `${x} ${(H - yy).toFixed(1)}`).join(' L') + ` L${W} 0 Z`;
fs.writeFileSync(__dirname + '/../public/img/torn-flip.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path d="${dFlip}" fill="#000"/></svg>`);
