import { Fragment } from "react";
import { roleDescriptions, roleLabels } from "../../../data/roles";
import type { Role } from "../../../types";
import { useAdminData } from "../../data/AdminDataContext";
import { actionLabels, actionOrder, permissions, resourceGroups, type Resource } from "../../permissions";
import Badge from "../../ui/Badge";
import PageHeader, { BlockTitle } from "../../ui/PageHeader";

const roles = Object.keys(roleLabels) as Role[];

function Rights({ role, resource }: { role: Role; resource: Resource }) {
  const granted = permissions[role][resource] ?? [];
  if (granted.length === 0) return <span className="font-mono text-xs text-muted">Aucun accès</span>;
  if (granted.length === actionOrder.length) return <Badge tone="green">Tous les droits</Badge>;
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

      <ol className="grid border-t-2 border-ink md:grid-cols-3">
        {roles.map((role, index) => (
          <li
            key={role}
            className="flex flex-col border-b border-line bg-white p-5 sm:p-6 md:border-b-0 md:border-l md:first:border-l-0"
          >
            <BlockTitle number={String(index + 1).padStart(2, "0")}>{roleLabels[role]}</BlockTitle>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{roleDescriptions[role]}</p>
            <p className="mt-auto flex items-baseline gap-2 border-t border-line pt-4">
              <span className="font-display text-[2.6rem] leading-none font-light tabular-nums">{countOf(role)}</span>
              <span className="font-mono text-xs text-muted">utilisateur{countOf(role) > 1 ? "s" : ""}</span>
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-12">
        <BlockTitle>Droits par section</BlockTitle>
      </div>
      <div className="mt-4 overflow-x-auto border border-t-2 border-line border-t-ink bg-white">
        <table className="w-full min-w-[40rem] text-left text-[0.95rem]">
          <caption className="sr-only">Droits de chaque rôle sur chaque section du back-office</caption>
          <thead className="border-b border-rule font-mono text-xs text-muted">
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
                  <th scope="colgroup" colSpan={roles.length + 1} className="px-4 py-2 font-mono text-xs font-normal text-ink">
                    <span className="mr-2 text-laterite">{groupIndex + 1}</span>
                    {group.title}
                  </th>
                </tr>
                {group.items.map((item) => (
                  <tr key={item.resource}>
                    <th scope="row" className="px-4 py-3.5 font-display text-[1.07rem] font-normal">
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

      <p className="mt-4 max-w-2xl font-mono text-xs leading-relaxed text-muted">
        Cette page présente les droits tels qu'ils sont définis dans l'interface. Les droits réels sont vérifiés côté
        serveur par le service d'authentification, à chaque requête.
      </p>
    </>
  );
}
