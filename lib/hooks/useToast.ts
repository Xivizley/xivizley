import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import type { ToastMessage, ToastType } from '@/components/shared/Toast';

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((type: ToastType, title: string, desc?: string) => {
    const id = nanoid();
    setToasts((prev) => [...prev, { id, type, title, ...(desc !== undefined ? { desc } : {}) } as ToastMessage]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, toast, dismiss };
}
