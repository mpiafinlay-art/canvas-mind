// Página del Tablero (Dashboard)
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { getBoard, getBoardElements, addElement, updateElement, deleteElement } from '../services/dataService';
import { logout } from '../services/authService';

const Dashboard = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthContext();
  
  const [board, setBoard] = useState(null);
  const [elements, setElements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar autenticación
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // Cargar tablero
  useEffect(() => {
    const loadBoard = async () => {
      if (!user || !boardId) return;
      
      try {
        setLoading(true);
        const boardData = await getBoard(user.uid, boardId);
        
        if (!boardData) {
          setError('Tablero no encontrado');
          return;
        }
        
        setBoard(boardData);
        
        const elementsData = await getBoardElements(user.uid, boardId);
        setElements(elementsData);
      } catch (err) {
        console.error('Error cargando tablero:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBoard();
  }, [user, boardId]);

  const handleAddNote = async () => {
    if (!user || !boardId) return;
    
    const newElement = {
      type: 'note',
      content: { text: 'Nueva nota' },
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      size: { width: 200, height: 150 },
      zIndex: elements.length + 1
    };
    
    try {
      const elementId = await addElement(user.uid, boardId, newElement);
      setElements([...elements, { id: elementId, ...newElement }]);
    } catch (err) {
      console.error('Error añadiendo nota:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center">
        <div className="loader"></div>
        <p className="mt-4 text-lg font-semibold text-slate-900">Cargando tablero...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-black rounded-full flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 36 36" fill="none">
              <defs>
                <linearGradient id="headerLogo" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00ffaa" />
                  <stop offset="50%" stopColor="#00d4ff" />
                  <stop offset="100%" stopColor="#0066ff" />
                </linearGradient>
              </defs>
              <path d="M6 18C6 14 8 12 12 12C14 12 16 13 18 14C20 15 22 16 24 16C26 16 28 15 30 14C32 13 34 14 34 18C34 22 32 24 30 24C28 24 26 23 24 22C22 21 20 20 18 20C16 20 14 21 12 22C10 23 8 22 6 18Z" fill="url(#headerLogo)"/>
            </svg>
          </div>
          <h1 className="font-semibold text-slate-900">{board?.name || 'Mi Tablero'}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={handleAddNote} className="px-3 py-1.5 bg-[#16b5a8] text-white rounded-lg text-sm font-medium hover:bg-[#139c91] transition-colors">
            + Nota
          </button>
          <button onClick={handleLogout} className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors">
            Salir
          </button>
        </div>
      </header>

      {/* Canvas */}
      <main className="pt-16 min-h-screen relative">
        {elements.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
            <p className="text-slate-600 mb-4">Tu tablero está vacío</p>
            <button onClick={handleAddNote} className="btn-secondary">
              Crear primera nota
            </button>
          </div>
        ) : (
          <div className="relative w-full h-[calc(100vh-64px)] overflow-auto">
            {elements.map((element) => (
              <div
                key={element.id}
                className="absolute bg-yellow-100 p-4 rounded-lg shadow-md border border-yellow-200 cursor-move"
                style={{
                  left: element.position?.x || 100,
                  top: element.position?.y || 100,
                  width: element.size?.width || 200,
                  minHeight: element.size?.height || 150,
                  zIndex: element.zIndex || 1
                }}
              >
                <p className="text-slate-800">{element.content?.text || 'Nota'}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
