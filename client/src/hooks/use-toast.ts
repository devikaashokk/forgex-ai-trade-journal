// client/src/hooks/use-toast.ts
import { useState, useCallback } from "react";
import { ToastVariant } from "@/components/ui/toast";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: string;
  open: boolean;
}

// Simple global toast store (no context needed for this pattern)
let toastListeners: ((toasts: ToastItem[]) => void)[] = [];
let currentToasts: ToastItem[] = [];

function notify(toast: ToastItem) {
  currentToasts = [...currentToasts, toast];
  toastListeners.forEach((l) => l(currentToasts));
}

function dismiss(id: string) {
  currentToasts = currentToasts.map((t) =>
    t.id === id ? { ...t, open: false } : t
  );
  toastListeners.forEach((l) => l(currentToasts));
  setTimeout(() => {
    currentToasts = currentToasts.filter((t) => t.id !== id);
    toastListeners.forEach((l) => l(currentToasts));
  }, 300);
}

export function toast(options: ToastOptions) {
  const id = Math.random().toString(36).slice(2);
  notify({ ...options, id, open: true });
  setTimeout(() => dismiss(id), options.duration ?? 4000);
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>(currentToasts);

  const subscribe = useCallback((listener: (t: ToastItem[]) => void) => {
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  useState(() => {
    const unsub = subscribe(setToasts);
    return unsub;
  });

  return { toasts, dismiss };
}
