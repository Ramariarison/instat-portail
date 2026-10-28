import { useEffect, useState } from "react";
import { api, errorMessage } from "../../../lib/api";
import type { PublicationStats } from "../../data/types";

export type StatsState = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; stats: PublicationStats };

/** Chiffres du tableau de bord, relus à chaque affichage (GET /admin/publications/stats). */
export function useDashboardStats(): StatsState {
  const [state, setState] = useState<StatsState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    api.get<PublicationStats>("/admin/publications/stats", controller.signal).then(
      (stats) => setState({ status: "ready", stats }),
      (error: unknown) => {
        if (!controller.signal.aborted) setState({ status: "error", message: errorMessage(error, "Chiffres indisponibles.") });
      },
    );
    return () => controller.abort();
  }, []);

  return state;
}
