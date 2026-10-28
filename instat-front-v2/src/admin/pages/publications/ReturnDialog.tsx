import { useState, type FormEvent } from "react";
import Field from "../../ui/Field";
import { FormActions } from "../../ui/form";
import { textareaClass } from "../../ui/inputs";
import Modal from "../../ui/Modal";

/** Renvoi d'une publication soumise : le commentaire dit à l'éditeur ce qu'il doit corriger. */
export default function ReturnDialog({
  open,
  title,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: (comment: string) => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title="Renvoyer pour correction" description={title}>
      <ReturnForm onCancel={onCancel} onConfirm={onConfirm} />
    </Modal>
  );
}

function ReturnForm({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: (comment: string) => void }) {
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string>();

  function submit(event: FormEvent) {
    event.preventDefault();
    if (comment.trim().length < 3) {
      setError("Expliquez à l'éditeur ce qu'il doit corriger.");
      return;
    }
    onConfirm(comment.trim());
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Field label="Commentaire pour l'éditeur" required error={error} hint="Il le verra en tête de la publication.">
        {(aria) => (
          <textarea {...aria} rows={5} className={textareaClass} value={comment} onChange={(e) => setComment(e.target.value)} />
        )}
      </Field>
      <FormActions onCancel={onCancel} submitLabel="Renvoyer" />
    </form>
  );
}
