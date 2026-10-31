# Plan de Optimización de Rendimiento (100% Idéntico Visualmente)

## Causa Raíz de la Lentitud
1. **Canvas de Partículas (`src/components/WaterCausticsCanvas.tsx`)**:
   - En cada fotograma (`60 FPS`), el bucle dibuja 45 partículas aplicando `ctx.shadowBlur = 6` individualmente dentro del ciclo. En HTML5 Canvas 2D, `shadowBlur` ejecuta un desenfoque gaussiano por software en cada partícula (2,700 operaciones de blur por segundo en un lienzo de pantalla completa).
2. **Reflow / Layout Thrashing en Mousemove (`src/App.tsx`)**:
   - Un listener global de `mousemove` ejecuta `document.querySelectorAll('.bento-card')` y `card.getBoundingClientRect()` en cada píxel de movimiento del cursor sin limitación (`requestAnimationFrame`), forzando recálculos de layout constantes.
3. **Renderizado Continuo WebGL y Normales de Agua (`src/components/DigitalTwin3D.tsx`)**:
   - El motor Three.js sigue renderizando a 60 FPS y recalculando `waterSurfaceGeo.computeVertexNormals()` sobre miles de vértices incluso cuando la sección `#gemelo-3d` no está visible en pantalla durante el scroll.

---

## Cambios Propuestos (Cero Cambios Visuales)

### 1. Pre-renderizado de Sprites en Caché (`src/components/WaterCausticsCanvas.tsx`)
- **Qué haremos**: Al inicializar cada partícula, pre-renderizaremos su círculo con su radio exacto, color (`#00E5FF` o `#32CD32`) y resplandor (`shadowBlur = 6`) en un pequeño `<canvas>` offscreen en memoria.
- **En el bucle de animación**: Reemplazaremos `ctx.arc` + `ctx.shadowBlur` + `ctx.fill` por `ctx.drawImage(particle.sprite, ...)` usando `ctx.globalAlpha`.
- **Resultado**: Apariencia **100% idéntica píxel por píxel** (mismo tamaño, brillo, opacidad, cantidad y movimiento) eliminando por completo el cálculo de desenfoque en tiempo real (~20x más rápido).

### 2. Optimización de Eventos de Cursor (`src/App.tsx`)
- **Qué haremos**: Procesaremos el seguimiento de tarjetas `.bento-card` dentro de un único `requestAnimationFrame` pasivo y sólo sobre la tarjeta bajo el cursor (`e.target.closest('.bento-card')`), evitando `querySelectorAll` y `getBoundingClientRect()` masivos en cada movimiento del mouse.

### 3. Pausa Inteligente Fuera de Pantalla y Optimización en 3D (`src/components/DigitalTwin3D.tsx`)
- **Qué haremos**:
  - Añadiremos un `IntersectionObserver` al contenedor del canvas 3D para pausar automáticamente el bucle `requestAnimationFrame` de WebGL cuando el usuario hace scroll fuera de la sección `#gemelo-3d`, liberando la GPU y CPU para el resto de la página.
  - Reduciremos la frecuencia de recálculo de `computeVertexNormals()` de la malla de agua para mantener la misma fluidez e iluminación especular con una fracción del costo de CPU.
