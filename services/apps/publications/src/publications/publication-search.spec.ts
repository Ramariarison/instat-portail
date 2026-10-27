import { containsPattern } from "./publication-search";

describe("containsPattern (recherche dans les titres)", () => {
  it("cherche le texte n'importe où dans le titre", () => {
    expect(containsPattern("NIPC")).toBe("%NIPC%");
  });

  it("prend les jokers saisis au pied de la lettre", () => {
    expect(containsPattern("50%_a\\b")).toBe("%50\\%\\_a\\\\b%");
  });
});
