import { useRef, useState, type FormEvent } from "react";
import { Check, Circle } from "lucide-react";
import { changePassword } from "../../../services/authService";
import Button from "../../ui/Button";
import Field from "../../ui/Field";
import { focusFirstInvalid } from "../../ui/form";
import { inputClass } from "../../ui/inputs";
import { useAction } from "../../useAction";
import SettingsSection from "./SettingsSection";

/** Même règle que le service Auth. */
const PASSWORD_MIN = 8;

type Errors = Partial<Record<"current" | "next" | "confirm", string>>;

/** Règle vérifiée pendant la saisie : coche verte une fois respectée. */
function Rule({ ok, children }: { ok: boolean; children: string }) {
  const Icon = ok ? Check : Circle;
  return (
    <li className={`flex items-center gap-2 ${ok ? "text-paddy" : "text-muted"}`}>
      <Icon className={ok ? "size-3.5" : "size-2.5"} aria-hidden="true" />
      {children}
      <span className="sr-only">{ok ? " : respecté" : " : pas encore respecté"}</span>
    </li>
  );
}

/** Changement de mot de passe : l'actuel est demandé, le nouveau est saisi deux fois. */
export default function PasswordForm() {
  const run = useAction();
  const formRef = useRef<HTMLFormElement>(null);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found: Errors = {};
    if (!current) found.current = "Saisissez votre mot de passe actuel.";
    if (next.length < PASSWORD_MIN) found.next = `Au moins ${PASSWORD_MIN} caractères.`;
    else if (next === current) found.next = "Choisissez un mot de passe différent de l'actuel.";
    if (confirm !== next) found.confirm = "Les deux saisies ne correspondent pas.";
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirstInvalid(formRef.current);
      return;
    }
    const ok = await run(() => changePassword(current, next), "Mot de passe modifié.");
    if (ok) {
      setCurrent("");
      setNext("");
      setConfirm("");
    }
  }

  return (
    <SettingsSection
      title="Mot de passe"
      description="Vous restez connecté après le changement. Utilisez un mot de passe que vous n'employez nulle part ailleurs."
      onSubmit={submit}
      formRef={formRef}
      footer={
        <Button type="submit" variant="primary" className="ml-auto">
          Changer le mot de passe
        </Button>
      }
    >
      {/* Une seule colonne : chaque champ est aligné sur le précédent, aide et erreurs sous le champ. */}
      <div className="max-w-md space-y-5">
        <Field label="Mot de passe actuel" required error={errors.current}>
          {(aria) => (
            <input {...aria} type="password" className={inputClass} value={current} autoComplete="current-password" onChange={(e) => setCurrent(e.target.value)} />
          )}
        </Field>
        <Field label="Nouveau mot de passe" required error={errors.next}>
          {(aria) => (
            <input {...aria} type="password" className={inputClass} value={next} autoComplete="new-password" onChange={(e) => setNext(e.target.value)} />
          )}
        </Field>
        <Field label="Confirmer le nouveau mot de passe" required error={errors.confirm}>
          {(aria) => (
            <input {...aria} type="password" className={inputClass} value={confirm} autoComplete="new-password" onChange={(e) => setConfirm(e.target.value)} />
          )}
        </Field>
        <ul className="space-y-1 text-sm" aria-label="Règles du nouveau mot de passe">
          <Rule ok={next.length >= PASSWORD_MIN}>{`Au moins ${PASSWORD_MIN} caractères`}</Rule>
          <Rule ok={next.length > 0 && next !== current}>Différent du mot de passe actuel</Rule>
          <Rule ok={confirm.length > 0 && confirm === next}>Les deux saisies correspondent</Rule>
        </ul>
      </div>
    </SettingsSection>
  );
}
