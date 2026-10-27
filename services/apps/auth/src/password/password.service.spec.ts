import { PasswordService } from "./password.service";

describe("PasswordService", () => {
  const passwords = new PasswordService();

  beforeAll(() => passwords.onModuleInit());

  it("reconnaît le bon mot de passe et refuse un autre", async () => {
    const hash = await passwords.hash("motdepasse-test");
    expect(hash.startsWith("scrypt$")).toBe(true);
    await expect(passwords.verify("motdepasse-test", hash)).resolves.toBe(true);
    await expect(passwords.verify("autre-chose", hash)).resolves.toBe(false);
  });

  it("ne produit jamais deux fois la même empreinte (sel aléatoire)", async () => {
    expect(await passwords.hash("abc12345")).not.toBe(await passwords.hash("abc12345"));
  });

  it("refuse un compte sans mot de passe enregistré", async () => {
    await expect(passwords.verify("nimporte", null)).resolves.toBe(false);
  });
});
