import { useId, useRef, useState } from "react";
import { ImageIcon, LoaderCircle, Upload } from "lucide-react";
import { errorMessage, uploadFile } from "../../lib/api";
import Button from "./Button";

interface ImageUploadProps {
  label: string;
  hint?: string;
  /** Adresse de l'image enregistrée (renvoyée par le service Fichiers). */
  value?: string;
  onChange: (url?: string) => void;
  /** Si renseigné, seule une image de cette dimension exacte est acceptée. */
  exact?: { width: number; height: number };
}

function readSize(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = reject;
    image.src = url;
  });
}

export default function ImageUpload({ label, hint, value, onChange, exact }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const labelId = useId();
  const hintId = useId();
  const errorId = useId();

  async function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Le fichier choisi n'est pas une image.");
      return;
    }
    if (exact) {
      // Les dimensions sont lues sur une copie locale, avant tout envoi.
      const local = URL.createObjectURL(file);
      try {
        const size = await readSize(local);
        if (size.width !== exact.width || size.height !== exact.height) {
          setError(
            `L'image doit mesurer exactement ${exact.width} × ${exact.height} pixels (la vôtre : ${size.width} × ${size.height}).`,
          );
          return;
        }
      } catch {
        setError("Impossible de lire cette image.");
        return;
      } finally {
        URL.revokeObjectURL(local);
      }
    }
    setUploading(true);
    try {
      onChange((await uploadFile(file)).url);
    } catch (cause) {
      setError(errorMessage(cause, "L'image n'a pas pu être envoyée."));
    } finally {
      setUploading(false);
    }
  }

  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div role="group" aria-labelledby={labelId} aria-describedby={describedBy}>
      <p id={labelId} className="text-sm font-medium">
        {label}
      </p>
      {hint && (
        <p id={hintId} className="mt-0.5 text-sm text-muted">
          {hint}
        </p>
      )}

      <div className="mt-1.5 flex flex-wrap items-center gap-4">
        <div
          className={`flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-paper ${
            exact ? "aspect-[3/2] w-60" : "size-20"
          }`}
        >
          {value ? (
            <img src={value} alt="Aperçu de l'image choisie" className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-7 text-muted" strokeWidth={1.5} aria-hidden="true" />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" disabled={uploading} onClick={() => inputRef.current?.click()}>
            {uploading ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="size-4" aria-hidden="true" />
            )}
            {uploading ? "Envoi en cours…" : value ? "Remplacer l'image" : "Choisir une image"}
          </Button>
          {value && (
            <Button variant="ghost" onClick={() => onChange(undefined)}>
              Retirer
            </Button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void handleFile(file);
        }}
      />

      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-laterite">
          {error}
        </p>
      )}
    </div>
  );
}
