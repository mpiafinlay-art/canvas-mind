/**
 * Hook para insertar dictado en elementos editables
 * Versión LIMPIA - Sin duplicación
 */

'use client';

import { useEffect, useRef } from 'react';

interface UseDictationInputOptions {
  elementRef: React.RefObject<HTMLElement | HTMLInputElement | HTMLTextAreaElement>;
  isListening: boolean;
  liveTranscript: string;
  finalTranscript?: string;
  interimTranscript?: string;
  isSelected?: boolean;
  enabled?: boolean;
}

export function useDictationInput({
  elementRef,
  isListening,
  finalTranscript = '',
  interimTranscript = '',
  isSelected = false,
  enabled = true,
}: UseDictationInputOptions) {
  const lastFinalRef = useRef<string>('');
  const insertedLengthRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || !isListening) {
      // Reset cuando se detiene
      lastFinalRef.current = '';
      insertedLengthRef.current = 0;
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    const isFocused = document.activeElement === element;
    if (!isFocused && !isSelected) return;

    // Solo insertar texto FINAL nuevo (evita duplicación)
    if (finalTranscript && finalTranscript !== lastFinalRef.current) {
      // Calcular solo el texto nuevo
      const newText = finalTranscript.slice(lastFinalRef.current.length).trim();
      lastFinalRef.current = finalTranscript;
      
      if (!newText) return;

      try {
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          const start = element.selectionStart || element.value.length;
          const prefix = insertedLengthRef.current > 0 ? ' ' : '';
          element.value = element.value.slice(0, start) + prefix + newText;
          element.selectionStart = element.selectionEnd = element.value.length;
          insertedLengthRef.current += newText.length;
          element.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (element.isContentEditable) {
          if (!isFocused) element.focus();
          const prefix = insertedLengthRef.current > 0 ? ' ' : '';
          document.execCommand('insertText', false, prefix + newText);
          insertedLengthRef.current += newText.length;
        }
      } catch (error) {
        console.error('Error insertando dictado:', error);
      }
    }
  }, [isListening, finalTranscript, isSelected, enabled, elementRef]);

  // Reset al detener
  useEffect(() => {
    if (!isListening) {
      lastFinalRef.current = '';
      insertedLengthRef.current = 0;
    }
  }, [isListening]);
}
