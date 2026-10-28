import { useState, type FormEvent } from "react";
import { useAuth } from "../../../context/AuthContext";
import { roleLabels } from "../../../data/roles";
import { updateProfile } from "../../../services/authService";
import Button from "../../ui/Button";
import Field from "../../ui/Field";
import { inputClass } from "../../ui/inputs";
import { useAction } from "../../useAction";

/** Nom affiché ; l'e-mail (identifiant de connexion) et le rôle se changent par un administrateur. */
export default function ProfileForm() {
  const { user, setUser } = useAuth();
  const run = useAction();
  const [name, setName] = useState(user?.name ?? "");
  const [error, setError] = useState<string>();

  if (!user) return null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError("Saisissez votre nom complet.");
      return;
    }
    setError(undefined);
    await run(async () => setUser(await updateProfile(name.trim())), "Profil enregistré.");
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Field label="Nom complet" required error={error}>
        {(aria) => <input {...aria} className={inputClass} value={name} autoComplete="name" onChange={(e) => setName(e.target.value)} />}
      </Field>
      <dl className="grid gap-4 text-[0.95rem] sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium">Adresse e-mail</dt>
          <dd className="mt-1.5 font-mono text-sm text-muted">{user.email}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium">Rôle</dt>
          <dd className="mt-1.5 text-muted">{roleLabels[user.role]}</dd>
        </div>
      </dl>
      <p className="text-sm text-muted">Pour changer d'adresse e-mail ou de rôle, adressez-vous à un administrateur.</p>
      <div className="flex justify-end">
        <Button type="submit" variant="primary" disabled={name.trim() === user.name}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
