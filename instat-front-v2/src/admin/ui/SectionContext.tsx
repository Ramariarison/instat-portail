import { createContext, useContext } from "react";

/** Rubrique du menu où se trouve la page : alimente le repère au-dessus du titre (« 1.3 · Gestion des publications »). */
export interface AdminSection {
  /** Numéro de rubrique et de page dans le menu, par ex. « 1.3 ». */
  number: string;
  group: string;
}

export const AdminSectionContext = createContext<AdminSection | null>(null);

export function useAdminSection(): AdminSection | null {
  return useContext(AdminSectionContext);
}
