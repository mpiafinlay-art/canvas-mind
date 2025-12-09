// Servicios de autenticación
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { auth } from '../api/firebase';

const googleProvider = new GoogleAuthProvider();

// Login con Google
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Error login Google:', error);
    return { success: false, error: error.message };
  }
};

// Login como invitado
export const loginAsGuest = async () => {
  try {
    const result = await signInAnonymously(auth);
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Error login invitado:', error);
    return { success: false, error: error.message };
  }
};

// Login con email
export const loginWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Error login email:', error);
    return { success: false, error: error.message };
  }
};

// Crear cuenta con email
export const signupWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Error signup:', error);
    return { success: false, error: error.message };
  }
};

// Cerrar sesión
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error logout:', error);
    return { success: false, error: error.message };
  }
};
