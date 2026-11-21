import { Mail, ShieldCheck } from "lucide-react";
import Avatar from "../../../components/auth/Avatar";
import { useAuth } from "../../../context/AuthContext";
import { roleLabels } from "../../../data/roles";

/** Carte d'identité en tête de « Mon compte » : avatar, nom, adresse et rôle, sous un bandeau vert. */
export default function AccountSummary() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <section aria-label="Votre compte" className="overflow-hidden border border-line bg-white">
      <div
        aria-hidden="true"
        className="h-16 bg-[linear-gradient(120deg,var(--color-paddy-soft),#f0f6f2_55%,var(--color-paddy-soft))] sm:h-20"
      />
      <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:px-6 sm:pb-6">
        <div className="-mt-10">
          <Avatar name={user.name} size="xl" />
        </div>
        <div className="min-w-0 sm:pb-1">
          <p className="truncate text-xl font-semibold">{user.name}</p>
          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-muted">
            <Mail className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span className="truncate">{user.email}</span>
          </p>
        </div>
        <p className="inline-flex items-center gap-1.5 self-start rounded-full border border-paddy/20 bg-paddy-soft px-3 py-1 text-sm font-medium text-paddy-deep sm:ml-auto sm:self-auto sm:mb-1">
          <ShieldCheck className="size-4 text-paddy" strokeWidth={1.75} aria-hidden="true" />
          {roleLabels[user.role]}
        </p>
      </div>
    </section>
  );
}
