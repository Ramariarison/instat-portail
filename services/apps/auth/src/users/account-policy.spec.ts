import { canCreateAccount, canDeleteAccount, canUpdateAccount } from "./account-policy";

const superAdmin = { id: "sa", role: "super_admin" as const };
const admin = { id: "ad", role: "admin" as const };
const editor = { id: "ed", role: "editor" as const, active: true };
const otherAdmin = { id: "ad2", role: "admin" as const, active: true };

describe("règles sur les comptes", () => {
  it("l'administrateur crée des éditeurs, pas des administrateurs", () => {
    expect(canCreateAccount(admin, "editor").allowed).toBe(true);
    expect(canCreateAccount(admin, "admin").allowed).toBe(false);
    expect(canCreateAccount(superAdmin, "admin").allowed).toBe(true);
  });

  it("l'administrateur modifie le nom ou l'e-mail d'un éditeur", () => {
    expect(canUpdateAccount(admin, editor, {}).allowed).toBe(true);
  });

  it("l'administrateur ne change ni le rôle ni le statut d'un éditeur", () => {
    expect(canUpdateAccount(admin, editor, { role: "admin" }).allowed).toBe(false);
    expect(canUpdateAccount(admin, editor, { active: false }).allowed).toBe(false);
  });

  it("l'administrateur ne touche pas aux autres administrateurs", () => {
    expect(canUpdateAccount(admin, otherAdmin, {}).allowed).toBe(false);
  });

  it("le super administrateur change un rôle et suspend un compte", () => {
    expect(canUpdateAccount(superAdmin, editor, { role: "admin" }).allowed).toBe(true);
    expect(canUpdateAccount(superAdmin, otherAdmin, { active: false }).allowed).toBe(true);
  });

  it("personne ne change son propre rôle ni ne se suspend", () => {
    const self = { id: "sa", role: "super_admin" as const, active: true };
    expect(canUpdateAccount(superAdmin, self, { role: "admin" })).toMatchObject({ allowed: false, code: "SELF_LOCKOUT" });
    expect(canUpdateAccount(superAdmin, self, { active: false }).allowed).toBe(false);
  });

  it("seul le super administrateur supprime, et jamais lui-même", () => {
    expect(canDeleteAccount(admin, editor).allowed).toBe(false);
    expect(canDeleteAccount(superAdmin, editor).allowed).toBe(true);
    expect(canDeleteAccount(superAdmin, { id: "sa" }).allowed).toBe(false);
  });
});
