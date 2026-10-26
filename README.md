# Sora Sushi Lounge

Landing + carta + reservas. Node.js · Express · EJS · MySQL · GSAP + Lenis.

## Correrlo
```bash
npm install
cp .env.example .env        # completá los datos de MySQL
npm run db:init             # crea la base, tablas y carga la carta
npm start                   # http://localhost:3000
```
Si MySQL no está disponible el sitio arranca igual con datos en memoria (sin persistir).

## Probar desde el celular (misma red Wi-Fi)
1. Conectá PC y celular al mismo Wi-Fi y corré `npm start`.
2. En la terminal aparece una línea `Celular: http://192.168.x.x:3000`: abrila en el navegador del celu.
3. Si no abre, permití el puerto 3000 en el firewall de la PC (Windows: *Permitir una aplicación* → Node.js en redes privadas)
   y comprobá que el Wi-Fi no tenga "aislamiento de clientes" (redes de invitados).

## Estructura
- `server.js` rutas (`/`, `/menu`, `/reservas`, `/nosotros`) y API (`/api/menu`, `/api/reservas`, `/api/pedido`)
- `db/` esquema SQL, datos de ejemplo (`seedData.js`) y acceso a MySQL
- `views/` plantillas EJS · `public/` CSS y JS (cursor, scroll suave, parallax, carrito)

## Fotos
Son URLs de Unsplash en `db/seedData.js` (objeto `IMG`). Para usar las tuyas, ponelas en `public/img/` y cambiá las URLs
(luego `npm run db:init`). Si una foto no carga, se muestra un fondo verde oscuro de respaldo.
