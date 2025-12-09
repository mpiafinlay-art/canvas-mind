#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando post-build para Firebase Hosting (SPA Mode)...\n');

// Función para copiar directorios recursivamente
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Directorio de salida para Firebase Hosting
const outDir = path.join(__dirname, '..', 'out');

// Limpiar y crear directorio out/
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true });
  console.log('🗑️  Carpeta out/ anterior eliminada');
}
fs.mkdirSync(outDir, { recursive: true });
console.log('📁 Carpeta out/ creada');

// 1. Copiar archivos estáticos de .next/static a out/_next/static
const staticSrc = path.join(__dirname, '..', '.next', 'static');
const staticDest = path.join(outDir, '_next', 'static');

if (fs.existsSync(staticSrc)) {
  copyDir(staticSrc, staticDest);
  console.log('✅ Archivos estáticos copiados a out/_next/static/');
} else {
  console.error('❌ ERROR: No se encontró .next/static/');
  process.exit(1);
}

// 2. Copiar archivos de public/ a out/
const publicSrc = path.join(__dirname, '..', 'public');
if (fs.existsSync(publicSrc)) {
  const publicEntries = fs.readdirSync(publicSrc);
  for (const entry of publicEntries) {
    const srcPath = path.join(publicSrc, entry);
    const destPath = path.join(outDir, entry);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
  console.log('✅ Archivos de public/ copiados a out/');
}

// 3. Copiar archivos adicionales de _Public/ (si existe)
const publicSrc2 = path.join(__dirname, '..', '_Public');
if (fs.existsSync(publicSrc2)) {
  const entries = fs.readdirSync(publicSrc2);
  for (const entry of entries) {
    if (entry === 'index.html' || entry.endsWith('.backup') || entry.endsWith('.firebase-backup')) {
      continue;
    }
    const srcPath = path.join(publicSrc2, entry);
    const destPath = path.join(outDir, entry);
    
    if (!fs.existsSync(destPath)) {
      if (fs.statSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
  console.log('✅ Archivos adicionales de _Public/ copiados');
}

// 4. Obtener CSS
const cssDir = path.join(__dirname, '..', '.next', 'static', 'css');
const cssFiles = [];
if (fs.existsSync(cssDir)) {
  fs.readdirSync(cssDir).forEach(f => {
    if (f.endsWith('.css')) cssFiles.push(f);
  });
}

// 5. Obtener buildId
const buildIdPath = path.join(__dirname, '..', '.next', 'BUILD_ID');
const buildId = fs.existsSync(buildIdPath) ? fs.readFileSync(buildIdPath, 'utf8').trim() : 'development';

// 6. Obtener chunks
const chunksDir = path.join(__dirname, '..', '.next', 'static', 'chunks');
const allChunks = [];

function collectChunks(dir, prefix = '') {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (item.isDirectory()) {
      collectChunks(path.join(dir, item.name), `${prefix}${item.name}/`);
    } else if (item.name.endsWith('.js')) {
      allChunks.push(`${prefix}${item.name}`);
    }
  }
}
collectChunks(chunksDir);

// Identificar chunks importantes
const webpackChunk = allChunks.find(c => c.startsWith('webpack-'));
const mainAppChunk = allChunks.find(c => c.startsWith('main-app-'));
const polyfillsChunk = allChunks.find(c => c.startsWith('polyfills-'));

// Chunks numéricos (shared)
const numericChunks = allChunks.filter(c => c.match(/^\d+-[a-f0-9]+\.js$/)).sort();
// Chunks de vendor (hash-hash)
const vendorChunks = allChunks.filter(c => c.match(/^[a-f0-9]+-[a-f0-9]+\.js$/) && !c.startsWith('webpack'));

console.log('\n📦 Chunks identificados:');
console.log(`   webpack: ${webpackChunk}`);
console.log(`   main-app: ${mainAppChunk}`);
console.log(`   polyfills: ${polyfillsChunk}`);
console.log(`   numeric chunks: ${numericChunks.length}`);
console.log(`   vendor chunks: ${vendorChunks.length}`);

// CSS links
const cssLinks = cssFiles.map(css => 
  `<link rel="stylesheet" href="/_next/static/css/${css}" />`
).join('\n    ');

// Scripts en orden correcto para SPA
const scripts = [];

// Webpack runtime primero (crítico)
if (webpackChunk) {
  scripts.push(`<script src="/_next/static/chunks/${webpackChunk}"></script>`);
}

// Polyfills
if (polyfillsChunk) {
  scripts.push(`<script src="/_next/static/chunks/${polyfillsChunk}" nomodule></script>`);
}

// Vendor chunks
vendorChunks.forEach(c => {
  scripts.push(`<script src="/_next/static/chunks/${c}" async></script>`);
});

// Numeric/shared chunks
numericChunks.forEach(c => {
  scripts.push(`<script src="/_next/static/chunks/${c}" async></script>`);
});

// Main app chunk
if (mainAppChunk) {
  scripts.push(`<script src="/_next/static/chunks/${mainAppChunk}" async></script>`);
}

// 7. Crear index.html para SPA
const indexHtml = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Mi cerebro - Tu lienzo de ideas infinitas</title>
    <meta name="description" content="Crea, organiza y comparte tus ideas en un canvas infinito." />
    <link rel="icon" href="/canvas_mind.svg" type="image/svg+xml" />
    ${cssLinks}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&family=The+Girl+Next+Door&display=swap" rel="stylesheet" />
    <style>
      /* Loading spinner mientras carga la app */
      .spa-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        width: 100%;
        background-color: #96e4e6;
        font-family: 'Poppins', sans-serif;
      }
      .spa-spinner {
        width: 48px;
        height: 48px;
        border: 4px solid #1e293b;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      .spa-text {
        margin-top: 16px;
        color: #475569;
        font-size: 16px;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
</head>
<body style="margin: 0; padding: 0;">
    <div id="__next">
        <div class="spa-loading">
            <div class="spa-spinner"></div>
            <p class="spa-text">Cargando Mi Cerebro...</p>
        </div>
    </div>
    
    ${scripts.join('\n    ')}
    
    <script>
        // Inicialización para Next.js SPA mode
        (function() {
            // Next.js flight data initialization
            self.__next_f = self.__next_f || [];
            self.__next_f.push([0]);
            self.__next_f.push([2, null]);
        })();
    </script>
</body>
</html>`;

// Guardar index.html
const indexPath = path.join(outDir, 'index.html');
fs.writeFileSync(indexPath, indexHtml);
console.log('\n✅ index.html creado para SPA');

// 8. Crear 404.html (copia de index.html para SPA fallback)
fs.copyFileSync(indexPath, path.join(outDir, '404.html'));
console.log('✅ 404.html creado (SPA fallback)');

// Mostrar contenido final
console.log('\n📁 Contenido de out/:');
const items = fs.readdirSync(outDir);
items.forEach(item => {
  const itemPath = path.join(outDir, item);
  const isDir = fs.statSync(itemPath).isDirectory();
  console.log(`   ${isDir ? '📂' : '📄'} ${item}`);
});

console.log('\n✅ Post-build completado exitosamente');
console.log('🚀 Ejecuta: firebase deploy --only hosting:app-micerebro');
