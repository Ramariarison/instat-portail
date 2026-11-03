import { ChevronDown } from "lucide-react";
import { roleLabels } from "../../data/roles";
import { demoAccounts } from "../../services/authService";
import type { Credentials } from "./LoginForm";

/**
 * Comptes de démonstration (SEED_DEMO=true), repliés par défaut sous le formulaire :
 * un clic remplit l'e-mail et le mot de passe.
 */
export default function DemoAccounts({ selected, onPick }: { selected?: string; onPick: (credentials: Credentials) => void }) {
  return (
    <details className="group border border-dashed border-rule">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm text-muted hover:text-ink [&::-webkit-details-marker]:hidden">
        <span>
          Comptes de démonstration <span className="text-xs">(données d'exemple)</span>
        </span>
        <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <ul className="border-t border-dashed border-rule">
        {demoAccounts.map((account) => {
          const active = selected === account.email;
          return (
            <li key={account.id}>
              <button
                type="button"
                onClick={() => onPick({ email: account.email, password: account.password })}
                aria-pressed={active}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-paddy-soft/60 ${active ? "bg-paddy-soft/60" : ""}`}
              >
                <span className="flex-1">
                  <span className="block text-sm font-medium">{roleLabels[account.role]}</span>
                  <span className="block text-xs text-muted">{account.email}</span>
                </span>
                <span className={`text-xs ${active ? "text-paddy" : "text-muted"}`}>{active ? "Rempli" : "Remplir"}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
