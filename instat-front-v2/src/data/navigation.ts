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

/**
 * Les rubriques « Thèmes et données » mènent à #/themes/<slug> : alias d'une thématique du back-office,
 * ou groupe de secteurs défini dans data/collections.ts.
 */
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
          { label: "Enquêtes et recensements", href: "#/themes/enquetes-recensements" },
          { label: "Études et analyses", href: "#/themes/etudes-analyses" },
          { label: "Annuaires statistiques", href: "#/themes/annuaires" },
          { label: "Comptes nationaux", href: "#/themes/comptes-nationaux" },
          { label: "Économie", href: "#/themes/economie" },
          { label: "Démographie et population", href: "#/themes/demographie-et-population" },
          { label: "Conditions de vie des ménages", href: "#/themes/conditions-de-vie-des-menages" },
        ],
      },
      {
        title: "Publications sectorielles",
        links: [
          { label: "Agriculture, élevage et pêche", href: "#/themes/agriculture-elevage-et-peche" },
          { label: "Éducation", href: "#/themes/education" },
          { label: "Santé", href: "#/themes/sante" },
          { label: "Eau, assainissement et hygiène", href: "#/themes/eau-assainissement-et-hygiene" },
          { label: "Environnement", href: "#/themes/environnement" },
          { label: "Énergie et hydrocarbures", href: "#/themes/energie-et-hydrocarbures" },
          { label: "Tourisme et artisanat", href: "#/themes/tourisme-et-artisanat" },
          { label: "Commerce et consommation", href: "#/themes/commerce-et-consommation" },
          { label: "Travail", href: "#/themes/travail" },
        ],
      },
      {
        title: "Bases de données",
        links: [
          { label: "Indice des prix à la consommation", href: "#/themes/ipc" },
          { label: "Comptes nationaux", href: "#/themes/comptes-nationaux" },
          { label: "Impact de la COVID-19", href: "#/themes/impact-de-la-covid-19" },
          { label: "RGPH-3", href: "#/themes/rgph-3" },
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
