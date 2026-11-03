import { Fragment } from "react";
import { PenLine, ShieldCheck, UserCog, type LucideIcon } from "lucide-react";
import { roleLabels } from "../../../data/roles";
import type { Role } from "../../../types";
import { useAdminData } from "../../data/AdminDataContext";
import { actionLabels, actionOrder, actionsFor, permissions, resourceGroups, type Resource } from "../../permissions";
import Badge from "../../ui/Badge";
import PageHeader, { BlockTitle } from "../../ui/PageHeader";

const roles = Object.keys(roleLabels) as Role[];

/** Cartes du haut : une icône et une ligne par rôle (le détail est dans le tableau « Droits par section »). */
const roleCards: Record<Role, { icon: LucideIcon; summary: string }> = {
  super_admin: { icon: ShieldCheck, summary: "Tous les droits, comptes et rôles compris." },
  admin: { icon: UserCog, summary: "Valide les publications et gère les référentiels." },
  editor: { icon: PenLine, summary: "Rédige les publications et saisit les données." },
};

function Rights({ role, resource }: { role: Role; resource: Resource }) {
  const granted = permissions[role][resource] ?? [];
  if (granted.length === 0) return <span className="text-xs text-muted">Aucun accès</span>;
  if (actionsFor(resource).every((action) => granted.includes(action))) return <Badge tone="green">Tous les droits</Badge>;
  return <span>{actionOrder.filter((action) => granted.includes(action)).map((action) => actionLabels[action]).join(", ")}</span>;
}

export default function RolesPage() {
  const { users } = useAdminData();
  const countOf = (role: Role) => users.items.filter((user) => user.role === role).length;

  return (
    <>
      <PageHeader
        title="Rôles et permissions"
        count={roles.length}
        description="Ce que chaque rôle peut faire dans le back-office. Le rôle d'une personne se choisit dans « Utilisateurs »."
      />

      <ul className="grid gap-4 md:grid-cols-3">
        {roles.map((role) => {
          const { icon: Icon, summary } = roleCards[role];
          const count = countOf(role);
          return (
            <li key={role} className="flex flex-col border border-line bg-white p-5">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center bg-paddy-soft text-paddy">
                  <Icon className="size-5" />
                </span>
                <h2 className="text-lg leading-tight font-semibold">{roleLabels[role]}</h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{summary}</p>
              <p className="mt-4 border-t border-line pt-3 text-sm">
                <strong className="font-semibold tabular-nums">{count}</strong> utilisateur{count > 1 ? "s" : ""}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="mt-12">
        <BlockTitle>Droits par section</BlockTitle>
      </div>
      <div className="mt-4 overflow-x-auto border border-t-2 border-line border-t-ink bg-white">
        <table className="w-full min-w-[40rem] text-left text-[0.95rem]">
          <caption className="sr-only">Droits de chaque rôle sur chaque section du back-office</caption>
          <thead className="border-b border-rule text-xs text-muted">
            <tr>
              <th scope="col" className="px-4 pt-3.5 pb-3 font-normal">
                Section
              </th>
              {roles.map((role) => (
                <th key={role} scope="col" className="px-4 pt-3.5 pb-3 font-normal">
                  {roleLabels[role]}
                </th>
              ))}
            </tr>
          </thead>
          {resourceGroups.map((group, groupIndex) => (
            <Fragment key={group.title}>
              <tbody className="divide-y divide-line border-t border-line">
                <tr className="bg-paper">
                  <th scope="colgroup" colSpan={roles.length + 1} className="px-4 py-2 text-xs font-normal text-ink">
                    <span className="mr-2 text-laterite">{groupIndex + 1}</span>
                    {group.title}
                  </th>
                </tr>
                {group.items.map((item) => (
                  <tr key={item.resource}>
                    <th scope="row" className="px-4 py-3.5 text-[1.07rem] font-semibold">
                      {item.label}
                    </th>
                    {roles.map((role) => (
                      <td key={role} className="px-4 py-3.5 align-top">
                        <Rights role={role} resource={item.resource} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Fragment>
          ))}
        </table>
      </div>

      <p className="mt-4 max-w-2xl text-xs leading-relaxed text-muted">
        Cette page présente les droits tels qu'ils sont définis dans l'interface. Les droits réels sont vérifiés côté
        serveur par le service d'authentification, à chaque requête.
      </p>
    </>
  );
}
