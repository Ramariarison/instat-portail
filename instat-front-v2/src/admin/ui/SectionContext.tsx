import { createContext, useContext } from "react";

/** Rubrique du menu où se trouve la page : alimente le repère au-dessus du titre (« Gestion des publications »). */
export interface AdminSection {
  group: string;
}

export const AdminSectionContext = createContext<AdminSection | null>(null);

export function useAdminSection(): AdminSection | null {
  return useContext(AdminSectionContext);
}
