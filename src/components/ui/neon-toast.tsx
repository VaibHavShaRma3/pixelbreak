"use client";

import { useState, useCallback, createContext, useContext } from "react";
import { Trophy, CheckCircle, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "score" | "achievement";

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  addToast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="h-5 w-5 text-accent-tertiary" />,
    error: <AlertCircle className="h-5 w-5 text-accent-secondary" />,
    score: <Trophy className="h-5 w-5 text-accent-yellow" />,
    achievement: <Trophy className="h-5 w-5 text-accent-purple" />,
  };

  const borderColors: Record<ToastType, string> = {
    success: "#16A34A",
    error: "#DC2626",
    score: "#D97706",
    achievement: "#7C3AED",
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-20 right-6 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-lg animate-in slide-in-from-right duration-300",
              "min-w-[280px] max-w-[360px]"
            )}
            style={{
              borderLeftWidth: "4px",
              borderLeftColor: borderColors[toast.type],
              animation: "toast-in 0.3s ease-out",
            }}
          >
            {icons[toast.type]}
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                {toast.title}
              </p>
              {toast.message && (
                <p className="mt-0.5 text-xs text-muted">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
