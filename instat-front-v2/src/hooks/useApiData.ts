import { useEffect, useState } from "react";
import { SAMPLE_DATA } from "../config";
import { api, errorMessage } from "../lib/api";

export type ApiData<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: T };

/**
 * Lecture publique d'une ressource de l'API pour la page d'accueil.
 * Avec SAMPLE_DATA (config.ts), renvoie directement les données d'exemple, sans requête.
 */
export function useApiData<T>(path: string, sample: T): ApiData<T> {
  const [state, setState] = useState<ApiData<T>>(SAMPLE_DATA ? { status: "ready", data: sample } : { status: "loading" });

  useEffect(() => {
    if (SAMPLE_DATA) return;
    const controller = new AbortController();
    setState({ status: "loading" });
    api.get<T>(path, controller.signal).then(
      (data) => setState({ status: "ready", data }),
      (error: unknown) => {
        if (!controller.signal.aborted) setState({ status: "error", message: errorMessage(error, "Données indisponibles.") });
      },
    );
    return () => controller.abort();
  }, [path]);

  return state;
}
