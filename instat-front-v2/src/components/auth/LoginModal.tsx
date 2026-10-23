import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ArrowRight, CircleAlert, Eye, EyeOff, LoaderCircle, X } from "lucide-react";
import { SHOW_DEMO_ACCOUNTS } from "../../config";
import { useAuth } from "../../context/AuthContext";
import { roleLabels } from "../../data/roles";
import { errorMessage } from "../../lib/api";
import { demoAccounts, InvalidCredentialsError } from "../../services/authService";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

const inputClass =
  "mt-2 h-12 w-full border border-rule bg-white px-3.5 text-[0.95rem] placeholder:text-muted/60 hover:border-muted focus-visible:border-paddy focus-visible:shadow-[inset_0_0_0_1px_var(--color-paddy)] focus-visible:outline-none aria-[invalid=true]:border-laterite";

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const { login } = useAuth();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const errorId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // <dialog> natif : piège le focus, ferme avec Échap et rend le reste de la page inerte.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      emailRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function reset() {
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setError(null);
    setLoading(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      reset();
      onClose();
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
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClose={() => {
        reset();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(30rem,calc(100vw-2rem))] overflow-y-auto border-0 bg-paper p-0 text-ink shadow-[0_24px_60px_-20px_rgba(9,42,31,0.55)] backdrop:bg-paddy-night/70 backdrop:backdrop-blur-[2px]"
    >
      {/* En-tête : même bandeau que l'accueil (papier millimétré, signet laterite). */}
      <div className="on-dark graph-paper relative bg-paddy-deep px-6 pt-5 pb-7 text-white sm:px-8">
        <span aria-hidden="true" className="absolute top-0 left-6 h-[3px] w-14 bg-laterite sm:left-8" />
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-xs text-white/65">Espace réservé · INSTAT</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la fenêtre de connexion"
            className="-mr-2 inline-flex size-9 shrink-0 items-center justify-center text-white/80 hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <h2 id={titleId} className="mt-4 font-display text-[2.4rem] leading-none font-normal tracking-[-0.01em]">
          Connexion
        </h2>
        <p id={descriptionId} className="mt-3 max-w-sm text-[0.95rem] leading-relaxed text-white/75">
          Pour les super administrateurs, administrateurs et éditeurs du portail.
        </p>
      </div>

      <div className="px-6 py-7 sm:px-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="text-sm font-medium">
              Adresse e-mail professionnelle
            </label>
            <input
              ref={emailRef}
              id="login-email"
              type="email"
              required
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
              <a
                href="#/mot-de-passe-oublie"
                className="text-sm text-paddy underline decoration-paddy/30 underline-offset-4 hover:decoration-paddy"
              >
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
                className="absolute top-2 right-1.5 inline-flex h-10 items-center gap-1.5 px-2.5 font-mono text-xs text-muted hover:bg-paddy-soft hover:text-ink"
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
            className="group inline-flex h-12 w-full items-center justify-between bg-paddy-deep px-5 font-medium text-white hover:bg-paddy disabled:cursor-wait disabled:opacity-85"
          >
            <span>{loading ? "Connexion en cours…" : "Se connecter"}</span>
            {loading ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            )}
          </button>
        </form>

        <p className="mt-5 text-sm leading-relaxed text-muted">
          Pas encore de compte ? Les accès sont créés par un super administrateur de l'INSTAT.
        </p>

        {SHOW_DEMO_ACCOUNTS && (
          <div className="mt-7">
            <p className="flex items-baseline justify-between border-b-2 border-ink pb-2 font-mono text-xs">
              <span>Comptes de démonstration</span>
              <span className="text-muted">données d'exemple</span>
            </p>
            <ul>
              {demoAccounts.map((account) => {
                const selected = email === account.email;
                return (
                  <li key={account.id} className="border-b border-line">
                    <button
                      type="button"
                      onClick={() => {
                        setEmail(account.email);
                        setPassword(account.password);
                        setError(null);
                      }}
                      aria-pressed={selected}
                      className={`group flex w-full items-center gap-3 border-l-2 py-2.5 pr-2 pl-3 text-left ${
                        selected ? "border-laterite bg-white" : "border-transparent hover:bg-white"
                      }`}
                    >
                      <span className="flex-1">
                        <span className="block text-[0.95rem] font-medium">{roleLabels[account.role]}</span>
                        <span className="block font-mono text-xs text-muted">{account.email}</span>
                      </span>
                      <span className={`font-mono text-xs ${selected ? "text-laterite" : "text-paddy group-hover:underline"}`}>
                        {selected ? "Rempli" : "Remplir"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </dialog>
  );
}
