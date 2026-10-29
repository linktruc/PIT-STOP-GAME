import { useEffect } from 'react';
export function scheduleDismiss(clear: () => void, error = false): () => void {
  const timer = setTimeout(clear, error ? 15000 : 12000);
  return () => clearTimeout(timer);
}
export function useTimedNotice(message: string, clear: () => void, error = false) {
  useEffect(() => { if (message) return scheduleDismiss(clear, error); }, [message, clear, error]);
}
