import { kindOf } from "./publication-kind";

describe("kindOf (type affiché d'une publication)", () => {
  it.each([
    [["tbe"], "national", "Tableau de bord"],
    [["nipc"], "national", "Indice des prix"],
    [["mics", "eau"], "national", "Enquête"],
    [["annuaire"], "national", "Annuaire"],
    [["situation-economique"], "regional", "Tableau de bord régional"],
  ] as const)("secteurs %j (%s) → %s", (sectors, level, expected) => {
    expect(kindOf(level, [...sectors], "Économie")).toBe(expected);
  });

  it("prend le nom de la thématique à défaut de secteur reconnu", () => {
    expect(kindOf("national", [], "Santé")).toBe("Santé");
  });
});
