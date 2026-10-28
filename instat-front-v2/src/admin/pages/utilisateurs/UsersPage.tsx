import { useMemo, useRef, useState, type FormEvent } from "react";
import { UserCheck, UserPlus, UserX } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { roleDescriptions, roleLabels } from "../../../data/roles";
import { byName, formatDateTime, matches } from "../../../lib/format";
import type { Role } from "../../../types";
import { useAdminData, type UserInput } from "../../data/AdminDataContext";
import type { AdminUser } from "../../data/types";
import { usePermissions } from "../../usePermissions";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";
import Checkbox from "../../ui/Checkbox";
import ConfirmDialog from "../../ui/ConfirmDialog";
import DataTable, { cellTitleClass, RowActions, type Column } from "../../ui/DataTable";
import Field from "../../ui/Field";
import { focusFirstInvalid, FormActions } from "../../ui/form";
import { inputClass } from "../../ui/inputs";
import Modal from "../../ui/Modal";
import PageHeader, { EmptyState } from "../../ui/PageHeader";
import { Pagination, usePagination } from "../../ui/Pagination";
import SearchInput from "../../ui/SearchInput";
import { useAction } from "../../useAction";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Longueur minimale exigée par le service Auth. */
const PASSWORD_MIN = 8;
const roles = Object.keys(roleLabels) as Role[];
const roleTone = { super_admin: "green", admin: "neutral", editor: "outline" } as const;

function UserForm({
  initial,
  isSelf,
  restricted,
  others,
  onSave,
  onCancel,
}: {
  initial?: AdminUser;
  /** Ce compte est celui de la personne connectée : son rôle et son statut ne peuvent pas être modifiés. */
  isSelf: boolean;
  /** Administrateur (pas super administrateur) : comptes éditeurs seulement, sans changer de rôle ni suspendre. */
  restricted: boolean;
  /** Les autres comptes, pour refuser une adresse e-mail déjà utilisée. */
  others: AdminUser[];
  onSave: (draft: UserInput) => void;
  onCancel: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [role, setRole] = useState<Role>(initial?.role ?? "editor");
  const [active, setActive] = useState(initial?.active ?? true);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  function submit(event: FormEvent) {
    event.preventDefault();
    const next: typeof errors = {};
    const mail = email.trim();
    if (name.trim().length < 2) next.name = "Saisissez le nom complet.";
    if (!EMAIL.test(mail)) next.email = "Saisissez une adresse e-mail valide, par exemple prenom.nom@instat.mg";
    else if (others.some((user) => user.email.toLowerCase() === mail.toLowerCase()))
      next.email = "Un compte utilise déjà cette adresse e-mail.";
    if (password && password.length < PASSWORD_MIN)
      next.password = `Le mot de passe doit faire au moins ${PASSWORD_MIN} caractères.`;
    setErrors(next);
    if (Object.keys(next).length > 0) {
      focusFirstInvalid(formRef.current);
      return;
    }
    // Champ vide en modification : le mot de passe actuel est conservé.
    onSave({ name: name.trim(), email: mail, role, active, ...(password ? { password } : {}) });
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="space-y-5">
      <Field label="Nom complet" required error={errors.name}>
        {(aria) => (
          <input
            {...aria}
            className={inputClass}
            value={name}
            autoComplete="off"
            onChange={(event) => setName(event.target.value)}
          />
        )}
      </Field>
      <Field label="Adresse e-mail" required error={errors.email}>
        {(aria) => (
          <input
            {...aria}
            className={inputClass}
            type="email"
            value={email}
            autoComplete="off"
            onChange={(event) => setEmail(event.target.value)}
          />
        )}
      </Field>

      <Field
        label={initial ? "Nouveau mot de passe" : "Mot de passe initial"}
        error={errors.password}
        hint={
          initial
            ? "Laisser vide pour conserver le mot de passe actuel."
            : `Au moins ${PASSWORD_MIN} caractères, à transmettre à la personne. Sans mot de passe, le compte ne peut pas se connecter.`
        }
      >
        {(aria) => (
          <input
            {...aria}
            className={inputClass}
            type="password"
            value={password}
            autoComplete="new-password"
            onChange={(event) => setPassword(event.target.value)}
          />
        )}
      </Field>

      <fieldset>
        <legend className="text-sm font-medium">
          Rôle
          <span aria-hidden="true" className="text-laterite">
            {" "}
            *
          </span>
        </legend>
        <div className="mt-1.5 space-y-2">
          {roles.map((candidate) => (
            <label
              key={candidate}
              className={`flex cursor-pointer items-start gap-3 border border-l-2 p-3 has-disabled:cursor-not-allowed has-disabled:opacity-60 ${
                role === candidate ? "border-line border-l-laterite bg-paddy-soft/40" : "border-line hover:border-l-rule"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={candidate}
                checked={role === candidate}
                disabled={isSelf || (restricted && candidate !== "editor")}
                onChange={() => setRole(candidate)}
                className="mt-1 size-4 shrink-0 accent-paddy"
              />
              <span>
                <span className="block font-display text-[1.07rem] leading-snug">{roleLabels[candidate]}</span>
                <span className="block text-sm text-muted">{roleDescriptions[candidate]}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Checkbox
        label="Compte actif"
        hint="Un compte désactivé ne peut plus se connecter, mais il est conservé."
        checked={active}
        disabled={isSelf || restricted}
        onChange={(event) => setActive(event.target.checked)}
      />

      {restricted && !isSelf && (
        <p className="text-sm text-muted">
          En tant qu'administrateur, vous gérez les comptes éditeurs. Changer un rôle ou suspendre un compte relève du
          super administrateur.
        </p>
      )}

      {isSelf && (
        <p className="text-sm text-muted">
          C'est votre compte : vous ne pouvez pas modifier votre propre rôle ni le désactiver.
        </p>
      )}

      <FormActions onCancel={onCancel} />
    </form>
  );
}

export default function UsersPage() {
  const { users } = useAdminData();
  const { user: me } = useAuth();
  const { canCreate, canUpdate, canDelete } = usePermissions("users");
  const run = useAction();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [editing, setEditing] = useState<AdminUser | "new" | null>(null);
  const [deleting, setDeleting] = useState<AdminUser | null>(null);

  const rows = useMemo(
    () =>
      users.items
        .filter((user) => (!roleFilter || user.role === roleFilter) && matches(query, user.name, user.email))
        .sort(byName),
    [users.items, query, roleFilter],
  );
  const pager = usePagination(rows, 10, `${query}|${roleFilter}`);

  const isSelf = (user: AdminUser) => user.id === me?.id;
  // Le super administrateur gère tous les comptes ; l'administrateur, les comptes éditeurs (et le sien).
  const superAdmin = me?.role === "super_admin";
  const manageable = (user: AdminUser) => superAdmin || user.role === "editor" || isSelf(user);

  function toggleActive(user: AdminUser) {
    void run(
      () => users.update(user.id, { active: !user.active }),
      user.active ? `Le compte de ${user.name} est désactivé.` : `Le compte de ${user.name} est réactivé.`,
    );
  }

  const columns: Column<AdminUser>[] = [
    {
      key: "user",
      header: "Utilisateur",
      cell: (u) => (
        <div>
          <span className={cellTitleClass}>{u.name}</span>
          {isSelf(u) && (
            <span className="ml-2">
              <Badge tone="outline">Vous</Badge>
            </span>
          )}
          <span className="block font-mono text-xs text-muted">{u.email}</span>
        </div>
      ),
    },
    { key: "role", header: "Rôle", cell: (u) => <Badge tone={roleTone[u.role]}>{roleLabels[u.role]}</Badge> },
    {
      key: "status",
      header: "Statut",
      cell: (u) => <Badge tone={u.active ? "green" : "outline"}>{u.active ? "Actif" : "Désactivé"}</Badge>,
    },
    {
      key: "login",
      header: "Dernière connexion",
      cell: (u) =>
        u.lastLogin ? (
          <span className="font-mono text-xs whitespace-nowrap text-muted">{formatDateTime(u.lastLogin)}</span>
        ) : (
          <span className="text-sm text-muted">Jamais</span>
        ),
    },
    ...(canUpdate || canDelete
      ? [
          {
            key: "actions",
            header: "Actions",
            align: "right" as const,
            cell: (u: AdminUser) => (
              <RowActions
                label={u.name}
                extra={
                  canUpdate && superAdmin && !isSelf(u) ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`${u.active ? "Désactiver" : "Réactiver"} : ${u.name}`}
                      onClick={() => toggleActive(u)}
                    >
                      {u.active ? (
                        <UserX className="size-4" aria-hidden="true" />
                      ) : (
                        <UserCheck className="size-4" aria-hidden="true" />
                      )}
                      {u.active ? "Désactiver" : "Réactiver"}
                    </Button>
                  ) : undefined
                }
                onEdit={canUpdate && manageable(u) ? () => setEditing(u) : undefined}
                onDelete={canDelete && !isSelf(u) ? () => setDeleting(u) : undefined}
              />
            ),
          },
        ]
      : []),
  ];

  async function save(draft: UserInput) {
    if (!editing) return;
    const saved =
      editing === "new"
        ? await run(() => users.add(draft), "Compte créé.")
        : await run(() => users.update(editing.id, draft), "Compte modifié.");
    if (saved) setEditing(null);
  }

  return (
    <>
      <PageHeader
        title="Utilisateurs"
        count={users.items.length}
        description={
          superAdmin
            ? "Les personnes qui peuvent se connecter au back-office, avec leur rôle."
            : "Les personnes qui peuvent se connecter au back-office. Vous gérez les comptes éditeurs."
        }
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => setEditing("new")}>
              <UserPlus className="size-4" aria-hidden="true" />
              Nouvel utilisateur
            </Button>
          )
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <SearchInput value={query} onChange={setQuery} label="Rechercher un utilisateur" placeholder="Nom ou e-mail…" />
        <select
          aria-label="Filtrer par rôle"
          className={`${inputClass} sm:w-56`}
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value as Role | "")}
        >
          <option value="">Tous les rôles</option>
          {roles.map((role) => (
            <option key={role} value={role}>
              {roleLabels[role]}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        caption="Liste des utilisateurs"
        columns={columns}
        rows={pager.pageItems}
        empty={<EmptyState title="Aucun utilisateur trouvé">Modifiez votre recherche ou le filtre.</EmptyState>}
      />
      <Pagination {...pager} onChange={pager.setPage} />

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Nouvel utilisateur" : "Modifier l'utilisateur"}
      >
        {editing !== null && (
          <UserForm
            initial={editing === "new" ? undefined : editing}
            isSelf={editing !== "new" && isSelf(editing)}
            restricted={!superAdmin}
            others={users.items.filter((user) => editing === "new" || user.id !== editing.id)}
            onSave={save}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer le compte"
        message={`Supprimer le compte de ${deleting?.name ?? ""} ? Cette personne ne pourra plus se connecter. Pour garder le compte sans l'autoriser à se connecter, désactivez-le plutôt. La suppression est définitive.`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await run(() => users.remove(deleting.id), "Compte supprimé.");
          setDeleting(null);
        }}
      />
    </>
  );
}
