'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Loader2 } from 'lucide-react';

// Hooks y Contextos
import { useUser, useStorage } from '@/firebase/provider';
import { useBoardStore } from '@/lib/store/boardStore';
import { useBoardState } from '@/hooks/use-board-state';
import { useElementManager } from '@/hooks/use-element-manager';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useToast } from '@/hooks/use-toast';

// Utilidades y Tipos
import { uploadFile } from '@/lib/upload-helper';
import { WithId, CanvasElement, Board } from '@/lib/types';
import html2canvas from 'html2canvas';

// Componentes del Canvas
import Canvas from '@/components/canvas/canvas';
import ToolsSidebar from '@/components/canvas/tools-sidebar';
import FormattingToolbar from '@/components/canvas/formatting-toolbar';

// Diálogos
import AddImageFromUrlDialog from '@/components/canvas/elements/add-image-from-url-dialog';
import ChangeFormatDialog from '@/components/canvas/change-format-dialog';
import EditCommentDialog from '@/components/canvas/elements/edit-comment-dialog';
import ElementInfoPanel from '@/components/canvas/element-info-panel';
import RenameBoardDialog from '@/components/canvas/rename-board-dialog';
import BoardTitleDisplay from '@/components/canvas/board-title-display';

// Hook de dictado
import { useDictation } from '@/hooks/use-dictation';

interface BoardPageClientProps {
  boardId: string;
}

export default function BoardPageClient({ boardId }: BoardPageClientProps) {
  const { user, isUserLoading: authLoading } = useUser();
  const storage = useStorage();
  const { toast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [shouldRedirectToLogin, setShouldRedirectToLogin] = useState(false);

  // CRÍTICO: Verificar autenticación y redirigir si no hay usuario
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      console.log('❌ No hay usuario, redirigiendo a login...');
      setShouldRedirectToLogin(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }
  }, [user, authLoading]);
  
  // Refs para funciones de Zustand
  const loadBoardRef = useRef<any>(null);
  const createBoardRef = useRef<any>(null);
  const cleanupRef = useRef<any>(null);

  // Estado global del tablero (Zustand)
  const {
    elements,
    board,
    loadBoard,
    createBoard,
    updateElement,
    deleteElement,
    selectedElementIds,
    setSelectedElementIds,
    isLoading: isBoardLoading,
    error,
    cleanup,
  } = useBoardStore();
  
  useEffect(() => {
    loadBoardRef.current = loadBoard;
    createBoardRef.current = createBoard;
    cleanupRef.current = cleanup;
  }, [loadBoard, createBoard, cleanup]);

  // Estado local
  const { boards, handleRenameBoard, handleDeleteBoard, clearCanvas } = useBoardState(boardId);
  const canvasRef = useRef<any>(null);
  
  // Estados de UI
  const [isFormatToolbarOpen, setIsFormatToolbarOpen] = useState(true);
  const [isImageUrlDialogOpen, setIsImageUrlDialogOpen] = useState(false);
  const [changeFormatDialogOpen, setChangeFormatDialogOpen] = useState(false);
  const [isPanningActive, setIsPanningActive] = useState(false);
  const [isRenameBoardDialogOpen, setIsRenameBoardDialogOpen] = useState(false);
  
  // Estados de Selección
  const [selectedElement, setSelectedElement] = useState<WithId<CanvasElement> | null>(null);
  const [activatedElementId, setActivatedElementId] = useState<string | null>(null);
  const [selectedNotepadForFormat, setSelectedNotepadForFormat] = useState<WithId<CanvasElement> | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isEditCommentDialogOpen, setIsEditCommentDialogOpen] = useState(false);
  const [selectedCommentForEdit, setSelectedCommentForEdit] = useState<WithId<CanvasElement> | null>(null);
  const [isInfoPanelVisible, setIsInfoPanelVisible] = useState(false);

  // Dictado
  const {
    isListening: isDictationListening,
    finalTranscript,
    interimTranscript,
    toggle: toggleDictation,
  } = useDictation();
  
  const liveTranscript = useMemo(() => {
    const final = finalTranscript || '';
    const interim = interimTranscript || '';
    return interim.trim() ? `${final} ${interim}`.trim() : final;
  }, [finalTranscript, interimTranscript]);

  // Funciones auxiliares
  const getViewportCenter = useCallback(() => {
    if (canvasRef.current) return canvasRef.current.getViewportCenter();
    return { x: 400, y: 400 };
  }, []);

  const elementsRef = useRef(elements);
  useEffect(() => { elementsRef.current = elements; }, [elements]);

  const getNextZIndex = useCallback(() => {
    const els = elementsRef.current;
    if (!els?.length) return 1;
    const zIndexes = els.filter(e => typeof e.zIndex === 'number').map(e => e.zIndex!);
    return zIndexes.length ? Math.max(...zIndexes) + 1 : 2;
  }, []);

  const { addElement } = useElementManager(boardId, getViewportCenter, getNextZIndex);

  // Sincronizar selección
  const selectedElementId = selectedElementIds.length === 1 ? selectedElementIds[0] : null;
  const foundElement = useMemo(() => {
    if (!selectedElementId || !elements?.length) return null;
    return elements.find(el => el.id === selectedElementId) || null;
  }, [selectedElementId, elements]);
  
  useEffect(() => {
    if (foundElement?.id !== selectedElement?.id) {
      setSelectedElement(foundElement);
      setIsInfoPanelVisible(!!foundElement);
    }
  }, [foundElement, selectedElement?.id]);

  // Refs para prevenir múltiples cargas
  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);

  // Cargar tablero
  useEffect(() => {
    if (typeof window === 'undefined' || !boardId || !user?.uid) return;
    if (isLoadingRef.current || authLoading || hasLoadedRef.current) return;

    hasLoadedRef.current = true;
    isLoadingRef.current = true;
    
    console.log('📂 Cargando tablero:', boardId);
    
    if (boardId === 'new') {
      createBoardRef.current?.(user.uid).then((newId: string) => {
        isLoadingRef.current = false;
        if (newId) window.location.href = `/board/${newId}/`;
      }).catch((err: any) => {
        console.error('Error creando tablero:', err);
        isLoadingRef.current = false;
        hasLoadedRef.current = false;
      });
    } else {
      loadBoardRef.current?.(boardId, user.uid).then(() => {
        console.log('✅ Tablero cargado');
        isLoadingRef.current = false;
      }).catch((err: any) => {
        console.error('Error cargando tablero:', err);
        isLoadingRef.current = false;
        hasLoadedRef.current = false;
      });
    }
    
    return () => { cleanupRef.current?.(); };
  }, [boardId, user?.uid, authLoading]);

  // Handlers
  const handleSelectElement = useCallback((elementId: string | null) => {
    setSelectedElementIds(elementId ? [elementId] : []);
  }, [setSelectedElementIds]);

  const handleUploadImage = useCallback(async () => {
    if (!user?.uid || !storage) {
      toast({ title: 'Error', description: 'Debes iniciar sesión' });
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const result = await uploadFile(file, user.uid, storage);
        if (result.success) {
          await addElement('image', { content: { url: result.url }, properties: { size: { width: 300, height: 200 } } });
          toast({ title: 'Imagen subida' });
        } else {
          toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
      } catch {
        toast({ variant: 'destructive', title: 'Error al subir imagen' });
      }
    };
    input.click();
  }, [user, storage, addElement, toast]);

  const handleLocateElement = useCallback((id: string) => {
    const el = elements.find(e => e.id === id);
    if (el && canvasRef.current) {
      handleSelectElement(id);
      canvasRef.current.centerOnElement(el);
    }
  }, [elements, handleSelectElement]);

  const handleOpenNotepad = useCallback((id: string) => {
    const el = elements.find(e => e.id === id);
    if (el) {
      updateElement(id, { hidden: false });
      handleSelectElement(id);
      canvasRef.current?.centerOnElement(el);
    }
  }, [elements, updateElement, handleSelectElement]);

  const handleChangeNotepadFormat = useCallback((id: string) => {
    const el = elements.find(e => e.id === id);
    if (el) {
      setSelectedNotepadForFormat(el);
      setChangeFormatDialogOpen(true);
    }
  }, [elements]);

  const handleSaveFormat = useCallback((id: string, format: 'letter' | '10x15') => {
    const size = format === 'letter' ? { width: 794, height: 1021 } : { width: 378, height: 567 };
    updateElement(id, { width: size.width, height: size.height, properties: { ...selectedNotepadForFormat?.properties, format, size } });
    setChangeFormatDialogOpen(false);
  }, [selectedNotepadForFormat, updateElement]);

  const handleEditComment = useCallback((comment: WithId<CanvasElement>) => {
    setSelectedCommentForEdit(comment);
    setIsEditCommentDialogOpen(true);
  }, []);

  const handleEditElement = useCallback((id: string) => {
    const el = elements.find(e => e.id === id);
    if (el) {
      setActivatedElementId(id);
      canvasRef.current?.centerOnElement(el);
    }
  }, [elements]);

  const handleExportToPng = useCallback(async () => {
    if (!canvasRef.current) return;
    const container = canvasRef.current.getCanvasContainer();
    if (!container) return;
    try {
      toast({ title: 'Exportando...' });
      const canvas = await html2canvas(container, { backgroundColor: '#96e4e6', scale: 2, useCORS: true });
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${board?.name || 'tablero'}_${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
        toast({ title: 'Exportado' });
      }, 'image/png');
    } catch {
      toast({ variant: 'destructive', title: 'Error al exportar' });
    }
  }, [board, toast]);

  const handleAddMarker = useCallback(async () => {
    try {
      await addElement('comment', {
        content: { title: 'Localizador', label: '', text: '' },
        properties: { position: getViewportCenter(), size: { width: 48, height: 48 } },
      });
      toast({ title: 'Localizador creado' });
    } catch {
      toast({ variant: 'destructive', title: 'Error' });
    }
  }, [addElement, getViewportCenter, toast]);

  // === RENDERS ===

  if (shouldRedirectToLogin) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center" style={{ backgroundColor: '#96e4e6' }}>
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4">Redirigiendo al login...</p>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center" style={{ backgroundColor: '#96e4e6' }}>
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Verificando sesión...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center" style={{ backgroundColor: '#96e4e6' }}>
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Redirigiendo...</p>
      </div>
    );
  }

  if (isBoardLoading || !board) {
    return (
      <div className="flex h-screen w-full items-center justify-center" style={{ backgroundColor: '#96e4e6' }}>
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Cargando tablero...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center" style={{ backgroundColor: '#96e4e6' }}>
        <p className="text-red-600 text-lg">Error: {error}</p>
        <button onClick={() => window.location.href = '/'} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <>
      <RenameBoardDialog
        isOpen={isRenameBoardDialogOpen}
        onOpenChange={setIsRenameBoardDialogOpen}
        currentBoardName={board?.name || ''}
        onSave={(name) => { handleRenameBoard(name); setIsRenameBoardDialogOpen(false); }}
      />
      
      <div className="h-screen w-screen relative overflow-hidden">
        {/* Nombre del tablero en esquina superior izquierda */}
        <BoardTitleDisplay name={board?.name || ""} />

        <Canvas
          ref={canvasRef}
          elements={elements as WithId<CanvasElement>[]}
          board={board as WithId<Board>}
          selectedElementIds={selectedElementIds}
          onSelectElement={handleSelectElement}
          updateElement={updateElement}
          deleteElement={deleteElement}
          unanchorElement={(id) => updateElement(id, { parentId: undefined })}
          addElement={addElement}
          onLocateElement={handleLocateElement}
          onFormatToggle={() => setIsFormatToolbarOpen(p => !p)}
          onChangeNotepadFormat={handleChangeNotepadFormat}
          onEditElement={handleEditElement}
          selectedElement={selectedElement}
          activatedElementId={activatedElementId}
          isMobile={isMobile}
          setIsDirty={setIsDirty}
          isListening={isDictationListening}
          liveTranscript={liveTranscript}
          finalTranscript={finalTranscript}
          interimTranscript={interimTranscript}
          onBringToFront={() => {}}
          onSendToBack={() => {}}
          onMoveBackward={() => {}}
          onGoToHome={() => canvasRef.current?.goToHome()}
          onCenterView={() => {}}
          onGroupElements={() => {}}
          saveLastView={() => {}}
          onActivateDrag={() => {}}
          onEditComment={handleEditComment}
          onDuplicateElement={() => {}}
          onUngroup={() => {}}
        />
        
        <ToolsSidebar
          elements={elements || []}
          boards={boards || []}
          onUploadImage={handleUploadImage}
          onAddImageFromUrl={() => setIsImageUrlDialogOpen(true)}
          onPanToggle={() => canvasRef.current?.activatePanMode()}
          onRenameBoard={() => setIsRenameBoardDialogOpen(true)}
          onDeleteBoard={handleDeleteBoard}
          isListening={isDictationListening}
          onToggleDictation={toggleDictation}
          onOpenNotepad={handleOpenNotepad}
          onLocateElement={handleLocateElement}
          addElement={addElement}
          clearCanvas={() => clearCanvas(elements)}
          onExportBoardToPng={handleExportToPng}
          onFormatToggle={() => setIsFormatToolbarOpen(p => !p)}
          isFormatToolbarOpen={isFormatToolbarOpen}
        />

        <FormattingToolbar
          isOpen={isFormatToolbarOpen}
          onClose={() => setIsFormatToolbarOpen(false)}
          elements={selectedElement ? [selectedElement] : []}
          onAddComment={handleAddMarker}
          onEditComment={handleEditComment}
          isMobileSheet={isMobile}
          onLocateElement={handleLocateElement}
          onPanToggle={() => { setIsPanningActive(p => !p); canvasRef.current?.activatePanMode(); }}
          addElement={addElement}
          isPanningActive={isPanningActive}
        />

        <ChangeFormatDialog
          isOpen={changeFormatDialogOpen}
          onOpenChange={setChangeFormatDialogOpen}
          notepad={selectedNotepadForFormat}
          onSaveFormat={handleSaveFormat}
        />

        <AddImageFromUrlDialog
          isOpen={isImageUrlDialogOpen}
          onOpenChange={setIsImageUrlDialogOpen}
          onAddImage={async (url) => {
            await addElement('image', { content: { url }, properties: { size: { width: 300, height: 200 } } });
            setIsImageUrlDialogOpen(false);
          }}
        />

        {selectedCommentForEdit && (
          <EditCommentDialog
            isOpen={isEditCommentDialogOpen}
            onOpenChange={setIsEditCommentDialogOpen}
            comment={selectedCommentForEdit}
            onUpdate={updateElement}
            onDelete={deleteElement}
          />
        )}

        <ElementInfoPanel
          element={selectedElement}
          isVisible={isInfoPanelVisible}
          onClose={() => setIsInfoPanelVisible(false)}
        />
      </div>
    </>
  );
}
