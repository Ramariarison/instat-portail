import {
  BookOpen,
  Database,
  GraduationCap,
  IdCard,
  ScrollText,
  ShieldCheck,
  TrendingUp,
  Handshake,
} from "lucide-react";
import type { ServiceLink } from "../types";

export const databases: ServiceLink[] = [
  {
    id: "ipc",
    label: "Indice des prix à la consommation",
    description: "Suivi des prix et de l'inflation, mois après mois.",
    icon: TrendingUp,
    href: "#/themes/ipc",
  },
  {
    id: "comptes-nationaux",
    label: "Comptes nationaux",
    description: "Les grands agrégats de l'économie malgache.",
    icon: Database,
    href: "#/themes/comptes-nationaux",
  },
  {
    id: "covid-19",
    label: "Impact de la COVID-19",
    description: "Effets de la crise sur l'économie, les entreprises et les ménages.",
    icon: BookOpen,
    href: "#/themes/impact-de-la-covid-19",
  },
];

export const services: ServiceLink[] = [
  { id: "prestations", label: "Prestations de l'INSTAT", description: "Ce que l'institut peut produire pour vous.", icon: Handshake, href: "#/prestations" },
  { id: "nomenclatures", label: "Nomenclatures", description: "Classifications et codes de référence.", icon: ScrollText, href: "#/nomenclatures" },
  { id: "carte-statistique", label: "Carte statistique", description: "Démarches pour obtenir votre carte.", icon: IdCard, href: "#/carte-statistique" },
  { id: "formation", label: "Formation et stages", description: "Offres pour étudiants et professionnels.", icon: GraduationCap, href: "#/formation-stages" },
  { id: "stac", label: "Lutte anti-corruption", description: "Signaler et se renseigner auprès de la STAC.", icon: ShieldCheck, href: "#/stac" },
];
