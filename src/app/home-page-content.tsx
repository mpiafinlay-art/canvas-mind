/**
 * HomePageContent - Versión FUNCIONAL
 * FLUJO: Login -> Buscar/Crear tablero -> Redirigir
 */

'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useFirestore, useUser, useAuth } from '@/firebase/provider';
import {
  collection,
  query,
  getDocs,
  addDoc,
  serverTimestamp,
  limit,
  orderBy,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { Loader2, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { signInWithGoogle, signInAsGuest, signInWithEmail, createUserWithEmail } from '@/firebase/auth';
import { Button } from '@/components/ui/button';
import EmailAuthDialog from '@/components/auth/email-auth-dialog';

export default function HomePageContent() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const [emailAuthDialogOpen, setEmailAuthDialogOpen] = useState(false);
  const [emailAuthMode, setEmailAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Flag para evitar procesamiento múltiple
  const hasProcessedRef = useRef(false);

  // Debug: verificar estado de auth
  useEffect(() => {
    console.log('🔍 Estado auth:', { auth: !!auth, firestore: !!firestore, user: !!user, isUserLoading });
  }, [auth, firestore, user, isUserLoading]);

  // Función para redirigir al tablero
  const redirectToBoard = useCallback(async (userToProcess: User) => {
    if (hasProcessedRef.current || isRedirecting || !firestore) return;
    
    hasProcessedRef.current = true;
    setIsRedirecting(true);
    
    try {
      // Asegurar documento de usuario
      const userDocRef = doc(firestore, 'users', userToProcess.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: userToProcess.uid,
          email: userToProcess.email,
          displayName: userToProcess.displayName || 'Invitado',
          createdAt: serverTimestamp(),
        });
      }

      // Buscar tablero existente
      const boardsCollection = collection(firestore, 'users', userToProcess.uid, 'canvasBoards');
      let boardId: string | null = null;
      
      try {
        const q = query(boardsCollection, orderBy('updatedAt', 'desc'), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          boardId = snapshot.docs[0].id;
        }
      } catch {
        // Si falla orderBy, buscar sin orden
        const snapshot = await getDocs(boardsCollection);
        if (!snapshot.empty) {
          boardId = snapshot.docs[0].id;
        }
      }

      // Si no hay tablero, crear uno
      if (!boardId) {
        const newBoard = await addDoc(boardsCollection, {
          name: 'Mi Primer Tablero',
          userId: userToProcess.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        boardId = newBoard.id;
        toast({ title: '¡Bienvenido!', description: 'Hemos creado tu primer tablero.' });
      }

      // Guardar flags y redirigir
      sessionStorage.setItem('hasRecentLogin', 'true');
      sessionStorage.setItem('loginTimestamp', Date.now().toString());
      
      console.log('🚀 Redirigiendo a:', `/board/${boardId}/`);
      window.location.href = `/board/${boardId}/`;
      
    } catch (error) {
      console.error('Error:', error);
      hasProcessedRef.current = false;
      setIsRedirecting(false);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar el tablero.' });
    }
  }, [firestore, isRedirecting, toast]);

  // Procesar usuario cuando esté disponible (después de login)
  useEffect(() => {
    if (user && !isUserLoading && !hasProcessedRef.current && !isRedirecting) {
      // Solo redirigir si el usuario hizo login explícito
      const hasRecentLogin = sessionStorage.getItem('hasRecentLogin') === 'true';
      const timestamp = sessionStorage.getItem('loginTimestamp');
      const isRecent = timestamp && (Date.now() - parseInt(timestamp)) < 30000;
      
      if (hasRecentLogin && isRecent) {
        redirectToBoard(user);
      }
    }
  }, [user, isUserLoading, isRedirecting, redirectToBoard]);

  // Handler de login con Google
  const handleGoogleLogin = useCallback(async () => {
    if (isLoggingIn) return;
    
    if (!auth) {
      toast({ variant: 'destructive', title: 'Cargando...', description: 'Espera un momento mientras se inicializa.' });
      return;
    }
    
    setIsLoggingIn(true);
    hasProcessedRef.current = false;
    
    // Marcar login ANTES de iniciar
    sessionStorage.setItem('hasRecentLogin', 'true');
    sessionStorage.setItem('loginTimestamp', Date.now().toString());
    
    try {
      console.log('🔄 Iniciando login Google...');
      const result = await signInWithGoogle(auth);
      console.log('✅ Login exitoso:', result?.user?.email);
      if (result?.user && firestore) {
        await redirectToBoard(result.user);
      }
    } catch (error: any) {
      console.error('❌ Error login Google:', error);
      sessionStorage.removeItem('hasRecentLogin');
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Error al iniciar sesión.' });
    } finally {
      setIsLoggingIn(false);
    }
  }, [auth, firestore, isLoggingIn, redirectToBoard, toast]);

  // Handler de login como invitado
  const handleGuestLogin = useCallback(async () => {
    if (isLoggingIn) return;
    
    if (!auth) {
      toast({ variant: 'destructive', title: 'Cargando...', description: 'Espera un momento mientras se inicializa.' });
      return;
    }
    
    setIsLoggingIn(true);
    hasProcessedRef.current = false;
    
    sessionStorage.setItem('hasRecentLogin', 'true');
    sessionStorage.setItem('loginTimestamp', Date.now().toString());
    
    try {
      console.log('🔄 Iniciando login invitado...');
      const result = await signInAsGuest(auth);
      console.log('✅ Login invitado exitoso');
      if (result?.user && firestore) {
        await redirectToBoard(result.user);
      }
    } catch (error: any) {
      console.error('❌ Error login invitado:', error);
      sessionStorage.removeItem('hasRecentLogin');
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Error al iniciar sesión.' });
    } finally {
      setIsLoggingIn(false);
    }
  }, [auth, firestore, isLoggingIn, redirectToBoard, toast]);

  // Handler de login con email
  const handleEmailAuth = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error('Auth no disponible');
    
    hasProcessedRef.current = false;
    
    sessionStorage.setItem('hasRecentLogin', 'true');
    sessionStorage.setItem('loginTimestamp', Date.now().toString());
    
    try {
      const result = emailAuthMode === 'login' 
        ? await signInWithEmail(auth, email, password)
        : await createUserWithEmail(auth, email, password);
      
      if (result?.user && firestore) {
        await redirectToBoard(result.user);
      }
    } catch (error: any) {
      sessionStorage.removeItem('hasRecentLogin');
      throw error;
    }
  }, [auth, firestore, emailAuthMode, redirectToBoard]);

  // Loading mientras Firebase se inicializa
  const isFirebaseLoading = !auth || !firestore;

  // Mostrar loading si está redirigiendo
  if (isRedirecting || (isLoggingIn && hasProcessedRef.current)) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center" style={{ backgroundColor: '#96e4e6' }}>
        <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
        <p className="mt-4 text-lg font-semibold text-slate-900">Cargando tu tablero...</p>
      </div>
    );
  }

  // Página de login
  return (
    <>
      <div className="min-h-screen w-full flex flex-col items-center justify-center" style={{ backgroundColor: '#96e4e6' }}>
        <div className="w-full max-w-md px-6">
          {/* Logo */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="h-16 w-16 bg-black rounded-full flex items-center justify-center mb-4 shadow-lg">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00ffaa" />
                    <stop offset="50%" stopColor="#00d4ff" />
                    <stop offset="100%" stopColor="#0066ff" />
                  </linearGradient>
                </defs>
                <path d="M6 18C6 14 8 12 12 12C14 12 16 13 18 14C20 15 22 16 24 16C26 16 28 15 30 14C32 13 34 14 34 18C34 22 32 24 30 24C28 24 26 23 24 22C22 21 20 20 18 20C16 20 14 21 12 22C10 23 8 22 6 18Z" fill="url(#logoGradient)"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Mi cerebro</h1>
            <p className="text-slate-500 text-lg">Tu lienzo de ideas infinitas.</p>
          </div>

          {/* Tarjeta Login */}
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            {isFirebaseLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                <p className="mt-4 text-slate-500">Inicializando...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Button 
                  onClick={handleGoogleLogin} 
                  disabled={isLoggingIn} 
                  size="lg" 
                  className="w-full"
                  type="button"
                >
                  {isLoggingIn ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : (
                    <img src="/google-logo.svg" alt="Google" width={20} height={20} className="mr-2" />
                  )}
                  {isLoggingIn ? 'Iniciando...' : 'Iniciar con Google'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-400">O continúa como</span>
                  </div>
                </div>

                <Button 
                  onClick={handleGuestLogin} 
                  disabled={isLoggingIn} 
                  size="lg" 
                  variant="default" 
                  className="w-full bg-[#16b5a8] hover:bg-[#139c91] text-white"
                  type="button"
                >
                  {isLoggingIn ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <UserIcon className="h-5 w-5 mr-2" />}
                  {isLoggingIn ? 'Iniciando...' : 'Invitado'}
                </Button>
              </div>
            )}

            <div className="mt-6 text-center space-x-2">
              <button 
                onClick={() => { setEmailAuthMode('login'); setEmailAuthDialogOpen(true); }}
                className="text-blue-600 hover:text-blue-700 underline text-sm"
                type="button"
                disabled={isFirebaseLoading}
              >
                Log in
              </button>
              <span className="text-slate-400">/</span>
              <button 
                onClick={() => { setEmailAuthMode('signup'); setEmailAuthDialogOpen(true); }}
                className="text-blue-600 hover:text-blue-700 underline text-sm"
                type="button"
                disabled={isFirebaseLoading}
              >
                Crear Cuenta
              </button>
            </div>
          </div>
        </div>
      </div>

      <EmailAuthDialog
        isOpen={emailAuthDialogOpen}
        onOpenChange={setEmailAuthDialogOpen}
        mode={emailAuthMode}
        onAuth={handleEmailAuth}
      />
    </>
  );
}
