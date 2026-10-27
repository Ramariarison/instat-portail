import { canEdit, canTransition, nextStatus, type PublicationStatus, type WorkflowContext } from "./publication-workflow";

const editor = { id: "user-ed", role: "editor" as const };
const otherEditor = { id: "user-other", role: "editor" as const };
const admin = { id: "user-ad", role: "admin" as const };

const ctx = (status: PublicationStatus, actor: WorkflowContext["actor"] = editor, createdBy = editor.id): WorkflowContext => ({ status, createdBy, actor });

describe("workflow de validation des publications", () => {
  describe("modification", () => {
    it.each<PublicationStatus>(["draft", "returned"])("l'auteur modifie sa publication « %s »", (status) => {
      expect(canEdit(ctx(status)).allowed).toBe(true);
    });

    it.each<PublicationStatus>(["submitted", "published"])("l'auteur ne modifie plus une publication « %s »", (status) => {
      expect(canEdit(ctx(status)).allowed).toBe(false);
    });

    it("un éditeur ne modifie pas la publication d'un autre", () => {
      expect(canEdit(ctx("draft", otherEditor))).toEqual({
        allowed: false,
        reason: "Vous ne pouvez modifier que vos propres publications.",
      });
    });

    it("l'administrateur modifie tout, y compris une publication en ligne", () => {
      expect(canEdit(ctx("published", admin)).allowed).toBe(true);
    });
  });

  describe("transitions", () => {
    it("l'auteur soumet son brouillon puis sa publication renvoyée", () => {
      expect(canTransition("submit", ctx("draft")).allowed).toBe(true);
      expect(canTransition("submit", ctx("returned")).allowed).toBe(true);
      expect(nextStatus("submit")).toBe("submitted");
    });

    it("on ne soumet pas deux fois", () => {
      expect(canTransition("submit", ctx("submitted")).allowed).toBe(false);
    });

    it("un éditeur ne publie pas et ne renvoie pas", () => {
      expect(canTransition("publish", ctx("submitted")).allowed).toBe(false);
      expect(canTransition("return", ctx("submitted")).allowed).toBe(false);
    });

    it("l'administrateur publie une publication soumise, ou directement un brouillon", () => {
      expect(canTransition("publish", ctx("submitted", admin)).allowed).toBe(true);
      expect(canTransition("publish", ctx("draft", admin)).allowed).toBe(true);
      expect(nextStatus("publish")).toBe("published");
    });

    it("l'administrateur ne renvoie qu'une publication soumise", () => {
      expect(canTransition("return", ctx("submitted", admin)).allowed).toBe(true);
      expect(canTransition("return", ctx("published", admin)).allowed).toBe(false);
      expect(nextStatus("return")).toBe("returned");
    });

    it("une publication déjà en ligne ne se republie pas", () => {
      expect(canTransition("publish", ctx("published", admin)).allowed).toBe(false);
    });
  });
});
