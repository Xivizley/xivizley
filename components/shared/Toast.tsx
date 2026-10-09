'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  desc?: string;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
    error:   <AlertCircle className="h-4 w-4 text-red-400" />,
    info:    <Info className="h-4 w-4 text-[#C084FC]" />,
  };

  const borders = {
    success: 'border-emerald-500/50',
    error:   'border-red-500/50',
    info:    'border-[#8B5CF6]/50',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-[2px] border bg-[#120A21]/95 backdrop-blur-md px-4 py-3 shadow-2xl',
        'animate-in slide-in-from-right-4 fade-in duration-200',
        borders[toast.type],
      )}
    >
      <div className="mt-0.5 shrink-0">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-mono font-semibold text-[#F5F3FF]">{toast.title}</p>
        {toast.desc && <p className="text-[11px] font-mono text-[#A19BAF] mt-0.5">{toast.desc}</p>}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-[#8B7D9E] hover:text-[#F5F3FF] transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Toast Container ─────────────────────────────────────────

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-xs w-full">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
