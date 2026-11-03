import { useAuth } from "../../../context/AuthContext";
import { roleLabels } from "../../../data/roles";
import { initials } from "../../../lib/format";
import Badge from "../../ui/Badge";

/** Carte d'identité en tête de « Mon compte » : initiales, nom, adresse et rôle. */
export default function AccountSummary() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="flex items-center gap-4 border border-line bg-white p-5 sm:p-6">
      <span aria-hidden="true" className="flex size-14 shrink-0 items-center justify-center bg-paddy-deep text-xl font-semibold text-white">
        {initials(user.name)}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xl font-semibold">{user.name}</p>
        <p className="truncate text-sm text-muted">{user.email}</p>
      </div>
      <div className="ml-auto hidden sm:block">
        <Badge tone="green">{roleLabels[user.role]}</Badge>
      </div>
    </div>
  );
}
