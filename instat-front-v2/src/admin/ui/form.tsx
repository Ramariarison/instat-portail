import Button from "./Button";

/** Après une validation en échec : place le focus sur le premier champ invalide. */
export function focusFirstInvalid(form: HTMLFormElement | null): void {
  window.setTimeout(() => {
    form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, 0);
}

export function FormActions({
  onCancel,
  submitLabel = "Enregistrer",
}: {
  onCancel: () => void;
  submitLabel?: string;
}) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button variant="secondary" onClick={onCancel}>
        Annuler
      </Button>
      <Button type="submit" variant="primary">
        {submitLabel}
      </Button>
    </div>
  );
}
