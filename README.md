# Anotador de cartas

Micro-app web (zero-build) para llevar el puntaje de juegos de cartas y dados:
**Truco** (con los clásicos cuadrados de fósforos), **Continental**, **Tute**, **Chinchón**,
**10.000** y un **contador libre**. Marca quién va ganando en vivo, avisa al llegar al objetivo o
pasarse del límite, guarda la partida y funciona sin conexión. Sin registro.

**Live:** https://sebiglesias.com.ar/contador/

Cada modo define su lógica (dirección del puntero, objetivo/límite, botones de suma). El Truco
dibuja el puntaje como cuadrados de fósforos (5 = 4 lados + diagonal) con separador malas | buenas.

## Correr local
Servir la carpeta (p. ej. `python3 -m http.server`) y abrir. Sin build ni dependencias.

## Diseño
Sistema de diseño de la familia de micro-apps (Bricolage Grotesque + JetBrains Mono, lienzo tinta
cálida + acento verde paño, grid de papel). Anti-slop.

## Autor
[Sebastian Iglesias](https://github.com/sebiglesias) · MIT
