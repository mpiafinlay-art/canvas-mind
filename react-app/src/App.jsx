// App principal
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthContext();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center">
        <div className="loader"></div>
        <p className="mt-4 text-lg font-semibold text-slate-900">Cargando...</p>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Componente para redirigir si ya está logueado
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuthContext();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }
  
  // Si ya está logueado, no redirigir automáticamente
  // El usuario debe hacer login explícito para ir al tablero
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/board/:boardId" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
