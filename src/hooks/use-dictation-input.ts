'use client';

import { useEffect, useRef } from 'react';

export function useDictationInput({
  elementRef,
  transcript,
  isListening,
  liveTranscript,
  finalTranscript,
  interimTranscript,
  isSelected,
}: {
  elementRef: React.RefObject<HTMLElement>;
  transcript?: string;
  isListening: boolean;
  liveTranscript?: string;
  finalTranscript?: string;
  interimTranscript?: string;
  isSelected?: boolean;
}) {
  const prevTranscriptRef = useRef('');
  const activeTranscript = liveTranscript || transcript || '';

  useEffect(() => {
    if (!elementRef.current || !isListening || !isSelected) return;

    if (activeTranscript !== prevTranscriptRef.current) {
      const newText = activeTranscript.slice(prevTranscriptRef.current.length);
      if (elementRef.current instanceof HTMLInputElement || elementRef.current instanceof HTMLTextAreaElement) {
        elementRef.current.value += newText;
        elementRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      } else if (elementRef.current.contentEditable === 'true') {
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);
        if (range) {
          range.deleteContents();
          range.insertNode(document.createTextNode(newText));
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
    }
      }
      prevTranscriptRef.current = activeTranscript;
    }
  }, [activeTranscript, isListening, isSelected, elementRef]);
}

