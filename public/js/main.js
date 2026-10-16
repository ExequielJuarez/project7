(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const money = (n) => '$ ' + Number(n).toLocaleString('es-AR');
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- scroll suave (Lenis) sincronizado con GSAP ---------- */
  let lenis = null;
  if (!reduce) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"], a[href*="/menu#"]').forEach((a) => a.addEventListener('click', (e) => {
      const h = a.getAttribute('href').split('#')[1]; const t = h && document.getElementById(h);
      if (t && (a.pathname === location.pathname || a.getAttribute('href')[0] === '#')) { e.preventDefault(); lenis.scrollTo(t, { offset: -70, duration: 1.4 }); }
    }));
  }
  const lockScroll = (on) => { on ? lenis?.stop() : lenis?.start(); document.body.style.overflow = on ? 'hidden' : ''; };

  /* ---------- cursor personalizado ---------- */
  if (fine) {
    const cur = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__label');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY; cur.classList.remove('is-hidden');
      dot.style.transform = `translate(${mx}px,${my}px)`;
    });
    document.addEventListener('mouseleave', () => cur.classList.add('is-hidden'));
    addEventListener('mousedown', () => cur.classList.add('is-down'));
    addEventListener('mouseup', () => cur.classList.remove('is-down'));
    gsap.ticker.add(() => {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
    });
    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest('[data-cursor]');
      if (t) {
        const big = t.matches('.item,.qcard,.menu-teaser__list a,.dots a');
        if (t.matches('.dots a,.social a,.cart-btn')) cur.classList.add('is-link'), cur.classList.remove('is-hover');
        else { label.textContent = t.dataset.cursor; cur.classList.add('is-hover'); cur.classList.remove('is-link'); }
        if (!big && !t.matches('.item')) {/* tamaño estándar */}
      } else {
        cur.classList.remove('is-hover');
        cur.classList.toggle('is-link', !!e.target.closest('a,button,select,input,textarea'));
      }
    });
  }

  /* ---------- header ---------- */
  const header = $('#header');
  let lastY = 0;
  const onScroll = (y) => {
    header.classList.toggle('is-stuck', y > 40);
    header.classList.toggle('is-hide', y > lastY && y > 500 && !$('#nav').classList.contains('open'));
    lastY = y;
  };
  lenis ? lenis.on('scroll', ({ scroll }) => onScroll(scroll)) : addEventListener('scroll', () => onScroll(scrollY), { passive: true });
  const burger = $('#burger'), nav = $('#nav');
  burger.addEventListener('click', () => {
    const o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); lockScroll(o);
  });
  $$('#nav a').forEach((a) => a.addEventListener('click', () => { nav.classList.remove('open'); burger.setAttribute('aria-expanded', false); lockScroll(false); }));

  /* ---------- texto dividido en líneas ---------- */
  $$('[data-split]').forEach((el) => {
    const lines = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = lines.map((l) => `<span class="split-line"><span>${l}</span></span>`).join('');
    el.style.opacity = 1; el._lines = $$('.split-line>span', el);
    gsap.set(el._lines, { yPercent: 115, rotate: 3 });
  });
  gsap.set($$('[data-reveal],[data-split-in]'), { y: 34 });
  const reveal = (el) => {
    if (el._lines) gsap.to(el._lines, { yPercent: 0, rotate: 0, duration: 1.4, ease: 'expo.out', stagger: 0.12 });
    else gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', clearProps: 'transform' });
  };
  const initScroll = () => {
    $$('[data-split],[data-split-in],[data-reveal]').forEach((el) => {
      ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => reveal(el) });
    });
    // platos: entran en tandas, con un movimiento mínimo para que nunca se vean amontonados
    ScrollTrigger.batch('.item', {
      start: 'top 94%', once: true, interval: 0.1, batchMax: 4,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09, clearProps: 'transform' }),
    });
    // parallax
    $$('[data-parallax]').forEach((el) => {
      const s = parseFloat(el.dataset.parallax) * 40;
      gsap.set(el, { scale: el.closest('.banner') ? 1.2 : 1 });
      gsap.fromTo(el, { yPercent: -s }, { yPercent: s, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    // banners: se abren al entrar
    $$('[data-reveal-banner]').forEach((b) => {
      gsap.fromTo(b, { clipPath: 'inset(0 12% 0 12%)' }, { clipPath: 'inset(0 0% 0 0%)', ease: 'none',
        scrollTrigger: { trigger: b, start: 'top 95%', end: 'top 45%', scrub: true } });
      gsap.from($('.banner__txt', b), { y: 40, opacity: 0, scrollTrigger: { trigger: b, start: 'top 80%', end: 'top 45%', scrub: true } });
    });
    // contadores
    $$('[data-count]').forEach((el) => {
      const end = +el.dataset.count, o = { v: 0 };
      ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true,
        onEnter: () => gsap.to(o, { v: end, duration: 2, ease: 'power2.out', onUpdate: () => (el.textContent = Math.round(o.v)) }) });
    });
    // puntos laterales
    const dots = $$('#dots a');
    $$('[data-section]').forEach((s, i) => ScrollTrigger.create({
      trigger: s, start: 'top 55%', end: 'bottom 55%',
      onToggle: (self) => self.isActive && dots.forEach((d, j) => d.classList.toggle('is-on', i === j)),
    }));
    // las tarjetas del hero entran escalonadas
    gsap.from('.qcard', { x: 60, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12, delay: 0.5 });
    // magnetismo en botones
    if (fine) $$('.btn').forEach((b) => {
      b.addEventListener('mousemove', (e) => {
        const r = b.getBoundingClientRect();
        gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.4 });
      });
      b.addEventListener('mouseleave', () => gsap.to(b, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,.4)' }));
    });
  };

  /* ---------- preloader ---------- */
  const start = () => {
    gsap.to('.preloader', { yPercent: -100, duration: 1, ease: 'expo.inOut', onComplete: () => $('.preloader').remove() });
    document.body.classList.remove('is-loading');
    initScroll(); ScrollTrigger.refresh();
  };
  const minWait = new Promise((r) => setTimeout(r, 1200));
  const loaded = new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r)));
  Promise.race([Promise.all([minWait, loaded]), new Promise((r) => setTimeout(r, 2600))]).then(start);

  /* ---------- imágenes que no cargan: fondo elegante de respaldo ---------- */
  document.addEventListener('error', (e) => {
    const i = e.target; if (i.tagName !== 'IMG' || i.dataset.failed) return;
    i.dataset.failed = 1; i.alt = ''; i.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='; i.style.background = 'radial-gradient(circle at 30% 30%,#223a2c,#0f1713)';
  }, true);

  /* ---------- carrito ---------- */
  const KEY = 'sora_cart_v1';
  let cart = []; try { cart = JSON.parse(localStorage.getItem(KEY)) || []; } catch (_) {}
  const drawer = $('#drawer'), list = $('#cartList');
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (_) {} };
  const render = () => {
    const n = cart.reduce((a, c) => a + c.qty, 0), total = cart.reduce((a, c) => a + c.qty * c.price, 0);
    const badge = $('#cartCount'); badge.textContent = n; badge.classList.toggle('has', n > 0);
    $('#cartTotal').textContent = money(total);
    list.innerHTML = cart.length ? cart.map((c) => `<li><span>${c.name}</span><strong>${money(c.price * c.qty)}</strong>
      <span class="q"><button data-d="-1" data-id="${c.id}" aria-label="Quitar uno">−</button>${c.qty}<button data-d="1" data-id="${c.id}" aria-label="Agregar uno">+</button></span></li>`).join('')
      : '<li class="drawer__empty">Todavía no agregaste nada.<br>Tocá un plato de la carta para sumarlo.</li>';
  };
  const openCart = (o) => { drawer.classList.toggle('open', o); drawer.setAttribute('aria-hidden', !o); lockScroll(o); };
  $('#cartOpen').addEventListener('click', () => openCart(true));
  $('#cartClose').addEventListener('click', () => openCart(false));
  $('#cartClose2').addEventListener('click', () => openCart(false));
  addEventListener('keydown', (e) => e.key === 'Escape' && openCart(false));
  list.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-id]'); if (!b) return;
    const it = cart.find((c) => c.id == b.dataset.id); it.qty += +b.dataset.d;
    cart = cart.filter((c) => c.qty > 0); save(); render();
  });
  $$('.item').forEach((el) => el.addEventListener('click', () => {
    const id = +el.dataset.id, ex = cart.find((c) => c.id === id);
    ex ? ex.qty++ : cart.push({ id, name: el.dataset.name, price: +el.dataset.price, qty: 1 });
    save(); render();
    el.classList.remove('added'); void el.offsetWidth; el.classList.add('added');
    gsap.fromTo('.cart-btn', { scale: 1.3 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1,.4)' });
  }));
  $('#orderForm').addEventListener('submit', async (e) => {
    e.preventDefault(); const msg = $('#orderMsg'), f = e.target;
    if (!cart.length) { msg.className = 'form__msg err'; msg.textContent = 'Tu pedido está vacío.'; return; }
    msg.className = 'form__msg'; msg.textContent = 'Enviando…';
    try {
      const r = await fetch('/api/pedido', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: f.name.value, phone: f.phone.value, items: cart.map(({ id, qty }) => ({ id, qty })) }) });
      const d = await r.json(); if (!d.ok) throw new Error(d.error);
      cart = []; save(); render(); f.reset(); msg.className = 'form__msg ok'; msg.textContent = `¡Listo! Pedido #${d.id} recibido. Te contactamos por teléfono.`;
    } catch (err) { msg.className = 'form__msg err'; msg.textContent = err.message || 'No pudimos enviar el pedido.'; }
  });
  render();

  /* ---------- reservas ---------- */
  const rf = $('#reserveForm');
  if (rf) {
    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
    rf.date.min = today;
    const q = new URLSearchParams(location.search);
    ['date', 'time', 'guests'].forEach((k) => q.get(k) && rf[k] && (rf[k].value = q.get(k)));
    rf.addEventListener('submit', async (e) => {
      e.preventDefault(); const msg = $('#reserveMsg');
      if (!rf.date.value || !rf.time.value || !rf.guests.value) { msg.className = 'form__msg err'; msg.textContent = 'Elegí fecha, horario y personas.'; return; }
      if (!rf.name) { location.href = '/reservas?' + new URLSearchParams({ date: rf.date.value, time: rf.time.value, guests: rf.guests.value }); return; }
      msg.className = 'form__msg'; msg.textContent = 'Reservando…';
      try {
        const r = await fetch('/api/reservas', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(rf))) });
        const d = await r.json(); if (!d.ok) throw new Error(d.error);
        msg.className = 'form__msg ok'; msg.textContent = `¡Reserva #${d.id} confirmada! Te esperamos.`; rf.reset();
      } catch (err) { msg.className = 'form__msg err'; msg.textContent = err.message || 'No pudimos reservar.'; }
    });
  }
})();
