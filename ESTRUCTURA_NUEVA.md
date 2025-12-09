# Nueva Estructura del Proyecto

## ✅ Estructura Implementada

```
root/
│
├── public/
│   ├── favicon.ico
│   └── assets/              # Imágenes estáticas
│
├── src/
│   ├── app/
│   │   ├── layout.js        # Layout raíz ✅
│   │   ├── page.js          # Home ✅
│   │   ├── login/
│   │   │   └── page.js      # Página de login ✅
│   │   ├── dashboard/
│   │   │   └── page.js      # Dashboard (redirige a board) ✅
│   │   └── board/
│   │       └── [boardId]/  # Páginas de tableros (existente)
│   │
│   ├── components/
│   │   ├── ui/              # Botones, inputs, componentes puros ✅
│   │   └── layout/          # Navbar, Footer (si aplica)
│   │
│   ├── lib/
│   │   ├── firebase.js      # Configuración Firebase Web (cliente) ✅
│   │   ├── auth.js          # Utilidades login, logout ✅
│   │   └── firestore.js     # CRUD abstraído ✅
│   │
│   ├── hooks/
│   │   └── useAuth.js       # Listener client-side ✅
│   │
│   ├── context/
│   │   └── AuthContext.jsx  # Contexto de autenticación ✅
│   │
│   ├── utils/
│   │   ├── constants.js     # Constantes ✅
│   │   ├── validators.js    # Validadores ✅
│   │   └── formatting.js    # Utilidades de formateo ✅
│   │
│   ├── styles/
│   │   └── globals.css      # Estilos globales ✅
│   │
│   └── types/               # (opcional) Definiciones TS/JSDoc
│
├── .env.local
├── firebase.json
├── next.config.js
├── package.json
└── README.md
```

## 📋 Archivos Creados

### Core Firebase
- ✅ `src/lib/firebase.js` - Configuración e inicialización de Firebase
- ✅ `src/lib/auth.js` - Funciones de autenticación (signInWithGoogle, signInAsGuest, etc.)
- ✅ `src/lib/firestore.js` - Funciones CRUD para Firestore

### Hooks y Context
- ✅ `src/hooks/useAuth.js` - Hook para escuchar cambios de autenticación
- ✅ `src/context/AuthContext.jsx` - Contexto de autenticación

### Utilidades
- ✅ `src/utils/constants.js` - Constantes de la aplicación
- ✅ `src/utils/validators.js` - Validadores de formularios
- ✅ `src/utils/formatting.js` - Utilidades de formateo

### Páginas
- ✅ `src/app/layout.js` - Layout raíz actualizado
- ✅ `src/app/page.js` - Home page
- ✅ `src/app/login/page.js` - Página de login
- ✅ `src/app/dashboard/page.js` - Dashboard (redirige a board)
- ✅ `src/app/home-page-content.jsx` - Contenido de la página de inicio (actualizado)

### Estilos
- ✅ `src/styles/globals.css` - Estilos globales movidos

## 🔄 Compatibilidad

Se mantienen archivos de compatibilidad para migración gradual:
- `src/firebase/provider.tsx` - Mantiene la estructura antigua
- `src/firebase/client-provider.tsx` - Mantiene la estructura antigua
- `src/firebase/auth.ts` - Mantiene la estructura antigua

Los archivos antiguos siguen funcionando mientras se migra gradualmente.

## 📝 Próximos Pasos

1. Migrar gradualmente los componentes que usan `@/firebase/provider` a `@/context/AuthContext`
2. Migrar gradualmente los componentes que usan `@/firebase/auth` a `@/lib/auth`
3. Actualizar imports en componentes de canvas para usar nuevas funciones de `@/lib/firestore`
4. Eliminar archivos de compatibilidad una vez completada la migración

## 🚀 Uso

### Autenticación
```javascript
import { useAuthContext } from '@/context/AuthContext';
import { signInWithGoogle, signInAsGuest, signOut } from '@/lib/auth';

// En componente
const { user, loading } = useAuthContext();
await signInWithGoogle();
```

### Firestore
```javascript
import { ensureUserDocument, getLatestBoard, createBoard } from '@/lib/firestore';

// Asegurar documento de usuario
await ensureUserDocument(user);

// Obtener tablero más reciente
const board = await getLatestBoard(userId);

// Crear nuevo tablero
const boardId = await createBoard(userId, 'Nombre del Tablero');
```

### Firebase
```javascript
import { auth, db, storage } from '@/lib/firebase';

// Usar directamente las instancias
```

