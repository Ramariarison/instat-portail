import { useState, type FormEvent } from "react";
import { LockKeyhole } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { roleLabels } from "../../../data/roles";
import { updateProfile } from "../../../services/authService";
import Button from "../../ui/Button";
import Field from "../../ui/Field";
import { inputClass } from "../../ui/inputs";
import { useAction } from "../../useAction";
import SettingsSection from "./SettingsSection";

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
    <SettingsSection
      title="Profil"
      description="Votre nom apparaît comme auteur de vos publications et dans l'historique de validation."
      onSubmit={submit}
      footer={
        <>
          <p className="flex items-center gap-2 text-sm text-muted">
            <LockKeyhole className="size-3.5 shrink-0" aria-hidden="true" />
            E-mail et rôle : à demander à un administrateur.
          </p>
          <Button type="submit" variant="primary" disabled={name.trim() === user.name}>
            Enregistrer
          </Button>
        </>
      }
    >
      <Field label="Nom complet" required error={error}>
        {(aria) => <input {...aria} className={inputClass} value={name} autoComplete="name" onChange={(e) => setName(e.target.value)} />}
      </Field>
      {/* Champs en lecture seule, de même hauteur que les autres : la grille reste alignée. */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Adresse e-mail">
          {(aria) => <input {...aria} className={inputClass} value={user.email} readOnly disabled />}
        </Field>
        <Field label="Rôle">
          {(aria) => <input {...aria} className={inputClass} value={roleLabels[user.role]} readOnly disabled />}
        </Field>
      </div>
    </SettingsSection>
  );
}
