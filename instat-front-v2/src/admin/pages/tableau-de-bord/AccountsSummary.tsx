import { Clock, UserX } from "lucide-react";
import { roleLabels } from "../../../data/roles";
import { formatNumber } from "../../../lib/format";
import type { Role } from "../../../types";
import { useAdminData } from "../../data/AdminDataContext";

const roles = Object.keys(roleLabels) as Role[];

/** Comptes : effectif par rôle, puis les points d'attention (comptes suspendus, jamais connectés). */
export default function AccountsSummary() {
  const { users } = useAdminData();
  const suspended = users.items.filter((user) => !user.active).length;
  const neverLoggedIn = users.items.filter((user) => user.active && !user.lastLogin).length;

  return (
    <>
      <dl className="text-sm">
        {roles.map((role) => (
          <div key={role} className="flex items-center justify-between gap-3 border-b border-line py-2">
            <dt>{roleLabels[role]}</dt>
            <dd className="font-semibold tabular-nums">{formatNumber(users.items.filter((user) => user.role === role).length)}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 py-2">
          <dt className="font-semibold">Total</dt>
          <dd className="font-semibold tabular-nums">{formatNumber(users.items.length)}</dd>
        </div>
      </dl>
      <dl className="mt-3 grid gap-2 text-sm">
        <div className={`flex items-center gap-2.5 border px-3 py-2 ${suspended > 0 ? "border-laterite/30 bg-laterite/[0.05]" : "border-line"}`}>
          <UserX className={`size-4 shrink-0 ${suspended > 0 ? "text-laterite" : "text-muted"}`} aria-hidden="true" />
          <dt className="flex-1">Comptes suspendus</dt>
          <dd className="font-semibold tabular-nums">{formatNumber(suspended)}</dd>
        </div>
        <div className="flex items-center gap-2.5 border border-line px-3 py-2">
          <Clock className="size-4 shrink-0 text-muted" aria-hidden="true" />
          <dt className="flex-1">Jamais connectés</dt>
          <dd className="font-semibold tabular-nums">{formatNumber(neverLoggedIn)}</dd>
        </div>
      </dl>
    </>
  );
}
