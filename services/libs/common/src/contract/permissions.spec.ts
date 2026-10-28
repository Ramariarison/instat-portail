import { can, permissions } from "./permissions";

describe("matrice des droits (RBAC)", () => {
  it("donne tous les droits au super administrateur, y compris sur les comptes", () => {
    for (const action of ["view", "create", "update", "delete"] as const) {
      expect(can("super_admin", "users", action)).toBe(true);
      expect(can("super_admin", "publications", action)).toBe(true);
    }
  });

  it("laisse l'éditeur rédiger et saisir les données par région, sans supprimer ni valider", () => {
    expect(can("editor", "publications", "create")).toBe(true);
    expect(can("editor", "figures", "update")).toBe(true);
    expect(can("editor", "publications", "delete")).toBe(false);
    expect(can("editor", "publications", "validate")).toBe(false);
    expect(can("editor", "figures", "delete")).toBe(false);
    expect(can("editor", "thematiques", "view")).toBe(false);
  });

  it("laisse l'administrateur valider et gérer les comptes, sans en supprimer", () => {
    expect(can("admin", "publications", "validate")).toBe(true);
    expect(can("admin", "users", "create")).toBe(true);
    expect(can("admin", "users", "delete")).toBe(false);
  });

  it("refuse tout sans rôle", () => {
    expect(can(undefined, "publications", "view")).toBe(false);
  });

  it("couvre les trois rôles", () => {
    expect(Object.keys(permissions).sort()).toEqual(["admin", "editor", "super_admin"]);
  });
});
