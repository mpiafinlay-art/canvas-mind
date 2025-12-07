/**
 * Hook de Dictado - Versión LIMPIA Y FINAL
 * - Preview gris en tiempo real
 * - Texto final negro al pausar
 * - Sin duplicación de palabras
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseDictationReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  finalTranscript: string;
  interimTranscript: string;
  permissionError: string | null;
  start: () => Promise<void>;
  stop: () => void;
  toggle: () => Promise<void>;
  resetTranscript: () => void;
}

export const useDictation = (): UseDictationReturn => {
  const [isListening, setIsListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTextRef = useRef<string>('');
  const isActiveRef = useRef(false);

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Cleanup
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  const start = useCallback(async () => {
    if (!isSupported) {
      setPermissionError('Navegador no soporta dictado');
      return;
    }

    if (isActiveRef.current) return;

    // Limpiar instancia anterior
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';
    
    recognitionRef.current = recognition;
    isActiveRef.current = true;
    
    // Limpiar transcripts anteriores
    finalTextRef.current = '';
    setFinalTranscript('');
    setInterimTranscript('');

    recognition.onstart = () => {
      console.log('🎤 Dictado activo');
      setIsListening(true);
      setPermissionError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      
      // Solo procesar desde el último resultado
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        
        if (result.isFinal) {
          // Texto confirmado - agregar al final
          const formatted = text.trim();
          if (formatted) {
            finalTextRef.current += (finalTextRef.current ? ' ' : '') + formatted;
            setFinalTranscript(finalTextRef.current);
          }
          setInterimTranscript(''); // Limpiar preview
        } else {
          // Preview en tiempo real
          interim = text;
        }
      }
      
      // Mostrar preview (gris)
      if (interim) {
        setInterimTranscript(interim);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'not-allowed') {
        setPermissionError('Permiso de micrófono denegado');
        isActiveRef.current = false;
        setIsListening(false);
      }
      // Ignorar no-speech y aborted
    };

    recognition.onend = () => {
      if (isActiveRef.current) {
        // Auto-reiniciar si sigue activo
        setTimeout(() => {
          if (isActiveRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch {
              isActiveRef.current = false;
              setIsListening(false);
            }
          }
        }, 500);
      } else {
        setIsListening(false);
      }
    };

    try {
      recognition.start();
    } catch (error) {
      setPermissionError('Error al iniciar micrófono');
      isActiveRef.current = false;
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    console.log('🎤 Deteniendo dictado');
    isActiveRef.current = false;
    
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    
    setIsListening(false);
    
    // Consolidar interim pendiente
    const pending = interimTranscript.trim();
    if (pending) {
      finalTextRef.current += (finalTextRef.current ? ' ' : '') + pending;
      setFinalTranscript(finalTextRef.current);
      setInterimTranscript('');
    }
  }, [interimTranscript]);

  const toggle = useCallback(async () => {
    if (isListening) {
      stop();
    } else {
      await start();
    }
  }, [isListening, start, stop]);

  const resetTranscript = useCallback(() => {
    finalTextRef.current = '';
    setFinalTranscript('');
    setInterimTranscript('');
  }, []);

  // Transcript completo: final (negro) + interim (para preview gris)
  const transcript = finalTranscript + (interimTranscript ? ' ' + interimTranscript : '');

  return {
    isSupported,
    isListening,
    transcript,
    finalTranscript,
    interimTranscript,
    permissionError,
    start,
    stop,
    toggle,
    resetTranscript,
  };
};
