import Avatar from "../../../components/auth/Avatar";
import { useAuth } from "../../../context/AuthContext";
import { roleLabels } from "../../../data/roles";
import Badge from "../../ui/Badge";

/** Carte d'identité en tête de « Mon compte » : avatar, nom, adresse et rôle. */
export default function AccountSummary() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="flex items-center gap-4 border border-line bg-white p-5 sm:p-6">
      <Avatar name={user.name} size="xl" />
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
