import type { AdminUser } from "@app/common";

/** Mot de passe des comptes de démonstration (affiché dans la fenêtre de connexion du front). */
export const DEMO_PASSWORD = "demo1234";

/** Mêmes comptes que instat-front-v2/src/admin/data/seed.ts. */
export const demoUsers: AdminUser[] = [
  { id: "demo-1", name: "Super admin démo", email: "superadmin@instat.demo", role: "super_admin", active: true, lastLogin: "2026-10-09T08:12:00" },
  { id: "demo-2", name: "Admin démo", email: "admin@instat.demo", role: "admin", active: true, lastLogin: "2026-10-08T15:40:00" },
  { id: "demo-3", name: "Éditeur démo", email: "editeur@instat.demo", role: "editor", active: true, lastLogin: "2026-10-07T10:05:00" },
  { id: "user-4", name: "Voahangy Exemple", email: "voahangy@instat.demo", role: "editor", active: true, lastLogin: "2026-09-30T09:30:00" },
  { id: "user-5", name: "Tahiry Exemple", email: "tahiry@instat.demo", role: "admin", active: false },
];
