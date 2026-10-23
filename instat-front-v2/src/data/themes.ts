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

export const themes: Theme[] = [
  { id: "agriculture", label: "Agriculture, élevage et pêche", icon: Wheat },
  { id: "education", label: "Éducation", icon: GraduationCap },
  { id: "sante", label: "Santé", icon: HeartPulse },
  { id: "eau", label: "Eau et assainissement", icon: Droplets },
  { id: "environnement", label: "Environnement", icon: Leaf },
  { id: "energie", label: "Énergie", icon: Zap },
  { id: "tourisme", label: "Tourisme et artisanat", icon: Plane },
  { id: "commerce", label: "Commerce et consommation", icon: ShoppingBasket },
  { id: "travail", label: "Travail et emploi", icon: Briefcase },
  { id: "population", label: "Démographie et population", icon: Users },
  { id: "comptes", label: "Comptes nationaux", icon: Landmark },
  { id: "menages", label: "Conditions de vie des ménages", icon: House },
];
