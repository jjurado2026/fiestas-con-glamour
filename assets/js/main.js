/* =====================================================================
   FIESTAS CON GLAMOUR — "Photocall"
   Todo el contenido es legible sin JavaScript: las 77 páginas de
   servicio están en el HTML (sin JS, las siete categorías se ven
   seguidas). Esto añade: la sesión de fotos del hero, entradas por
   scroll, pestañas y buscador del catálogo, mega-menú y menú móvil
   (construidos desde el catálogo: una sola fuente de datos), cabecera
   compacta, barra fija en móvil y validación del formulario.

   Parámetros para revisar y capturar:
     ?ss              sin animaciones
     &tab=infantiles  abre una pestaña del catálogo
     &q=payaso        lanza una búsqueda
     &menu=celebraciones   abre el mega-menú
     &movil           abre el menú móvil
   ===================================================================== */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const raiz = document.documentElement;
  const params = new URLSearchParams(location.search);
  const captura  = params.has('ss');
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const quieto   = captura || reducido;

  if (quieto) raiz.classList.add('quieto');
  if (captura) $$('img[loading="lazy"]').forEach(i => (i.loading = 'eager'));

  const reanima = (el, clase) => { el.classList.remove(clase); void el.offsetWidth; el.classList.add(clase); };

  /* ---------- Hero: la sesión de fotos ----------
     Las tomas se disparan alternando tiras (A1, B1, A2, B2…) cada 170 ms,
     como un fotomatón que hace cuatro fotos seguidas. Solo cuentan las
     tiras visibles (en móvil hay una). */
  const tiras = $$('.tira').filter(t => t.offsetParent !== null);
  const tomas = [];
  const maxTomas = Math.max(0, ...tiras.map(t => $$('.toma', t).length));
  for (let i = 0; i < maxTomas; i++) tiras.forEach(t => { const x = $$('.toma', t)[i]; if (x) tomas.push(x); });
  tomas.forEach((t, i) => t.style.setProperty('--d', `${760 + i * 170}ms`));

  if (quieto) {
    raiz.classList.add('cargado', 'listo');
  } else {
    // Espera a las fuentes (máx. 700 ms) para que las líneas del titular
    // no cambien de medida en mitad de la máscara
    const fuentes = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([fuentes, new Promise(r => setTimeout(r, 700))]).then(() => {
      requestAnimationFrame(() => requestAnimationFrame(() => raiz.classList.add('cargado')));
      setTimeout(() => raiz.classList.add('listo'), 760 + tomas.length * 170 + 1300);
    });
  }

  /* ---------- Grupos: --i es la columna real ----------
     Las rejillas entran fila a fila, de izquierda a derecha, tenga el
     número de columnas que tenga. La pared de ideas cae en secuencia. */
  const numerarGrupos = () => {
    $$('[data-grupo]').forEach(g => {
      const gtc = getComputedStyle(g).gridTemplateColumns;
      const secuencia = g.classList.contains('muro') || !gtc || gtc === 'none';
      const cols = secuencia ? Infinity : gtc.split(' ').filter(Boolean).length;
      const paso = g.classList.contains('muro') ? 90 : 110;
      [...g.children].forEach((el, i) => {
        const n = secuencia ? i : i % cols;
        el.style.setProperty('--i', n);
        $$('.foto', el).forEach(f => f.style.setProperty('--d', `${n * paso + 140}ms`));
      });
    });
  };
  numerarGrupos();

  /* ---------- Entradas por scroll: una vez por elemento ---------- */
  const entradas = $$('.entra, [data-grupo]');
  if (quieto || !('IntersectionObserver' in window)) {
    entradas.forEach(el => el.classList.add('visible', 'asentado'));
  } else {
    const obs = new IntersectionObserver((es, o) => {
      es.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        el.classList.add('visible');
        o.unobserve(el);
        // Terminada la entrada, se quitan los retrasos para que el hover responda
        if (el.hasAttribute('data-grupo')) setTimeout(() => el.classList.add('asentado'), 1300 + el.children.length * 110);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    entradas.forEach(el => obs.observe(el));
  }

  /* ---------- Cabecera compacta ---------- */
  const cab = $('#cab');
  const alScroll = () => cab.classList.toggle('compacta', scrollY > 24);
  addEventListener('scroll', alScroll, { passive: true });
  alScroll();

  /* =====================================================================
     CATÁLOGO · pestañas
     Frecuente → cambio rápido (240 ms). Con teclado, sin animación.
     ===================================================================== */
  const tabs = $$('.pestana');
  const paneles = $$('.panel');
  const tablist = $('.pestanas');

  const activar = (tab, { foco = false, animar = true } = {}) => {
    if (!tab) return;
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    paneles.forEach(p => {
      const on = p.id === tab.getAttribute('aria-controls');
      p.hidden = !on;
      if (on && animar && !quieto) reanima(p, 'entra-panel');
    });
    if (foco) tab.focus({ preventScroll: true });
    // Centra la pestaña en su fila (solo scroll horizontal de la fila)
    const x = tab.offsetLeft - (tablist.clientWidth - tab.offsetWidth) / 2;
    tablist.scrollTo({ left: Math.max(0, x), behavior: quieto ? 'auto' : 'smooth' });
  };

  paneles.forEach((p, i) => { if (i) p.hidden = true; });
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => activar(t));
    t.addEventListener('keydown', e => {
      const mapa = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
      if (!(e.key in mapa)) return;
      e.preventDefault();
      activar(tabs[(mapa[e.key] + tabs.length) % tabs.length], { foco: true, animar: false });
    });
  });

  /* ---------- Buscador ----------
     Sin tildes ni mayúsculas: "comunion" encuentra "Organización de
     comuniones". Busca en el rótulo y en data-k (palabras de su página). */
  const campo = $('#busca');
  const borrar = $('.buscador__borrar');
  const resultados = $('#resultados');
  const lista = $('.resultados__lista', resultados);
  const vacio = $('.resultados__vacio', resultados);
  const cuenta = $('.resultados__n', resultados);
  const cajaPaneles = $('.carta__paneles');

  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const datosCat = id => {
    const p = $(`#cat-${id}`);
    if (!p) return null;
    const ver = $('.panel__cuerpo > .enlace', p);
    return {
      id,
      nombre: $('.panel__t', p).textContent.trim(),
      lema: $('.panel__lema', p).textContent.trim(),
      url: ver.href,
      ver: ver.textContent.trim(),
      enlaces: $$('.servicios a', p)
    };
  };

  const indice = paneles.map(p => {
    const d = datosCat(p.dataset.cat);
    return {
      ...d,
      items: d.enlaces.map(a => ({ a, texto: a.textContent.trim(), clave: norm(`${a.textContent} ${a.dataset.k || ''}`) }))
    };
  });
  const total = indice.reduce((n, c) => n + c.items.length, 0);
  $$('[data-total]').forEach(el => (el.textContent = total));

  // Resalta cada término dentro del rótulo visible (las posiciones coinciden:
  // quitar tildes con NFD no cambia la longitud de un texto en NFC)
  const marcar = (texto, terminos) => {
    const n = norm(texto);
    const marcas = new Array(texto.length).fill(false);
    terminos.forEach(t => {
      let i = n.indexOf(t);
      while (i > -1 && t) { for (let k = i; k < i + t.length; k++) marcas[k] = true; i = n.indexOf(t, i + t.length); }
    });
    let html = '', dentro = false;
    [...texto].forEach((c, k) => {
      if (marcas[k] && !dentro) { html += '<mark>'; dentro = true; }
      if (!marcas[k] && dentro) { html += '</mark>'; dentro = false; }
      html += esc(c);
    });
    return dentro ? html + '</mark>' : html;
  };

  const buscar = () => {
    const bruto = campo.value.trim();
    const q = norm(bruto);
    borrar.hidden = !bruto;
    if (q.length < 2) {
      resultados.hidden = true;
      tablist.hidden = false;
      cajaPaneles.hidden = false;
      cuenta.textContent = '';
      return;
    }
    const terminos = q.split(/\s+/).filter(Boolean);
    let n = 0;
    lista.textContent = '';
    indice.forEach(cat => {
      const hits = cat.items.filter(it => terminos.every(t => it.clave.includes(t)));
      if (!hits.length) return;
      n += hits.length;
      const g = document.createElement('div');
      g.className = 'resultados__grupo';
      g.innerHTML = `<div class="resultados__cab"><h3 class="resultados__t">${esc(cat.nombre)}</h3><button type="button" class="resultados__ver" data-ver="${cat.id}">Ver la categoría</button></div>`;
      const ul = document.createElement('ul');
      ul.className = 'servicios';
      hits.forEach(it => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = it.a.href;
        // El rótulo va en un span: el enlace es flex y cada <mark> sería una columna
        a.innerHTML = `<span>${marcar(it.texto, terminos)}</span>`;
        li.append(a);
        ul.append(li);
      });
      g.append(ul);
      lista.append(g);
    });
    resultados.hidden = false;
    tablist.hidden = true;
    cajaPaneles.hidden = true;
    vacio.hidden = n > 0;
    cuenta.textContent = n
      ? `${n} ${n === 1 ? 'servicio' : 'servicios'} para «${bruto}»`
      : `Ningún servicio para «${bruto}»`;
  };

  const limpiarBusqueda = () => { if (campo.value) { campo.value = ''; buscar(); } };

  campo.addEventListener('input', buscar);
  campo.addEventListener('keydown', e => { if (e.key === 'Escape' && campo.value) { e.stopPropagation(); limpiarBusqueda(); } });
  borrar.addEventListener('click', () => { limpiarBusqueda(); campo.focus(); });
  lista.addEventListener('click', e => {
    const b = e.target.closest('[data-ver]');
    if (!b) return;
    limpiarBusqueda();
    activar($(`#tab-${b.dataset.ver}`), { foco: true });
  });
  // "Cuéntanos qué buscas": la búsqueda viaja al mensaje del formulario
  $('[data-pide]')?.addEventListener('click', () => {
    const m = $('#f-mensaje');
    if (m && campo.value.trim() && !m.value) m.value = `Busco: ${campo.value.trim()}. `;
  });

  // Enlaces que abren una pestaña concreta (pie, "Organizamos")
  $$('[data-tab]').forEach(a => a.addEventListener('click', () => {
    limpiarBusqueda();
    activar($(`#tab-${a.dataset.tab}`), { animar: false });
  }));

  /* =====================================================================
     MEGA-MENÚ · construido desde el catálogo
     Ratón: se abre con 120 ms de intención y se cierra al salir de la
     cabecera. Clic y teclado: alternan. Esc cierra y devuelve el foco.
     ===================================================================== */
  const mega = $('#mega');
  const botones = $$('.menu__btn');
  let abierto = null, porHover = false, tAbre, tCierra;

  const flecha = '<svg aria-hidden="true"><use href="#i-flecha"/></svg>';
  const clonar = a => { const c = a.cloneNode(true); c.removeAttribute('data-k'); return c; };

  const pintarMega = btn => {
    const ids = btn.dataset.cats.split(' ');
    const cats = ids.map(datosCat);
    const [p] = cats;
    mega.innerHTML = `<div class="mega__env"><div class="mega__lado"><p class="mega__t">${esc(p.nombre)}</p><p class="mega__lema">${esc(p.lema)}</p><a class="enlace" href="${p.url}">${esc(p.ver)}${flecha}</a></div><div class="mega__grupos"></div></div>`;
    const grupos = $('.mega__grupos', mega);
    cats.forEach(c => {
      const g = document.createElement('div');
      if (cats.length > 1) g.innerHTML = `<p class="mega__grupo-t">${esc(c.nombre)}</p>`;
      const ul = document.createElement('ul');
      ul.className = 'mega__lista';
      c.enlaces.forEach(a => { const li = document.createElement('li'); li.append(clonar(a)); ul.append(li); });
      g.append(ul);
      grupos.append(g);
    });
  };

  const abrirMega = (btn, { hover = false, animar = true } = {}) => {
    clearTimeout(tCierra);
    if (abierto === btn) return;
    const venia = !!abierto;
    botones.forEach(b => b.setAttribute('aria-expanded', String(b === btn)));
    pintarMega(btn);
    mega.hidden = false;
    cab.classList.add('abierta');
    // Entre categorías el panel ya está abierto: se cambia sin animar
    if (!venia && animar && !quieto) reanima(mega, 'entra-mega');
    abierto = btn;
    porHover = hover;
  };

  const cerrarMega = (devolverFoco = false) => {
    if (!abierto) return;
    const b = abierto;
    abierto = null;
    botones.forEach(x => x.setAttribute('aria-expanded', 'false'));
    mega.hidden = true;
    mega.classList.remove('entra-mega');
    cab.classList.remove('abierta');
    if (devolverFoco) b.focus();
  };

  botones.forEach(b => {
    b.addEventListener('click', () => {
      if (abierto === b && !porHover) cerrarMega();
      else abrirMega(b, { animar: !abierto });
      porHover = false;
    });
    b.addEventListener('pointerenter', e => {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(tCierra);
      tAbre = setTimeout(() => abrirMega(b, { hover: true }), abierto ? 0 : 120);
    });
    b.addEventListener('pointerleave', () => clearTimeout(tAbre));
    b.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); abrirMega(b, { animar: false }); $('a', mega)?.focus(); }
    });
  });
  cab.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') tCierra = setTimeout(() => cerrarMega(), 240); });
  cab.addEventListener('pointerenter', () => clearTimeout(tCierra));
  cab.addEventListener('focusout', e => { if (abierto && !cab.contains(e.relatedTarget)) cerrarMega(); });
  mega.addEventListener('click', e => { if (e.target.closest('a')) cerrarMega(); });
  document.addEventListener('click', e => { if (abierto && !cab.contains(e.target)) cerrarMega(); });

  /* =====================================================================
     MENÚ MÓVIL · acordeón por categoría, del mismo catálogo
     ===================================================================== */
  const movil = $('#movil');
  const abrirBtn = $('.cab__abrir');
  const navMovil = $('.movil__nav', movil);

  botones.forEach((b, i) => {
    const cats = b.dataset.cats.split(' ').map(datosCat);
    const id = `movil-l-${i}`;
    const div = document.createElement('div');
    div.className = 'movil__cat';
    div.innerHTML = `<button class="movil__btn" type="button" aria-expanded="false" aria-controls="${id}">${esc(b.textContent.trim())}<svg aria-hidden="true"><use href="#i-baja"/></svg></button><div class="movil__lista" id="${id}" hidden></div>`;
    const caja = $('.movil__lista', div);
    cats.forEach(c => {
      const ul = document.createElement('ul');
      c.enlaces.forEach(a => { const li = document.createElement('li'); li.append(clonar(a)); ul.append(li); });
      const li = document.createElement('li');
      li.innerHTML = `<a class="movil__todo" href="${c.url}">${esc(c.ver)}</a>`;
      ul.append(li);
      caja.append(ul);
    });
    navMovil.append(div);
  });

  const abrirMovil = () => {
    movil.hidden = false;
    if (!quieto) reanima(movil, 'entra-movil');
    abrirBtn.setAttribute('aria-expanded', 'true');
    $('.vo', abrirBtn).textContent = 'Cerrar menú';
    $('use', abrirBtn).setAttribute('href', '#i-cerrar');
    cab.classList.add('abierta');
    document.body.style.overflow = 'hidden';
  };
  const cerrarMovil = (devolverFoco = false) => {
    if (movil.hidden) return;
    movil.hidden = true;
    abrirBtn.setAttribute('aria-expanded', 'false');
    $('.vo', abrirBtn).textContent = 'Abrir menú';
    $('use', abrirBtn).setAttribute('href', '#i-menu');
    cab.classList.remove('abierta');
    document.body.style.overflow = '';
    if (devolverFoco) abrirBtn.focus();
  };

  abrirBtn.addEventListener('click', () => (movil.hidden ? abrirMovil() : cerrarMovil()));
  movil.addEventListener('click', e => {
    const b = e.target.closest('.movil__btn');
    if (b) {
      const on = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(on));
      $(`#${b.getAttribute('aria-controls')}`).hidden = !on;
      return;
    }
    if (e.target.closest('a')) cerrarMovil();
  });
  matchMedia('(min-width: 1100px)').addEventListener('change', e => (e.matches ? cerrarMovil() : cerrarMega()));

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (abierto) cerrarMega(true);
    cerrarMovil(true);
  });

  /* ---------- Barra fija en móvil ----------
     Aparece cuando el hero sale de pantalla; se retira en el contacto. */
  const fija = $('.fija');
  if (fija && 'IntersectionObserver' in window) {
    let fueraHero = false, enContacto = false;
    const pinta = () => {
      const v = fueraHero && !enContacto;
      fija.classList.toggle('visible', v);
      fija.setAttribute('aria-hidden', String(!v));
      $$('a', fija).forEach(a => (a.tabIndex = v ? 0 : -1));
    };
    new IntersectionObserver(([e]) => { fueraHero = !e.isIntersecting; pinta(); }).observe($('.hero'));
    new IntersectionObserver(([e]) => { enContacto = e.isIntersecting; pinta(); }, { threshold: .12 }).observe($('#contacto'));
  }

  /* =====================================================================
     FORMULARIO · validación en línea, sin castigar mientras se escribe
     ===================================================================== */
  const form = $('#formulario');
  const asunto = $('#f-asunto');
  $$('[data-asunto]').forEach(a => a.addEventListener('click', () => { asunto.value = a.dataset.asunto; }));

  const reglas = {
    'f-nombre': el => el.value.trim().length > 1,
    'f-email': el => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim()),
    'f-asunto': el => !!el.value,
    'f-priv': el => el.checked
  };
  const validar = el => {
    const ok = reglas[el.id](el);
    el.setAttribute('aria-invalid', String(!ok));
    $(`#${el.getAttribute('aria-describedby')}`).hidden = ok;
    return ok;
  };
  Object.keys(reglas).forEach(id => {
    const el = $(`#${id}`);
    const cambio = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'blur';
    el.addEventListener(cambio, () => { if (el.value || el.hasAttribute('aria-invalid')) validar(el); });
    el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') validar(el); });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if ($('#f-web').value) return;                       // trampa para bots
    const malos = Object.keys(reglas).map(id => $(`#${id}`)).filter(el => !validar(el));
    if (malos.length) { malos[0].focus(); return; }
    const ok = $('.formulario__ok', form);
    $('.formulario__pie', form).hidden = true;
    ok.hidden = false;
    ok.tabIndex = -1;
    if (!quieto) reanima(ok, 'entra-ok');
    ok.focus();
  });

  /* ---------- Estados por parámetro (revisión y capturas) ---------- */
  if (params.get('tab')) activar($(`#tab-${params.get('tab')}`), { animar: false });
  if (params.get('q')) { campo.value = params.get('q'); buscar(); }
  if (params.get('menu')) {
    const b = botones.find(x => x.dataset.cats.split(' ')[0] === params.get('menu'));
    if (b) abrirMega(b, { animar: false });
  }
  if (params.has('movil')) abrirMovil();
})();
