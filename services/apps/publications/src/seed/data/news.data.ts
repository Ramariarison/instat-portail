/**
 * DONNÉES DE DÉMONSTRATION (SEED_DEMO=true) : les sept premières reprises de instat-front-v2/src/data/news.ts (mêmes
 * identifiants), puis trois de plus. Chacune a sa page (#/actualites/<id>) et son image (/demo/actualites/<id>.jpg,
 * servie par la passerelle). Les textes restent généraux : ni chiffres, ni noms de personnes.
 */

export interface NewsSeed {
  id: string;
  title: string;
  /** AAAA-MM-JJ ; absente : actualité sans date, affichée en dernier. */
  date?: string;
  dateLabel?: string;
  context?: string;
  /** Texte de la page, un paragraphe par élément. */
  body: string[];
}

export const newsSeeds: NewsSeed[] = [
  {
    id: "rgph-4-formation",
    title: "Formation des formateurs du quatrième recensement général de la population (RGPH-4)",
    date: "2026-10-15",
    dateLabel: "15 octobre 2026",
    context: "Directions interrégionales",
    body: [
      "L'INSTAT a ouvert la formation des formateurs du quatrième recensement général de la population et de l'habitation. Les cadres des directions interrégionales y apprennent les concepts, les questionnaires et les procédures de collecte qu'ils transmettront ensuite aux superviseurs et aux agents recenseurs.",
      "La formation alterne exposés, exercices en salle et mises en situation sur le terrain. Une place importante est donnée à la collecte sur tablette et à la cartographie des zones de dénombrement, préparées au cours des mois précédents.",
      "Cette étape conditionne la qualité des données du recensement : chaque formateur sera responsable de la formation des équipes de sa région.",
    ],
  },
  {
    id: "basan",
    title: "Convention de partenariat technique entre le Groupe Basan et l'INSTAT",
    date: "2026-09-02",
    dateLabel: "2 septembre 2026",
    context: "Anosy",
    body: [
      "L'INSTAT a signé une convention de partenariat technique avec le Groupe Basan, en présence des autorités de la région Anosy.",
      "La convention prévoit l'échange de données utiles à la connaissance de l'économie régionale, l'appui méthodologique de l'INSTAT pour les enquêtes menées dans la région et la formation de cadres locaux à la production et à l'analyse statistiques.",
      "Ce partenariat s'inscrit dans la volonté de l'INSTAT de rapprocher la statistique publique des acteurs économiques des régions et de mieux couvrir les territoires.",
    ],
  },
  {
    id: "epm-2026-collecte",
    title: "Lancement de la collecte de l'Enquête permanente auprès des ménages 2026",
    date: "2026-07-06",
    dateLabel: "6 juillet 2026",
    context: "Les 23 régions",
    body: [
      "Les équipes de l'INSTAT ont commencé la collecte de l'Enquête permanente auprès des ménages (EPM) 2026 dans les 23 régions du pays.",
      "Pendant plusieurs semaines, les enquêteurs rendront visite aux ménages tirés au sort pour les interroger sur leur consommation, leurs revenus, leur logement, l'éducation, la santé et l'emploi de leurs membres. Les réponses sont confidentielles et ne servent qu'à des fins statistiques.",
      "L'INSTAT remercie par avance les ménages pour leur accueil. Les résultats permettront de mettre à jour le profil de la pauvreté à Madagascar.",
    ],
  },
  {
    id: "rgph-4",
    title: "Présentation du document de projet (PRODOC) du RGPH-4",
    date: "2026-05-12",
    dateLabel: "12 mai 2026",
    context: "Avec l'UNFPA et la Banque mondiale",
    body: [
      "L'INSTAT a présenté aux partenaires techniques et financiers le document de projet du quatrième recensement général de la population et de l'habitation (RGPH-4).",
      "Le document décrit les objectifs du recensement, son calendrier, son organisation, les innovations prévues (cartographie numérique, collecte sur tablette) et le budget nécessaire. Il a été élaboré avec l'appui du Fonds des Nations unies pour la population (UNFPA) et de la Banque mondiale.",
      "La séance a permis de recueillir les observations des partenaires et de préparer la mobilisation des financements.",
    ],
  },
  {
    id: "interoperabilite",
    title: "Lancement officiel de l'interopérabilité nationale",
    date: "2026-04-28",
    dateLabel: "28 avril 2026",
    body: [
      "Le cadre national d'interopérabilité des systèmes d'information de l'administration a été officiellement lancé. Il permet aux administrations d'échanger des données de façon sécurisée, selon des règles et des formats communs.",
      "Pour la statistique publique, l'interopérabilité facilite l'accès aux données administratives (état civil, éducation, santé, fiscalité) qui complètent les enquêtes et les recensements, tout en garantissant la confidentialité des informations individuelles.",
      "L'INSTAT participera aux groupes de travail chargés de définir les référentiels communs, comme les nomenclatures d'activités et le découpage administratif.",
    ],
  },
  {
    id: "mics-7-validation",
    title: "Atelier de validation des résultats de l'enquête MICS-7",
    date: "2026-02-12",
    dateLabel: "12 février 2026",
    context: "Avec l'UNICEF",
    body: [
      "L'INSTAT a réuni les ministères concernés, l'UNICEF et les partenaires du secteur social pour valider les résultats de la septième enquête par grappes à indicateurs multiples (MICS-7).",
      "Les participants ont examiné les principaux indicateurs sur la santé, la nutrition, l'éducation et la protection des enfants et des femmes, ainsi que sur l'accès à l'eau et à l'assainissement, avant leur publication.",
      "Le rapport final a été mis en ligne à la suite de l'atelier, accompagné de publications thématiques.",
    ],
  },
  {
    id: "producteurs-utilisateurs",
    title: "Rencontre des producteurs et utilisateurs de données",
    date: "2026-01-22",
    dateLabel: "22 et 23 janvier 2026",
    context: "Projet STATCAP-II",
    body: [
      "Pendant deux jours, producteurs et utilisateurs de statistiques se sont retrouvés pour faire le point sur l'offre de données publiques et sur les besoins des administrations, des chercheurs, des entreprises et de la société civile.",
      "Les échanges ont porté sur l'accès aux microdonnées, la diffusion en ligne, les délais de publication et la formation des utilisateurs. Les participants ont aussi découvert les nouveaux outils de diffusion de l'INSTAT, dont ce portail.",
      "La rencontre a été organisée dans le cadre du projet de renforcement des capacités statistiques STATCAP-II.",
    ],
  },
  {
    id: "jms-jas",
    title: "Célébration de la JMS et de la JAS 2025",
    date: "2025-11-20",
    dateLabel: "20 et 21 novembre 2025",
    body: [
      "L'INSTAT a célébré ensemble la Journée mondiale de la statistique (JMS) et la Journée africaine de la statistique (JAS), qui rappellent le rôle des statistiques officielles dans le débat public et les politiques de développement.",
      "Au programme : conférences, présentations des dernières publications, portes ouvertes et activités avec des élèves et des étudiants pour faire découvrir les métiers de la statistique.",
      "Ces journées ont aussi été l'occasion de remercier les ménages, les entreprises et les administrations qui répondent chaque année aux enquêtes.",
    ],
  },
  {
    id: "passation",
    title: "Passation de service au poste de Directeur général",
    date: "2025-09-10",
    dateLabel: "10 septembre 2025",
    body: [
      "La cérémonie de passation de service au poste de Directeur général de l'INSTAT s'est tenue au siège de l'institut, à Anosy, en présence des cadres et du personnel.",
      "Le Directeur général sortant a présenté le bilan des travaux menés et les grands chantiers en cours, notamment la préparation du quatrième recensement général de la population. Son successeur a présenté ses priorités pour les années à venir.",
      "Le personnel de l'INSTAT a été remercié pour son engagement au service de la statistique publique.",
    ],
  },
  {
    id: "strategie-anticorruption",
    title: "Stratégie nationale de lutte contre la corruption 2025-2030",
    body: [
      "La Stratégie nationale de lutte contre la corruption pour la période 2025-2030 fixe les orientations de l'action publique en matière de prévention, de détection et de sanction de la corruption.",
      "L'INSTAT y contribue en produisant des indicateurs de suivi, notamment à partir des questions sur la gouvernance et l'expérience des services publics posées dans ses enquêtes auprès des ménages.",
      "Le document complet est disponible auprès des institutions chargées de la lutte contre la corruption.",
    ],
  },
];
