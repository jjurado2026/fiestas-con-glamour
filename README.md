# Fiestas con Glamour — Propuesta de nueva homepage

Prototipo de homepage para **Fiestas con Glamour**, empresa de organización de fiestas privadas y eventos de empresa en Madrid (c/ Orense 37). Sustituye a su web actual, un WordPress con el tema Chameleon sin tocar desde 2014.

**Qué es:** su home —sus bloques, en su orden, con sus textos y sus fotos— rehecha con los colores de su propio tema (petróleo, turquesa y magenta). Los bloques nuevos (catálogo, quiénes somos, contacto) se construyen solo con textos de sus propias páginas.

**Dirección estética:** *"Photocall"* — el photocall es uno de sus servicios y el gesto universal del glamour. La home usa su gramática: su logo repetido como pared de photocall, dos tiras de fotomatón en el hero cuyas tomas se disparan con un flash, y una pared de copias colgadas con cinta para las ideas originales. Resuelve de paso el problema de sus fotos, que miden 300–400 px: no aguantan una foto a sangre, pero sí una toma de fotomatón. Bodoni Moda + Onest.

**Lo más útil:** sus **77 páginas de servicio**, que hoy viven en un desplegable de cuatro niveles solo usable con ratón, pasan a un catálogo con pestañas y **buscador sin tildes** ("comunion", "jamon", "payaso"), y a un mega-menú construido desde ese mismo catálogo.

- Capturas sin animaciones: añadir `?ss` a la URL.
- Estados para revisar: `&tab=infantiles`, `&q=payaso`, `&menu=celebraciones`, `&movil`.

## Stack
HTML, CSS y JavaScript puro. Cero dependencias, cero build. Fuentes variables autoalojadas (Bodoni Moda + Onest, 134 KB) e imágenes del cliente reconvertidas a WebP (900 KB). Todo el catálogo está en el HTML: sin JS se ve completo.

## Estructura
```
prototype/          Prototipo navegable (se publica en gh-pages con git subtree)
  index.html
  assets/css/       global.css · home.css
  assets/js/        main.js
  assets/fonts/     bodoni-moda · bodoni-moda-italic · onest (woff2, latino)
  assets/img/       fotos del cliente en WebP, logo limpiado y pared de photocall
_interno/           Auditoría, competencia, brief, copy, plan y propuesta (no se publica)
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
