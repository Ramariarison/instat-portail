import { useRef, useState, type FormEvent } from "react";
import { changePassword } from "../../../services/authService";
import Button from "../../ui/Button";
import Field from "../../ui/Field";
import { focusFirstInvalid } from "../../ui/form";
import { inputClass } from "../../ui/inputs";
import { useAction } from "../../useAction";

/** Même règle que le service Auth. */
const PASSWORD_MIN = 8;

type Errors = Partial<Record<"current" | "next" | "confirm", string>>;

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
    <form ref={formRef} onSubmit={submit} noValidate className="space-y-5">
      <Field label="Mot de passe actuel" required error={errors.current}>
        {(aria) => (
          <input {...aria} type="password" className={inputClass} value={current} autoComplete="current-password" onChange={(e) => setCurrent(e.target.value)} />
        )}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nouveau mot de passe" required error={errors.next} hint={`Au moins ${PASSWORD_MIN} caractères.`}>
          {(aria) => (
            <input {...aria} type="password" className={inputClass} value={next} autoComplete="new-password" onChange={(e) => setNext(e.target.value)} />
          )}
        </Field>
        <Field label="Confirmer le nouveau mot de passe" required error={errors.confirm}>
          {(aria) => (
            <input {...aria} type="password" className={inputClass} value={confirm} autoComplete="new-password" onChange={(e) => setConfirm(e.target.value)} />
          )}
        </Field>
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="primary">
          Changer le mot de passe
        </Button>
      </div>
    </form>
  );
}
