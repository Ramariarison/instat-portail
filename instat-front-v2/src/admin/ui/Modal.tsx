import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  wide?: boolean;
  children: ReactNode;
}

/**
 * <dialog> natif : focus piégé, fermeture avec Échap, reste de la page inerte.
 * Le contenu n'est monté que lorsque la fenêtre est ouverte : les formulaires repartent donc à zéro à chaque ouverture.
 */
export default function Modal({ open, onClose, title, description, wide = false, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={`m-auto max-h-[calc(100dvh-2rem)] overflow-y-auto border-0 border-t-2 border-ink bg-white p-0 text-ink shadow-[0_24px_60px_-20px_rgba(9,42,31,0.55)] backdrop:bg-paddy-night/70 backdrop:backdrop-blur-[2px] ${
        wide ? "w-[min(44rem,calc(100vw-2rem))]" : "w-[min(30rem,calc(100vw-2rem))]"
      }`}
    >
      {open && (
        <div className="relative p-6 sm:p-8">
          <span aria-hidden="true" className="absolute top-0 left-6 h-[3px] w-14 bg-laterite sm:left-8" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="font-display text-[1.9rem] leading-tight font-normal tracking-[-0.01em]">
                {title}
              </h2>
              {description && <p className="mt-1.5 font-mono text-xs text-muted">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer la fenêtre"
              className="-mt-1 -mr-2 inline-flex size-9 shrink-0 items-center justify-center text-muted hover:bg-paddy-soft hover:text-ink"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 border-t border-line pt-6">{children}</div>
        </div>
      )}
    </dialog>
  );
}
