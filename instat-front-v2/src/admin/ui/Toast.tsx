import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";

type Tone = "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
}

const ToastContext = createContext<{ notify: (message: string, tone?: Tone) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const notify = useCallback((message: string, tone: Tone = "success") => {
    nextId.current += 1;
    const id = nextId.current;
    setToasts((previous) => [...previous, { id, message, tone }]);
    window.setTimeout(() => setToasts((previous) => previous.filter((toast) => toast.id !== id)), 5000);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  // Les fenêtres <dialog> s'affichent dans la « couche supérieure » du navigateur, au-dessus de tout le reste.
  // La zone des messages y est aussi (popover), et passe au premier plan à chaque nouveau message :
  // une erreur d'enregistrement reste visible au-dessus de la fenêtre restée ouverte.
  const regionRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const region = regionRef.current;
    if (!region?.showPopover) return;
    if (region.matches(":popover-open")) region.hidePopover();
    region.showPopover();
  }, [toasts.length]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        ref={regionRef}
        popover="manual"
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed top-auto right-4 bottom-4 left-auto z-50 m-0 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2 overflow-visible border-0 bg-transparent p-0"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`fade-in pointer-events-auto flex items-start gap-3 border-l-[3px] bg-paddy-night px-4 py-3 text-sm text-white shadow-[0_12px_30px_-12px_rgba(9,42,31,0.6)] ${
              toast.tone === "error" ? "border-laterite" : "border-[#7fbf9f]"
            }`}
          >
            {toast.tone === "error" ? (
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-[#f2b8ad]" aria-hidden="true" />
            ) : (
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-[#7fbf9f]" aria-hidden="true" />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast doit être utilisé à l'intérieur de <ToastProvider>.");
  return context;
}
