// Servicios de datos (Firestore)
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '../api/firebase';

// Crear documento de usuario si no existe
export const ensureUserDocument = async (user) => {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || 'Invitado',
      createdAt: serverTimestamp()
    });
  }
  return userRef;
};

// Obtener tableros del usuario
export const getUserBoards = async (userId) => {
  try {
    const boardsRef = collection(db, 'users', userId, 'canvasBoards');
    const q = query(boardsRef, orderBy('updatedAt', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    // Si falla orderBy (índice no existe), intentar sin orden
    const boardsRef = collection(db, 'users', userId, 'canvasBoards');
    const snapshot = await getDocs(boardsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

// Crear nuevo tablero
export const createBoard = async (userId, name = 'Mi Primer Tablero') => {
  const boardsRef = collection(db, 'users', userId, 'canvasBoards');
  const newBoard = await addDoc(boardsRef, {
    name,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return newBoard.id;
};

// Obtener tablero por ID
export const getBoard = async (userId, boardId) => {
  const boardRef = doc(db, 'users', userId, 'canvasBoards', boardId);
  const boardDoc = await getDoc(boardRef);
  if (!boardDoc.exists()) return null;
  return { id: boardDoc.id, ...boardDoc.data() };
};

// Obtener elementos de un tablero
export const getBoardElements = async (userId, boardId) => {
  const elementsRef = collection(db, 'users', userId, 'canvasBoards', boardId, 'canvasElements');
  const snapshot = await getDocs(elementsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Añadir elemento a tablero
export const addElement = async (userId, boardId, element) => {
  const elementsRef = collection(db, 'users', userId, 'canvasBoards', boardId, 'canvasElements');
  const newElement = await addDoc(elementsRef, {
    ...element,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return newElement.id;
};

// Actualizar elemento
export const updateElement = async (userId, boardId, elementId, updates) => {
  const elementRef = doc(db, 'users', userId, 'canvasBoards', boardId, 'canvasElements', elementId);
  await updateDoc(elementRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

// Eliminar elemento
export const deleteElement = async (userId, boardId, elementId) => {
  const elementRef = doc(db, 'users', userId, 'canvasBoards', boardId, 'canvasElements', elementId);
  await deleteDoc(elementRef);
};
