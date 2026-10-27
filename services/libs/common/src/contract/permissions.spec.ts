import { can, permissions } from "./permissions";

describe("matrice des droits (RBAC)", () => {
  it("donne tous les droits au super administrateur, y compris sur les comptes", () => {
    for (const action of ["view", "create", "update", "delete"] as const) {
      expect(can("super_admin", "users", action)).toBe(true);
      expect(can("super_admin", "publications", action)).toBe(true);
    }
  });

  it("refuse à l'éditeur la suppression et tout ce qui n'est pas une publication", () => {
    expect(can("editor", "publications", "create")).toBe(true);
    expect(can("editor", "publications", "delete")).toBe(false);
    expect(can("editor", "thematiques", "view")).toBe(false);
  });

  it("refuse tout sans rôle", () => {
    expect(can(undefined, "publications", "view")).toBe(false);
  });

  it("couvre les trois rôles", () => {
    expect(Object.keys(permissions).sort()).toEqual(["admin", "editor", "super_admin"]);
  });
});
