import Button from "./Button";
import Modal from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  /** Si renseigné, l'action est refusée : la raison est affichée et seule la fermeture est proposée. */
  blockedReason?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Supprimer",
  blockedReason,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={blockedReason ? "Suppression impossible" : title}>
      <p className="text-[0.95rem] leading-relaxed">{blockedReason ?? message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          {blockedReason ? "Fermer" : "Annuler"}
        </Button>
        {!blockedReason && (
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        )}
      </div>
    </Modal>
  );
}
