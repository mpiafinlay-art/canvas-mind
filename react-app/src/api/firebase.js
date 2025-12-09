// Firebase configuration - Solo inicialización
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDnDsbb2jVLZmgpfkrpdzA6yTFRpPo2f9c",
  authDomain: "canvasmind-app.firebaseapp.com",
  projectId: "canvasmind-app",
  storageBucket: "canvasmind-app.firebasestorage.app",
  messagingSenderId: "917199598510",
  appId: "1:917199598510:web:73840729e1333a07804e3f"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
