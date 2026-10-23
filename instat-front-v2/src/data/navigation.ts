import type { NavItem, NavLink } from "../types";

/** Liens rapides affichés au-dessus de la barre de navigation. */
export const quickLinks: NavLink[] = [
  { label: "Data visualisation", href: "#/data-visualisation" },
  { label: "Microdonnées", href: "#/microdonnees" },
  { label: "Demande de données", href: "#/demande-de-donnees" },
  { label: "Questionnaire de satisfaction", href: "#/questionnaire-de-satisfaction" },
  { label: "Liens utiles", href: "#/liens-utiles" },
  { label: "Contact", href: "#/contact" },
];

export const mainNav: NavItem[] = [
  { label: "Accueil", href: "#accueil" },
  {
    label: "Thèmes et données",
    wide: true,
    groups: [
      {
        title: "Publications et statistiques",
        links: [
          { label: "Publications INSTAT", href: "#/publications" },
          { label: "Enquêtes et recensements", href: "#/enquetes-recensements" },
          { label: "Études et analyses", href: "#/etudes-analyses" },
          { label: "Annuaires statistiques", href: "#/annuaires" },
          { label: "Comptes nationaux", href: "#/comptes-nationaux" },
          { label: "Économie", href: "#/economie" },
          { label: "Démographie et population", href: "#/demographie" },
          { label: "Conditions de vie des ménages", href: "#/conditions-de-vie" },
        ],
      },
      {
        title: "Publications sectorielles",
        links: [
          { label: "Agriculture, élevage et pêche", href: "#/agriculture" },
          { label: "Éducation", href: "#/education" },
          { label: "Santé", href: "#/sante" },
          { label: "Eau, assainissement et hygiène", href: "#/eau" },
          { label: "Environnement", href: "#/environnement" },
          { label: "Énergie et hydrocarbures", href: "#/energie" },
          { label: "Tourisme et artisanat", href: "#/tourisme" },
          { label: "Commerce et consommation", href: "#/commerce" },
          { label: "Travail", href: "#/travail" },
        ],
      },
      {
        title: "Bases de données",
        links: [
          { label: "Indice des prix à la consommation", href: "#/ipc" },
          { label: "Comptes nationaux", href: "#/bd-comptes-nationaux" },
          { label: "Impact de la COVID-19", href: "#/covid-19" },
          { label: "RGPH-3", href: "#/rgph-3" },
          { label: "Madagascar en chiffres", href: "#chiffres" },
        ],
      },
    ],
  },
  {
    label: "Services et ressources",
    groups: [
      {
        links: [
          { label: "Prestations de l'INSTAT", href: "#/prestations" },
          { label: "Nomenclatures", href: "#/nomenclatures" },
          { label: "Carte statistique", href: "#/carte-statistique" },
          { label: "Producteurs et utilisateurs de données", href: "#/producteurs-utilisateurs" },
          { label: "Formation et stages", href: "#/formation-stages" },
          { label: "SNDS", href: "#/snds" },
          { label: "Structure de lutte anti-corruption", href: "#/stac" },
        ],
      },
    ],
  },
  {
    label: "Qui sommes-nous ?",
    groups: [
      {
        links: [
          { label: "Mot du Directeur général", href: "#/mot-du-dg" },
          { label: "Objectifs du site", href: "#/objectifs" },
          { label: "Statut", href: "#/statut" },
          { label: "Organigramme", href: "#/organigramme" },
        ],
      },
    ],
  },
  { label: "Actualités", href: "#/actualites" },
  { label: "Recrutements", href: "#/recrutements" },
];
