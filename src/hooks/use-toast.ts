import { useState } from 'react';

interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
  type?: 'default' | 'success' | 'error' | 'warning' | 'info';
  id?: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const toast = (options: ToastOptions) => {
    const id = Date.now().toString();
    const newToast = {
      ...options,
      id,
      duration: options.duration ?? 5000,
      type: options.type ?? 'default',
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss toast after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, newToast.duration);

    // Return the toast id in case it needs to be dismissed manually
    return id;
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const dismissAll = () => {
    setToasts([]);
  };

  return {
    toast,
    dismiss,
    dismissAll,
    toasts,
  };
}

// This provides a simplified toast function to use in components
// that don't want to use the full hook. For our current components,
// we just console.log instead of showing a UI toast.
export const toast = (options: ToastOptions) => {
  console.log(`[Toast] ${options.title}: ${options.description || ''}`);
  return Date.now().toString();
};
