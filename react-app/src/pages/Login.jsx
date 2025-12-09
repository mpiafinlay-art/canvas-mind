// Página de Login
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle, loginAsGuest, loginWithEmail, signupWithEmail } from '../services/authService';
import { ensureUserDocument, getUserBoards, createBoard } from '../services/dataService';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSuccess = async (user) => {
    try {
      // Crear documento de usuario si no existe
      await ensureUserDocument(user);
      
      // Buscar tableros existentes
      const boards = await getUserBoards(user.uid);
      
      let boardId;
      if (boards.length > 0) {
        boardId = boards[0].id;
      } else {
        // Crear primer tablero
        boardId = await createBoard(user.uid);
      }
      
      // Redirigir al tablero
      navigate(`/board/${boardId}`);
    } catch (err) {
      console.error('Error post-login:', err);
      setError('Error al cargar tu tablero');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const result = await loginWithGoogle();
    if (result.success) {
      await handleLoginSuccess(result.user);
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null);
    const result = await loginAsGuest();
    if (result.success) {
      await handleLoginSuccess(result.user);
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const result = isSignup 
      ? await signupWithEmail(email, password)
      : await loginWithEmail(email, password);
    
    if (result.success) {
      await handleLoginSuccess(result.user);
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center">
        <div className="loader"></div>
        <p className="mt-4 text-lg font-semibold text-slate-900">Cargando tu tablero...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
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

        {/* Card de login */}
        <div className="card">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!showEmailForm ? (
            <div className="space-y-4">
              <button onClick={handleGoogleLogin} className="btn-primary w-full flex items-center justify-center gap-2">
                <img src="/assets/google-logo.svg" alt="Google" width={20} height={20} />
                Iniciar con Google
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400">O continúa como</span>
                </div>
              </div>

              <button onClick={handleGuestLogin} className="btn-secondary w-full flex items-center justify-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Invitado
              </button>

              <div className="mt-6 text-center space-x-2">
                <button 
                  onClick={() => { setShowEmailForm(true); setIsSignup(false); }}
                  className="text-blue-600 hover:text-blue-700 underline text-sm"
                >
                  Log in
                </button>
                <span className="text-slate-400">/</span>
                <button 
                  onClick={() => { setShowEmailForm(true); setIsSignup(true); }}
                  className="text-blue-600 hover:text-blue-700 underline text-sm"
                >
                  Crear Cuenta
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <h2 className="text-xl font-semibold text-center mb-4">
                {isSignup ? 'Crear Cuenta' : 'Iniciar Sesión'}
              </h2>
              
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
              />
              
              <button type="submit" className="btn-primary w-full">
                {isSignup ? 'Crear Cuenta' : 'Entrar'}
              </button>
              
              <button 
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="w-full text-slate-500 hover:text-slate-700 text-sm"
              >
                ← Volver
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
