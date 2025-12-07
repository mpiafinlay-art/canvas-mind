/**
 * Helpers para dictado - Versión LIMPIA
 * Funciones simples sin efectos secundarios
 */

'use client';

export interface DictationState {
  lastInsertedText: string;
  lastFinalText: string;
}

export function insertDictationTextToContentEditable(
  element: HTMLElement,
  liveTranscript: string,
  finalTranscript: string,
  interimTranscript: string,
  state: DictationState
): void {
  if (!element || !element.isContentEditable) return;
  
  const textToInsert = finalTranscript || liveTranscript;
  if (!textToInsert || textToInsert === state.lastInsertedText) return;
  
  state.lastInsertedText = textToInsert;
  
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(textToInsert));
    range.collapse(false);
  }
}

export function insertDictationTextToInput(
  element: HTMLInputElement | HTMLTextAreaElement,
  liveTranscript: string,
  finalTranscript: string,
  state: DictationState
): void {
  if (!element) return;
  
  const textToInsert = finalTranscript || liveTranscript;
  if (!textToInsert || textToInsert === state.lastInsertedText) return;
  
  state.lastInsertedText = textToInsert;
  
  const start = element.selectionStart || element.value.length;
  const end = element.selectionEnd || element.value.length;
  element.value = element.value.slice(0, start) + textToInsert + element.value.slice(end);
  element.selectionStart = element.selectionEnd = start + textToInsert.length;
}

export function finalizeInterimText(element: HTMLElement): void {
  // Simplificado - no hace nada especial
}
