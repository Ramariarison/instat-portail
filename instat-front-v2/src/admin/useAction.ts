import { useCallback, useRef } from "react";
import { errorMessage } from "../lib/api";
import { useToast } from "./ui/Toast";

/**
 * Lance une écriture vers l'API et l'annonce : message de réussite, ou message d'erreur du serveur
 * (« Cet élément est encore utilisé ailleurs… »). Renvoie vrai si l'écriture a réussi.
 * Un second clic pendant qu'une écriture est en cours est ignoré (pas de doublon).
 */
export function useAction() {
  const { notify } = useToast();
  const running = useRef(false);

  return useCallback(
    async (work: () => Promise<unknown>, success: string): Promise<boolean> => {
      if (running.current) return false;
      running.current = true;
      try {
        await work();
        notify(success);
        return true;
      } catch (error) {
        notify(errorMessage(error), "error");
        return false;
      } finally {
        running.current = false;
      }
    },
    [notify],
  );
}
