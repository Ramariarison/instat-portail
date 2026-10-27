import {
  Briefcase,
  Droplets,
  GraduationCap,
  HeartPulse,
  House,
  Landmark,
  Leaf,
  Plane,
  ShoppingBasket,
  Users,
  Wheat,
  Zap,
} from "lucide-react";
import type { Theme } from "../types";

/** `id` = alias de la thématique dans le back-office : le lien mène à #/themes/<id>. */
export const themes: Theme[] = [
  { id: "agriculture-elevage-et-peche", label: "Agriculture, élevage et pêche", icon: Wheat },
  { id: "education", label: "Éducation", icon: GraduationCap },
  { id: "sante", label: "Santé", icon: HeartPulse },
  { id: "eau-assainissement-et-hygiene", label: "Eau et assainissement", icon: Droplets },
  { id: "environnement", label: "Environnement", icon: Leaf },
  { id: "energie-et-hydrocarbures", label: "Énergie", icon: Zap },
  { id: "tourisme-et-artisanat", label: "Tourisme et artisanat", icon: Plane },
  { id: "commerce-et-consommation", label: "Commerce et consommation", icon: ShoppingBasket },
  { id: "travail", label: "Travail et emploi", icon: Briefcase },
  { id: "demographie-et-population", label: "Démographie et population", icon: Users },
  { id: "comptes-nationaux", label: "Comptes nationaux", icon: Landmark },
  { id: "conditions-de-vie-des-menages", label: "Conditions de vie des ménages", icon: House },
];
