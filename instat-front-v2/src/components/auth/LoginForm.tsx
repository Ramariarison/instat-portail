import { useId, useState, type FormEvent } from "react";
import { ArrowRight, CircleAlert, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { errorMessage } from "../../lib/api";
import { InvalidCredentialsError } from "../../services/authService";

const inputClass =
  "mt-2 h-12 w-full border border-rule bg-white px-3.5 text-[0.95rem] placeholder:text-muted/60 hover:border-muted focus-visible:border-paddy focus-visible:shadow-[inset_0_0_0_1px_var(--color-paddy)] focus-visible:outline-none aria-[invalid=true]:border-laterite";

/** Identifiants proposés de l'extérieur (comptes de démonstration) : le formulaire se remplit. */
export interface Credentials {
  email: string;
  password: string;
}

/**
 * Formulaire de connexion : e-mail, mot de passe (affichable), message d'erreur, envoi.
 * `prefill` remplace les champs quand il change ; `onSuccess` est appelé une fois connecté.
 */
export default function LoginForm({ prefill, onSuccess }: { prefill?: Credentials; onSuccess: () => void }) {
  const { login } = useAuth();
  const errorId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Comptes de démonstration : on remplit les champs au choix d'un compte (ajustement d'état pendant le rendu).
  const [appliedPrefill, setAppliedPrefill] = useState(prefill);
  if (prefill !== appliedPrefill) {
    setAppliedPrefill(prefill);
    if (prefill) {
      setEmail(prefill.email);
      setPassword(prefill.password);
      setError(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (cause) {
      setLoading(false);
      setError(
        cause instanceof InvalidCredentialsError
          ? "Adresse e-mail ou mot de passe incorrect. Vérifiez vos informations et réessayez."
          : errorMessage(cause, "La connexion a échoué. Réessayez dans quelques instants."),
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="login-email" className="text-sm font-medium">
          Adresse e-mail professionnelle
        </label>
        <input
          id="login-email"
          type="email"
          required
          autoFocus
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          className={inputClass}
          placeholder="prenom.nom@instat.mg"
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-4">
          <label htmlFor="login-password" className="text-sm font-medium">
            Mot de passe
          </label>
          <a href="#/mot-de-passe-oublie" className="text-sm text-paddy underline decoration-paddy/30 underline-offset-4 hover:decoration-paddy">
            Mot de passe oublié ?
          </a>
        </div>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-describedby={error ? errorId : undefined}
            aria-invalid={error ? true : undefined}
            className={`${inputClass} pr-24`}
          />
          {/* Bouton texte plutôt qu'une simple icône : l'action est explicite. */}
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            aria-pressed={showPassword}
            className="absolute top-2 right-1.5 inline-flex h-10 items-center gap-1.5 px-2.5 text-xs text-muted hover:bg-paddy-soft hover:text-ink"
          >
            {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
            <span aria-hidden="true">{showPassword ? "Masquer" : "Afficher"}</span>
          </button>
        </div>
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="flex gap-2.5 border-l-[3px] border-laterite bg-laterite/[0.06] py-2.5 pr-3 pl-3 text-sm leading-relaxed text-laterite"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="group inline-flex h-12 w-full items-center justify-center gap-2 bg-paddy-deep px-5 font-medium text-white hover:bg-paddy disabled:cursor-wait disabled:opacity-85"
      >
        {loading ? "Connexion en cours…" : "Se connecter"}
        {loading ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        )}
      </button>
    </form>
  );
}
