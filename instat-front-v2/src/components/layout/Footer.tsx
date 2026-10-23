import { useState, type FormEvent } from "react";
import { MapPin, Phone } from "lucide-react";
import logoInstat from "../../assets/logo-instat.png";

const footerLinks = [
  { label: "Actualités", href: "#/actualites" },
  { label: "Recrutements et appels d'offres", href: "#/recrutements" },
  { label: "Liens utiles", href: "#/liens-utiles" },
  { label: "Contact", href: "#/contact" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // À relier à l'envoi réel de la lettre d'information.
    setSubscribed(true);
    setEmail("");
  }

  return (
    <footer className="on-dark bg-paddy-night text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          {/* Le logo est sombre : il est posé sur une plaque blanche pour rester lisible sur le fond vert. */}
          <a
            href="#accueil"
            aria-label="INSTAT Madagascar, retour à l'accueil"
            className="inline-block bg-white p-3"
          >
            <img src={logoInstat} alt="" className="h-14 w-auto" />
          </a>
          <address className="mt-6 space-y-3 text-sm text-white/80 not-italic">
            <p className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                Rue Jules Ranaivo, Anosy
                <br />
                BP 485, Antananarivo 101
              </span>
            </p>
            <p className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <a href="tel:+261321108666" className="hover:underline">
                +261 32 11 086 66
              </a>
            </p>
          </address>
        </div>

        <nav aria-label="Pied de page">
          <h2 className="border-b border-white/20 pb-3 font-mono text-xs text-white/60">Liens</h2>
          <ul className="mt-4 space-y-2.5 text-[0.95rem] text-white/80">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="hover:text-white hover:underline">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="border-b border-white/20 pb-3 font-mono text-xs text-white/60">Lettre d'information</h2>
          <p className="mt-4 font-display text-2xl leading-snug">Recevez les nouvelles publications de l'INSTAT.</p>
          {subscribed ? (
            <p role="status" className="mt-4 text-sm font-medium">
              Merci, votre abonnement est pris en compte.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
              <label htmlFor="newsletter-email" className="sr-only">
                Adresse e-mail
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Votre adresse e-mail"
                className="h-11 min-w-0 flex-1 border-0 border-b border-white/40 bg-transparent px-0 text-sm placeholder:text-white/50 focus-visible:border-white"
              />
              <button type="submit" className="h-11 bg-white px-4 text-sm font-medium text-paddy-deep hover:bg-paddy-soft">
                S'abonner
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-wrap items-baseline justify-between gap-x-8 gap-y-2 px-4 py-5 font-mono text-xs text-white/60 sm:px-6 lg:px-8">
          <p>© INSTAT 2026. Tous droits réservés.</p>
          <p>Institut national de la statistique · Antananarivo, Madagascar</p>
        </div>
      </div>
    </footer>
  );
}
