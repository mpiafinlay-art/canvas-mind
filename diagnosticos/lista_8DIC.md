# Lista de Cambios - 8 de Diciembre 2024 (Actualizado)

## 📝 Últimos Cambios

### Menú Format - Rediseño Compacto
- ✅ **Eliminados** cronómetro y temporizador del menú format
- ✅ **Eliminados** todos los separadores verticales innecesarios
- ✅ **Reducido** tamaño de todos los botones (más compacto)
- ✅ **Reducido** ancho del botón alinear
- ✅ **Nuevo orden**: Subrayar → Destacador → Pincel (color texto)
- ✅ Destacador siempre visible (antes solo aparecía con selección)

### Menú Principal
- ✅ **Eliminados** botones cronómetro y temporizador
- ✅ **Eliminado** botón exportar (ya está en menú "Más")
- ✅ Exportar tablero solo disponible en menú "Más"

---

## 🎤 Sistema de Dictado v2.0 (NUEVO)

### Implementación
- **Archivo principal**: `src/hooks/use-dictation.ts`
- **Helper de inserción**: `src/hooks/use-dictation-input.ts`
- **Funciones auxiliares**: `src/lib/dictation-helper.ts`

### Características
- ✅ Preview en tiempo real (gris) mientras el usuario habla
- ✅ Texto final (negro) al hacer pausa
- ✅ **Puntuación automática inteligente** para español:
  - Comandos de voz: "punto", "coma", "dos puntos", "signo de interrogación"
  - Comas automáticas antes de conjunciones (pero, aunque, porque, ya que)
  - Capitalización automática después de puntos
  - Detección de silencio (2.5 seg) añade punto automáticamente
- ✅ Auto-reinicio continuo sin interrupciones
- ✅ Soporte completo para español (es-ES)

### Control del usuario
- El botón se **enciende solo por el usuario** (click)
- Se **detiene solo por el usuario** (click)
- Al estar encendido, el botón cambia a **color rojo** con animación pulse

---

## 🎯 Menú Principal (tools-sidebar.tsx)

### Cambios
- ✅ **Borrar Tablero** movido dentro del menú desplegable de "Tableros"
- ✅ Añadido botón **Renombrar Tablero** (funcional)
- ✅ **Eliminar Tablero** ahora tiene confirmación con AlertDialog
- ✅ Eliminados botones duplicados (Dictar, Borrar Tablero)
- ✅ **Galería/Moodboard** como submenú del botón Imagen
- ✅ Botón **Dictar** en posición única con indicador rojo cuando activo

---

## 🛠️ Menú Format (formatting-toolbar.tsx)

### Cambios
- ❌ Eliminado botón **Lista de tareas**
- ✅ Añadido botón **Cronómetro** (Timer)
- ✅ Añadido botón **Temporizador** (Clock)
- ✅ Reducidos separadores sobrantes entre botones
- ✅ **Lienzo** reducido (400x510px, antes 794x1021px) y centrado en viewport
- ✅ Añadido botón **MapPin** (verde teal) para editar localizadores seleccionados

---

## ⏱️ Cronómetro (stopwatch-element.tsx) - REDISEÑADO

### Diseño nuevo
- ✅ Estilo moderno con gradiente oscuro (#1a1a2e → #16213e)
- ✅ **Arrastrable** por grip superior
- ✅ Botones más pequeños y redondeados
- ✅ Display limpio con fuente mono
- ✅ Centésimas de segundo en tamaño reducido
- ✅ Botón Play (verde) / Pause (ámbar)
- ✅ Botón Reset discreto

---

## ⏳ Temporizador (countdown-element.tsx) - REDISEÑADO

### Diseño nuevo
- ✅ Estilo moderno con gradiente oscuro (#0f172a → #1e293b)
- ✅ **Arrastrable** por grip superior
- ✅ Selector de tiempo compacto (1, 5, 10, 15, 20, 25, 30, 45, 60 min)
- ✅ Display grande y limpio
- ✅ Botón Play (cyan) / Pause (ámbar)
- ✅ **Alerta visual** cuando termina (gradiente rojo + pulse + icono campana)
- ✅ Auto-reset de alerta después de 5 segundos

---

## 🏷️ Tooltips Mejorados

### Cambios
- ✅ Más pequeños y compactos
- ✅ Fondo negro (bg-slate-900)
- ✅ Texto blanco
- ✅ Animaciones sutiles

---

## 📐 Reglas de Z-Index (Regla 44)

### Implementación en transformable-element.tsx
1. **Click en elemento** → Sube a zIndex 9999 temporalmente para editar
2. **Deseleccionar** → Vuelve a su zIndex original automáticamente
3. **Cuadernos y Lienzo** → NO suben de zIndex al hacer click (siempre en capa baja)
4. **Contenedores/Lienzo** → zIndex = 0 (capa más baja)
5. **Cuadernos** → zIndex = 5 (primera capa después del tablero)
6. **Elementos nuevos** → Aparecen en el centro del viewport con zIndex alto

---

## 🔐 Autenticación (page.jsx)

### Cambios
- ✅ Google Login usa **signInWithPopup** primero (más confiable)
- ✅ Fallback automático a **signInWithRedirect** si popup bloqueado
- ✅ Opciones completas: Google, Invitado, Email/Password, Crear cuenta

---

## 📁 Archivos Modificados

```
src/hooks/use-dictation.ts (NUEVO v2.0)
src/hooks/use-dictation-input.ts (NUEVO v2.0)
src/lib/dictation-helper.ts (NUEVO v2.0)
src/components/canvas/tools-sidebar.tsx
src/components/canvas/formatting-toolbar.tsx
src/components/canvas/transformable-element.tsx
src/components/canvas/elements/stopwatch-element.tsx (REDISEÑADO)
src/components/canvas/elements/countdown-element.tsx (REDISEÑADO)
src/components/ui/tooltip.tsx
src/app/page.jsx
src/app/board/[boardId]/BoardPageClient.tsx
```

---

## 🚀 Producción

**URL**: https://micerebro.vercel.app

---

*Última actualización: 8 de Diciembre 2024*
