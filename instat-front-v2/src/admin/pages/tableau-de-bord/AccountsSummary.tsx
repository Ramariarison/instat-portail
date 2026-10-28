import { roleLabels } from "../../../data/roles";
import { formatNumber } from "../../../lib/format";
import type { Role } from "../../../types";
import { useAdminData } from "../../data/AdminDataContext";

const roles = Object.keys(roleLabels) as Role[];

/** Comptes : effectif par rôle, comptes suspendus, comptes qui ne se sont jamais connectés. */
export default function AccountsSummary() {
  const { users } = useAdminData();
  const suspended = users.items.filter((user) => !user.active).length;
  const neverLoggedIn = users.items.filter((user) => user.active && !user.lastLogin).length;

  return (
    <dl className="text-[0.95rem]">
      {roles.map((role) => (
        <div key={role} className="flex items-baseline gap-3 border-b border-line py-2">
          <dt>{roleLabels[role]}</dt>
          <span aria-hidden="true" className="leader" />
          <dd className="font-mono text-xs tabular-nums">{formatNumber(users.items.filter((user) => user.role === role).length)}</dd>
        </div>
      ))}
      <div className="flex items-baseline gap-3 border-b border-line py-2">
        <dt className="text-muted">Comptes suspendus</dt>
        <span aria-hidden="true" className="leader" />
        <dd className="font-mono text-xs tabular-nums">{formatNumber(suspended)}</dd>
      </div>
      <div className="flex items-baseline gap-3 py-2">
        <dt className="text-muted">Jamais connectés</dt>
        <span aria-hidden="true" className="leader" />
        <dd className="font-mono text-xs tabular-nums">{formatNumber(neverLoggedIn)}</dd>
      </div>
    </dl>
  );
}
