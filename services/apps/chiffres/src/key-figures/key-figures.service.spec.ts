import { periodLabel } from "./key-figures.service";

describe("periodLabel", () => {
  it("donne l'année d'une valeur annuelle", () => {
    expect(periodLabel(2024, null)).toBe("2024");
  });

  it("donne le mois et l'année d'une valeur mensuelle", () => {
    expect(periodLabel(2026, 3)).toBe("mars 2026");
    expect(periodLabel(2025, 12)).toBe("décembre 2025");
  });
});
