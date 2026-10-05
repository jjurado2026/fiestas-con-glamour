# Fiestas con Glamour — Propuesta de nueva homepage

Prototipo de homepage para **Fiestas con Glamour**, empresa de organización de fiestas privadas y eventos de empresa en Madrid (c/ Orense 37). Sustituye a su web actual, un WordPress con el tema Chameleon sin tocar desde 2014.

**Qué es:** su home —sus bloques, en su orden, con sus textos y sus fotos— rehecha con el azul plateado de su propio logo. Los bloques nuevos (catálogo, quiénes somos, contacto) se construyen solo con textos de sus propias páginas.

**Dirección estética:** *"Noche de estreno"* — una fiesta con glamour es una noche de estreno. Dos focos barren el escenario, el rótulo **"Experiencias únicas"** se enciende letra a letra como un neón y las siete fotos de su slider giran en un tiovivo 3D; al pulsar una, vuela a primer plano con un flash. Sus tres públicos son invitaciones que llegan en sobre y se dan la vuelta, el catálogo es un abanico que se mece, las ideas originales se descubren con un foco en un escenario a oscuras, las promociones son una cartelera con bombillas y el equipo aparece tras un telón. Yeseva One + Jost.

**Lo más útil:** sus **77 páginas de servicio**, que hoy viven en un desplegable de cuatro niveles solo usable con ratón, pasan a un abanico de siete categorías con **buscador sin tildes** ("comunion", "jamon", "payaso") y a un mega-menú construido desde ese mismo catálogo. "Pide presupuesto" está siempre a mano y deja elegido el asunto del formulario.

**Fotos:** las mismas de su web, sin recortar ni retocar el color, ampliadas con IA (Real-ESRGAN; en las fotos con personas, una mezcla de dos modelos para que las caras sigan siendo fieles).

- Capturas sin animaciones: añadir `?ss` a la URL.
- Estados para revisar: `&menu=celebraciones`, `&movil`, `&cat=infantiles`, `&q=payaso`, `&visor=3`, `&verIdea=6`, `&girar=empresas`, `&idea=5`.

## Caducidad
La propuesta se ve hasta el **15 de octubre de 2026** (hora de Madrid). Desde el 16, `index.html` lleva a `mantenimiento.html`: el aviso, el correo de contacto y la home entera en miniatura, que se recorre sola (y a mano al tocarla). La fecha está en la línea `Date.parse(...)` al principio de `index.html`. Abierto como archivo (`file://`) no caduca.

## Stack
HTML, CSS y JavaScript puro. Cero dependencias, cero build. Fuentes autoalojadas (Yeseva One + Jost, 44 KB) e imágenes del cliente en WebP. Todo el catálogo está en el HTML: sin JS se ve completo. Respeta `prefers-reduced-motion`.

## Estructura
```
prototype/          Prototipo navegable (se publica en gh-pages con git subtree)
  index.html
  mantenimiento.html  Lo que se ve cuando la propuesta caduca
  assets/css/       global.css · home.css
  assets/js/        main.js
  assets/fonts/     yeseva-one · jost (woff2, latino)
  assets/img/       fotos del cliente en WebP (ampliadas con IA) y su logo original; home-miniatura.webp para el mantenimiento
_interno/           Auditoría, competencia, brief, copy, plan, imágenes y propuesta (no se publica)
```

## Ver en local
```bash
cd prototype && python -m http.server 8000
```

## Publicar
```bash
git subtree push --prefix=prototype origin gh-pages
```

---
Diseño y desarrollo: **Juan Jurado** · [jjuradogarciadelrio.com](https://jjuradogarciadelrio.com)
