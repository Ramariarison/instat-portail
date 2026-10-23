import { useId, type ReactNode } from "react";

export interface FieldAria {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
}

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (aria: FieldAria) => ReactNode;
}

/** Libellé + champ + aide + message d'erreur, correctement reliés pour les lecteurs d'écran. */
export default function Field({ label, hint, error, required, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && (
          <span aria-hidden="true" className="text-laterite">
            {" "}
            *
          </span>
        )}
      </label>
      {hint && (
        <p id={hintId} className="mt-0.5 text-sm text-muted">
          {hint}
        </p>
      )}
      <div className="mt-1.5">
        {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-laterite">
          {error}
        </p>
      )}
    </div>
  );
}
