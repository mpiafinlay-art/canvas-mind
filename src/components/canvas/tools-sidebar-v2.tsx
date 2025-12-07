'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Rnd } from 'react-rnd';
import { useRouter } from 'next/navigation';
import {
  // Herramientas principales
  MousePointer2,
  Hand,
  Type,
  StickyNote,
  FileText,
  Image,
  CheckSquare,
  // Acciones
  Plus,
  Trash2,
  Download,
  Mic,
  MicOff,
  // Navegación
  FolderOpen,
  ChevronDown,
  Search,
  MapPin,
  // UI
  GripVertical,
  Settings,
  LogOut,
  LayoutGrid,
  Layers,
  Clock,
  Timer,
  Sparkles,
  PanelLeft,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { ElementType, CanvasElement, Board, WithId, CommentContent, NotepadContent } from '@/lib/types';
import { useAuth } from '@/firebase/provider';
import { signOut } from '@/firebase/auth';
import { useToast } from '@/hooks/use-toast';
import CreateBoardDialog from './create-board-dialog';

// Colores de notas adhesivas
const stickyColors = [
  { name: 'yellow', hex: '#fef08a' },
  { name: 'pink', hex: '#fda4af' },
  { name: 'blue', hex: '#93c5fd' },
  { name: 'green', hex: '#86efac' },
  { name: 'orange', hex: '#fdba74' },
  { name: 'purple', hex: '#d8b4fe' },
];

// Botón de herramienta estilo Adobe/Milanote
const ToolButton = ({
  icon: Icon,
  label,
  onClick,
  isActive,
  isRecording,
  hasDropdown,
  disabled,
  className,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
  isRecording?: boolean;
  hasDropdown?: boolean;
  disabled?: boolean;
  className?: string;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'relative w-9 h-9 flex items-center justify-center rounded-md transition-all duration-150',
          'hover:bg-white/10 active:scale-95',
          isActive && 'bg-white/20 shadow-inner',
          isRecording && 'bg-red-500 animate-pulse',
          disabled && 'opacity-40 cursor-not-allowed',
          className
        )}
      >
        <Icon className={cn('w-[18px] h-[18px]', isRecording ? 'text-white' : 'text-white/90')} strokeWidth={1.5} />
        {hasDropdown && (
          <ChevronDown className="absolute bottom-0.5 right-0.5 w-2 h-2 text-white/60" />
        )}
      </button>
    </TooltipTrigger>
    <TooltipContent side="right" className="text-xs">
      {label}
    </TooltipContent>
  </Tooltip>
);

// Separador vertical
const Divider = () => <div className="w-full h-px bg-white/20 my-1" />;

type ToolsSidebarV2Props = {
  elements: WithId<CanvasElement>[];
  boards: WithId<Board>[];
  onUploadImage: () => void;
  onAddImageFromUrl: () => void;
  onPanToggle: () => void;
  isListening?: boolean;
  onToggleDictation?: () => void;
  onRenameBoard: () => void;
  onDeleteBoard: () => void;
  onOpenNotepad: (id: string) => void;
  onLocateElement: (id: string) => void;
  addElement: (type: ElementType, props?: any) => Promise<string>;
  clearCanvas: () => void;
  onExportBoardToPng: () => void;
  onFormatToggle: () => void;
  isFormatToolbarOpen: boolean;
  isPanningActive?: boolean;
};

export default function ToolsSidebarV2(props: ToolsSidebarV2Props) {
  const {
    elements,
    boards,
    onUploadImage,
    onAddImageFromUrl,
    onPanToggle,
    isListening = false,
    onToggleDictation,
    onDeleteBoard,
    onOpenNotepad,
    onLocateElement,
    addElement,
    clearCanvas,
    onExportBoardToPng,
    onFormatToggle,
    isFormatToolbarOpen,
    isPanningActive,
  } = props;

  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: 80 });
  const [activeTool, setActiveTool] = useState<string>('select');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('toolbarV2Pos');
      if (saved) setPosition(JSON.parse(saved));
    } catch {}
  }, []);

  const savePosition = (x: number, y: number) => {
    setPosition({ x, y });
    localStorage.setItem('toolbarV2Pos', JSON.stringify({ x, y }));
  };

  const allNotepads = useMemo(
    () => elements.filter((el) => ['notepad', 'notepad-simple', 'yellow-notepad', 'tabbed-notepad'].includes(el.type)),
    [elements]
  );
  const hiddenNotepads = useMemo(() => allNotepads.filter((el) => el.hidden), [allNotepads]);

  const allComments = useMemo(
    () => elements.filter((el) => {
      if (el.type !== 'comment') return false;
      const c = el.content as CommentContent;
      return c && (c.title || c.label || c.text);
    }),
    [elements]
  );

  const handleAdd = async (type: ElementType, props?: any) => {
    try {
      await addElement(type, props);
      toast({ title: '✓ Creado' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  };

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  return (
    <>
      <CreateBoardDialog isOpen={isCreateBoardOpen} onOpenChange={setIsCreateBoardOpen} />
      
      <Rnd
        position={position}
        size={{ width: 52, height: 'auto' }}
        bounds="window"
        dragHandleClassName="toolbar-drag"
        onDragStop={(_, d) => savePosition(d.x, d.y)}
        enableResizing={false}
        className="z-[10001]"
      >
        <div className="flex flex-col items-center py-2 px-1.5 rounded-xl bg-[#2d2d2d] shadow-2xl border border-white/10">
          
          {/* Drag Handle */}
          <div className="toolbar-drag cursor-grab active:cursor-grabbing w-full flex justify-center py-1 mb-1 hover:bg-white/5 rounded">
            <GripVertical className="w-4 h-4 text-white/40" />
          </div>

          {/* === HERRAMIENTAS DE SELECCIÓN === */}
          <ToolButton 
            icon={MousePointer2} 
            label="Seleccionar (V)" 
            isActive={activeTool === 'select'}
            onClick={() => setActiveTool('select')}
          />
          <ToolButton 
            icon={Hand} 
            label="Mover lienzo (H)" 
            isActive={isPanningActive || activeTool === 'pan'}
            onClick={() => { setActiveTool('pan'); onPanToggle(); }}
          />

          <Divider />

          {/* === CREAR ELEMENTOS === */}
          
          {/* Notas Adhesivas */}
          <Popover>
            <PopoverTrigger asChild>
              <div>
                <ToolButton icon={StickyNote} label="Nota adhesiva" hasDropdown />
              </div>
            </PopoverTrigger>
            <PopoverContent side="right" className="w-auto p-2 bg-[#3d3d3d] border-white/10">
              <div className="grid grid-cols-3 gap-1.5">
                {stickyColors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => handleAdd('sticky', { color: c.name })}
                    className="w-8 h-8 rounded shadow-sm hover:scale-110 transition-transform border border-black/20"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Texto */}
          <Popover>
            <PopoverTrigger asChild>
              <div>
                <ToolButton icon={Type} label="Texto" hasDropdown />
              </div>
            </PopoverTrigger>
            <PopoverContent side="right" className="w-auto p-2 bg-[#3d3d3d] border-white/10">
              <div className="grid grid-cols-4 gap-1.5">
                {['#ffffff','#fef08a','#fda4af','#93c5fd','#86efac','#fdba74','#d8b4fe','transparent'].map((hex) => (
                  <button
                    key={hex}
                    onClick={() => handleAdd('text', { properties: { backgroundColor: hex }})}
                    className={cn(
                      'w-7 h-7 rounded hover:scale-110 transition-transform',
                      hex === 'transparent' ? 'border-2 border-dashed border-white/30' : 'border border-black/20 shadow-sm'
                    )}
                    style={{ backgroundColor: hex === 'transparent' ? 'transparent' : hex }}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Cuadernos */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div>
                <ToolButton icon={FileText} label="Cuaderno" hasDropdown />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" className="bg-[#3d3d3d] border-white/10 text-white">
              <DropdownMenuItem onClick={() => handleAdd('notepad')} className="hover:bg-white/10">
                <Plus className="mr-2 h-4 w-4" /> Cuaderno clásico
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAdd('yellow-notepad')} className="hover:bg-white/10">
                <Plus className="mr-2 h-4 w-4" /> Bloc amarillo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAdd('tabbed-notepad')} className="hover:bg-white/10">
                <Plus className="mr-2 h-4 w-4" /> Con pestañas
              </DropdownMenuItem>
              {hiddenNotepads.length > 0 && (
                <>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="hover:bg-white/10">
                      <Layers className="mr-2 h-4 w-4" /> Cerrados ({hiddenNotepads.length})
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="bg-[#3d3d3d] border-white/10 text-white">
                      {hiddenNotepads.map((n) => (
                        <DropdownMenuItem key={n.id} onClick={() => onOpenNotepad(n.id)} className="hover:bg-white/10">
                          {(n.content as NotepadContent)?.title || 'Sin título'}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Imagen */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div>
                <ToolButton icon={Image} label="Imagen" hasDropdown />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" className="bg-[#3d3d3d] border-white/10 text-white">
              <DropdownMenuItem onClick={onUploadImage} className="hover:bg-white/10">
                Subir archivo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddImageFromUrl} className="hover:bg-white/10">
                Desde URL
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={() => handleAdd('moodboard')} className="hover:bg-white/10">
                Moodboard
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* To-Do */}
          <ToolButton icon={CheckSquare} label="Lista de tareas" onClick={() => handleAdd('todo')} />

          <Divider />

          {/* === UTILIDADES === */}
          
          <ToolButton icon={Timer} label="Cronómetro" onClick={() => handleAdd('stopwatch')} />
          <ToolButton icon={Clock} label="Temporizador" onClick={() => handleAdd('countdown')} />
          <ToolButton icon={Sparkles} label="Destacar" onClick={() => handleAdd('highlight-text')} />

          {/* Marcadores */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div>
                <ToolButton icon={MapPin} label="Marcadores" hasDropdown />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" className="w-56 bg-[#3d3d3d] border-white/10 text-white">
              {allComments.length > 0 ? (
                <div className="max-h-48 overflow-y-auto">
                  {allComments.map((c) => {
                    const content = c.content as CommentContent;
                    return (
                      <DropdownMenuItem 
                        key={c.id} 
                        onClick={() => onLocateElement(c.id)}
                        className="hover:bg-white/10"
                      >
                        <MapPin className="mr-2 h-4 w-4 text-cyan-400" />
                        <span className="truncate">{content?.label || content?.title || 'Sin nombre'}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              ) : (
                <div className="px-3 py-4 text-center text-sm text-white/50">
                  Sin marcadores
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Divider />

          {/* === ACCIONES === */}
          
          <ToolButton 
            icon={isListening ? MicOff : Mic} 
            label={isListening ? 'Detener dictado' : 'Dictar'} 
            onClick={onToggleDictation}
            isRecording={isListening}
          />

          <ToolButton 
            icon={PanelLeft} 
            label="Panel de formato" 
            onClick={onFormatToggle}
            isActive={isFormatToolbarOpen}
          />

          <ToolButton icon={Download} label="Exportar PNG" onClick={onExportBoardToPng} />

          <Divider />

          {/* === TABLEROS Y CONFIG === */}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div>
                <ToolButton icon={LayoutGrid} label="Tableros" hasDropdown />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" className="bg-[#3d3d3d] border-white/10 text-white">
              <DropdownMenuItem onClick={() => setIsCreateBoardOpen(true)} className="hover:bg-white/10">
                <Plus className="mr-2 h-4 w-4" /> Nuevo tablero
              </DropdownMenuItem>
              {boards.length > 0 && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="hover:bg-white/10">
                    <FolderOpen className="mr-2 h-4 w-4" /> Abrir
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-[#3d3d3d] border-white/10 text-white">
                    {boards.map((b) => (
                      <DropdownMenuItem key={b.id} onClick={() => router.push(`/board/${b.id}`)} className="hover:bg-white/10">
                        {b.name || 'Sin nombre'}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={onDeleteBoard} className="text-red-400 hover:bg-white/10">
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div>
                <ToolButton icon={Settings} label="Opciones" hasDropdown />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" className="bg-[#3d3d3d] border-white/10 text-white">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="hover:bg-white/10">
                    <Trash2 className="mr-2 h-4 w-4" /> Limpiar tablero
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Limpiar tablero?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Se eliminarán todos los elementos. Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={clearCanvas} className="bg-red-500">
                      Limpiar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={handleSignOut} className="hover:bg-white/10">
                <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </Rnd>
    </>
  );
}
