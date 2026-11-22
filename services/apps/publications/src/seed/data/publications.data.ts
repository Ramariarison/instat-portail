/**
 * DONNÉES DE DÉMONSTRATION (SEED_DEMO=true) : reprises de instat-front-v2/src/admin/data/seed.ts et src/data/news.ts,
 * mêmes identifiants pour que le front retrouve ses repères. Ce ne sont pas des statistiques officielles : les textes
 * décrivent le contenu des publications sans avancer de chiffres.
 */

/** Champs communs : résumé (une ou deux phrases) et texte de la fiche, un paragraphe par élément. */
interface PublicationText {
  excerpt: string;
  body: string[];
}

/** Premier lot : les publications du prototype du front (avec un document joint). */
export interface BasePublicationSeed extends PublicationText {
  id: string;
  title: string;
  date: string;
  thematique: string;
  sector: string;
  region?: string;
  nipc?: boolean;
  file: string;
}

/** Second lot : au moins une publication par thématique, sans document joint. */
export interface ExtraPublicationSeed extends PublicationText {
  id: string;
  title: string;
  date: string;
  thematique: string;
  sectors: string[];
  region?: string;
}

const tbse = (region: string, year: number): PublicationText => ({
  excerpt: `Les principaux indicateurs économiques et sociaux de la région ${region} pour l'année ${year}, rassemblés en un seul document.`,
  body: [
    `Le tableau de bord socio-économique de la région ${region} réunit, pour l'année ${year}, les indicateurs disponibles sur la population, l'éducation, la santé, l'agriculture, les infrastructures et l'activité économique régionale.`,
    "Les données proviennent des services techniques déconcentrés, des directions régionales des ministères et des enquêtes de l'INSTAT. Chaque indicateur est accompagné de sa définition, de sa source et de sa période de référence, et comparé à la moyenne nationale lorsque c'est possible.",
    "Élaboré avec la direction interrégionale de l'INSTAT et les autorités régionales, ce document sert d'appui à la planification du développement régional et au suivi des programmes publics.",
  ],
});

const nipc = (month: string): PublicationText => ({
  excerpt: `Évolution des prix à la consommation des ménages en ${month}, d'un mois sur l'autre et sur un an, par fonction de consommation et par milieu.`,
  body: [
    `Le bulletin du Nouvel indice des prix à la consommation (NIPC) présente l'évolution des prix au détail observée en ${month}. Les relevés sont effectués chaque mois dans les marchés, boutiques et points de vente des principaux centres urbains de Madagascar.`,
    "Les résultats sont détaillés par fonction de consommation (produits alimentaires, boissons, habillement, logement et énergie, transport, communication, santé, enseignement), ainsi que pour le riz, produit de base dont le prix est suivi de près. Le bulletin distingue les produits locaux et importés.",
    "La variation sur un an de l'indice d'ensemble sert de mesure de l'inflation. Les séries complètes depuis l'année de base sont disponibles sur demande auprès de la Direction des statistiques économiques.",
  ],
});

const tbe = (number: number): PublicationText => ({
  excerpt: `Le numéro ${number} du Tableau de bord de l'économie fait le point sur la conjoncture : production, prix, échanges extérieurs, finances publiques et monnaie.`,
  body: [
    `Le Tableau de bord de l'économie (TBE) n° ${number} rassemble les derniers indicateurs conjoncturels de l'économie malgache. Il couvre l'activité des principaux secteurs (agriculture, industrie, mines, tourisme, transports), les prix, le commerce extérieur, les finances publiques et la situation monétaire.`,
    "Chaque domaine fait l'objet d'une courte analyse des évolutions récentes, accompagnée de tableaux et de graphiques. Les données proviennent de l'INSTAT, de la Banque centrale de Madagascar, du ministère de l'Économie et des Finances et des organismes sectoriels.",
    "Le TBE paraît plusieurs fois par an. Il s'adresse aux décideurs publics, aux opérateurs économiques, aux partenaires techniques et financiers et aux chercheurs.",
  ],
});

export const basePublicationSeeds: BasePublicationSeed[] = [
  { id: "tbe-63", title: "Tableau de bord de l'économie (TBE) n° 63", date: "2026-08-24", thematique: "Économie", sector: "tbe", file: "tbe-63.pdf", ...tbe(63) },
  { id: "nipc-2026-03", title: "Nouvel indice des prix à la consommation (NIPC), mars 2026", date: "2026-04-28", thematique: "Économie", sector: "nipc", nipc: true, file: "nipc-2026-03.pdf", ...nipc("mars 2026") },
  { id: "tbe-62", title: "Tableau de bord de l'économie (TBE) n° 62", date: "2026-04-26", thematique: "Économie", sector: "tbe", file: "tbe-62.pdf", ...tbe(62) },
  { id: "nipc-2026-02", title: "Nouvel indice des prix à la consommation (NIPC), février 2026", date: "2026-03-27", thematique: "Économie", sector: "nipc", file: "nipc-2026-02.pdf", ...nipc("février 2026") },
  {
    id: "mics-7",
    title: "Enquête par grappes à indicateurs multiples (MICS-7) 2025",
    date: "2026-02-28",
    thematique: "Conditions de vie des ménages",
    sector: "mics",
    file: "mics-7-rapport.pdf",
    excerpt: "Le rapport final de la septième enquête MICS décrit la situation des enfants et des femmes à Madagascar : santé, nutrition, éducation, protection, eau et assainissement.",
    body: [
      "L'enquête par grappes à indicateurs multiples (MICS) est réalisée par l'INSTAT avec l'appui technique et financier de l'UNICEF. Sa septième édition a été menée en 2025 auprès d'un échantillon de ménages représentatif au niveau national, par milieu de résidence et pour chacune des 23 régions.",
      "Le rapport couvre la survie et la santé de l'enfant, la nutrition, le développement de la petite enfance, l'apprentissage, la protection de l'enfant, la santé reproductive, l'accès à l'eau potable, à l'assainissement et à l'hygiène, ainsi que l'utilisation des médias et des technologies de l'information.",
      "Les indicateurs produits permettent de suivre les engagements de Madagascar au titre des Objectifs de développement durable. Les tableaux détaillés et la méthodologie de l'échantillonnage figurent en annexe.",
    ],
  },
  { id: "nipc-2026-01", title: "Nouvel indice des prix à la consommation (NIPC), janvier 2026", date: "2026-02-26", thematique: "Économie", sector: "nipc", file: "nipc-2026-01.pdf", ...nipc("janvier 2026") },
  { id: "analanjirofo-2024", title: "Tableau de bord socio-économique, région Analanjirofo 2024", date: "2026-04-26", thematique: "Économie", sector: "situation-economique", region: "Analanjirofo", file: "tbse-analanjirofo-2024.pdf", ...tbse("Analanjirofo", 2024) },
  { id: "atsinanana-2024", title: "Tableau de bord socio-économique, région Atsinanana 2024", date: "2026-04-26", thematique: "Économie", sector: "situation-economique", region: "Atsinanana", file: "tbse-atsinanana-2024.pdf", ...tbse("Atsinanana", 2024) },
  { id: "alaotra-mangoro-2024", title: "Tableau de bord socio-économique, région Alaotra-Mangoro 2024", date: "2026-04-26", thematique: "Économie", sector: "situation-economique", region: "Alaotra-Mangoro", file: "tbse-alaotra-mangoro-2024.pdf", ...tbse("Alaotra-Mangoro", 2024) },
  { id: "atsinanana-2023", title: "Tableau de bord socio-économique, région Atsinanana 2023", date: "2024-12-17", thematique: "Économie", sector: "situation-economique", region: "Atsinanana", file: "tbse-atsinanana-2023.pdf", ...tbse("Atsinanana", 2023) },
  { id: "alaotra-mangoro-2023", title: "Tableau de bord socio-économique, région Alaotra-Mangoro 2023", date: "2024-12-11", thematique: "Économie", sector: "situation-economique", region: "Alaotra-Mangoro", file: "tbse-alaotra-mangoro-2023.pdf", ...tbse("Alaotra-Mangoro", 2023) },
  { id: "analanjirofo-2023", title: "Tableau de bord socio-économique, région Analanjirofo 2023", date: "2024-12-11", thematique: "Économie", sector: "situation-economique", region: "Analanjirofo", file: "tbse-analanjirofo-2023.pdf", ...tbse("Analanjirofo", 2023) },
];

export const extraPublicationSeeds: ExtraPublicationSeed[] = [
  {
    id: "rgph-3-resultats",
    title: "Troisième recensement général de la population et de l'habitation (RGPH-3) : résultats globaux",
    date: "2021-06-30",
    thematique: "Démographie et population",
    sectors: ["rgph"],
    excerpt: "Les résultats globaux du RGPH-3 donnent l'effectif et la structure de la population de Madagascar, ainsi que les caractéristiques des ménages et de leurs logements.",
    body: [
      "Le troisième recensement général de la population et de l'habitation (RGPH-3) a été réalisé par l'INSTAT en 2018, vingt-cinq ans après le précédent. Il a couvert l'ensemble du territoire, jusqu'au niveau des fokontany.",
      "Ce volume présente la population par région, district et commune, sa répartition par sexe et par âge, le milieu de résidence, ainsi que les principales caractéristiques des ménages : taille, chef de ménage, type de logement, matériaux de construction, accès à l'eau, à l'électricité et aux toilettes.",
      "Des rapports thématiques complètent ces résultats : fécondité, mortalité, migrations, éducation, emploi, handicap et conditions d'habitation. Les tableaux par commune sont disponibles auprès de la Direction de la démographie et des statistiques sociales.",
    ],
  },
  {
    id: "projections-2050",
    title: "Projections démographiques de Madagascar, 2018-2050",
    date: "2025-09-15",
    thematique: "Démographie et population",
    sectors: ["rgph"],
    excerpt: "Évolution attendue de la population de Madagascar jusqu'en 2050, par sexe, par âge et par région, selon plusieurs hypothèses de fécondité et de mortalité.",
    body: [
      "Ces projections partent de la population recensée lors du RGPH-3 de 2018. Elles décrivent l'évolution probable de la population totale, de sa structure par âge et de sa répartition entre milieux urbain et rural jusqu'en 2050.",
      "Trois scénarios sont présentés, selon le rythme de baisse de la fécondité et les progrès de l'espérance de vie. Les résultats sont déclinés pour chacune des 23 régions et pour les groupes d'âge utiles à la planification : enfants d'âge scolaire, population en âge de travailler, personnes âgées.",
      "Ce document sert de référence aux ministères et aux partenaires pour estimer les besoins futurs en écoles, en services de santé, en emplois et en logements.",
    ],
  },
  {
    id: "monographie-analamanga",
    title: "Monographie de la région Analamanga",
    date: "2025-11-20",
    thematique: "Démographie et population",
    sectors: ["monographies"],
    region: "Analamanga",
    excerpt: "Portrait complet de la région Analamanga : milieu physique, population, services sociaux, activités économiques et infrastructures, district par district.",
    body: [
      "La monographie décrit la région Analamanga, qui abrite la capitale et concentre une part importante de la population urbaine et de l'activité économique du pays.",
      "Elle présente successivement le milieu physique et le climat, la démographie, l'éducation, la santé, l'agriculture et l'élevage, l'industrie, le commerce, le tourisme, les transports et les réseaux d'eau et d'électricité. Chaque chapitre est décliné pour les districts de la région.",
      "Réalisée avec la direction interrégionale de l'INSTAT à Antananarivo et les services techniques régionaux, elle constitue un document de référence pour les collectivités, les investisseurs et les organisations de développement.",
    ],
  },
  {
    id: "eds-md-2021",
    title: "Enquête démographique et de santé (EDS-MD) 2021 : rapport final",
    date: "2022-12-15",
    thematique: "Santé",
    sectors: ["eds-md", "sante"],
    excerpt: "Le rapport final de l'EDS-MD 2021 présente les indicateurs de fécondité, de planification familiale, de santé maternelle et infantile, de nutrition et de paludisme.",
    body: [
      "La cinquième enquête démographique et de santé de Madagascar a été conduite par l'INSTAT en 2021, dans le cadre du programme international DHS. Elle a interrogé des femmes et des hommes en âge de procréer dans des ménages répartis sur l'ensemble du territoire.",
      "Le rapport traite de la fécondité et de ses déterminants, de la planification familiale, de la mortalité des enfants, des soins prénatals et de l'accouchement, de la vaccination, de l'état nutritionnel des enfants et des femmes, du paludisme et des connaissances sur le VIH.",
      "Les résultats sont présentés au niveau national, par milieu de résidence et par région. Ils permettent de mesurer les progrès réalisés depuis l'enquête précédente et d'orienter les politiques de santé.",
    ],
  },
  {
    id: "annuaire-sante-2024",
    title: "Annuaire des statistiques de la santé 2024",
    date: "2026-03-12",
    thematique: "Santé",
    sectors: ["annuaire", "sante"],
    excerpt: "Les statistiques sanitaires de l'année 2024 : infrastructures, personnel de santé, fréquentation des établissements, maladies déclarées et programmes de santé publique.",
    body: [
      "L'annuaire rassemble les données produites par le système d'information sanitaire pour l'année 2024 : centres de santé de base, hôpitaux de district et centres hospitaliers universitaires, personnel médical et paramédical, lits disponibles.",
      "Il présente l'activité des établissements (consultations, hospitalisations, accouchements assistés), la couverture vaccinale, les principales maladies déclarées et les résultats des programmes nationaux de lutte contre le paludisme, la tuberculose et la malnutrition.",
      "Les tableaux sont détaillés par région et par district sanitaire. L'annuaire est réalisé avec le ministère de la Santé publique.",
    ],
  },
  {
    id: "enempsi-2022",
    title: "Enquête nationale sur l'emploi et le secteur informel (ENEMPSI) 2022",
    date: "2024-07-18",
    thematique: "Travail",
    sectors: ["enempsi", "travail"],
    excerpt: "Situation de l'emploi à Madagascar et poids du secteur informel : activité, chômage, sous-emploi, revenus du travail et caractéristiques des unités de production informelles.",
    body: [
      "L'ENEMPSI 2022 comporte deux volets. Le premier mesure la participation au marché du travail de la population en âge de travailler : activité, emploi, chômage, sous-emploi, conditions de travail et revenus.",
      "Le second décrit les unités de production informelles non agricoles : branches d'activité, taille, capital, chiffre d'affaires, clientèle, difficultés rencontrées et relations avec l'administration.",
      "Les indicateurs suivent les normes de la Conférence internationale des statisticiens du travail. Ils sont présentés par sexe, groupe d'âge, niveau d'instruction, milieu de résidence et région.",
    ],
  },
  {
    id: "marche-travail-2024",
    title: "Indicateurs du marché du travail 2024",
    date: "2025-12-05",
    thematique: "Travail",
    sectors: ["travail"],
    excerpt: "Les principaux indicateurs du marché du travail en 2024 : taux d'activité, emploi par secteur et par statut, chômage, sous-emploi et emploi des jeunes.",
    body: [
      "Cette publication actualise les indicateurs clés du marché du travail à partir des enquêtes auprès des ménages et des sources administratives disponibles pour 2024.",
      "Elle présente la répartition des emplois entre agriculture, industrie et services, la part de l'emploi salarié et de l'emploi informel, les taux de chômage et de sous-emploi, ainsi que la situation des jeunes ni en emploi, ni en études, ni en formation.",
      "Des tableaux par sexe, par milieu et par région complètent l'analyse. Les définitions retenues sont rappelées en fin de document.",
    ],
  },
  {
    id: "comptes-2023",
    title: "Comptes nationaux de Madagascar 2023 : comptes provisoires",
    date: "2025-05-22",
    thematique: "Comptes nationaux",
    sectors: ["situation-economique"],
    excerpt: "Les comptes provisoires de l'année 2023 : produit intérieur brut, croissance par branche d'activité, consommation, investissement et échanges extérieurs.",
    body: [
      "Les comptes nationaux décrivent l'ensemble de l'activité économique du pays selon le Système de comptabilité nationale des Nations unies. Cette publication présente les comptes provisoires de l'année 2023.",
      "Elle détaille le produit intérieur brut aux prix courants et en volume, la contribution de chaque branche d'activité à la croissance, les emplois du PIB (consommation des ménages et des administrations, investissement, exportations et importations) et le revenu national.",
      "Les comptes provisoires seront révisés lorsque les données définitives des enquêtes d'entreprises et des statistiques fiscales seront disponibles.",
    ],
  },
  {
    id: "tre-2022",
    title: "Tableau des ressources et des emplois 2022",
    date: "2024-11-28",
    thematique: "Comptes nationaux",
    sectors: [],
    excerpt: "Le tableau des ressources et des emplois 2022 met en cohérence la production, les importations et les utilisations de chaque produit dans l'économie malgache.",
    body: [
      "Le tableau des ressources et des emplois (TRE) est le cadre central des comptes nationaux. Pour chaque produit, il équilibre les ressources (production intérieure et importations) et les emplois (consommation intermédiaire, consommation finale, investissement, exportations).",
      "La publication présente le TRE de l'année 2022 et les comptes de production et d'exploitation des branches qui en découlent : valeur ajoutée, rémunération des salariés, excédent brut d'exploitation.",
      "Ces tableaux servent de base aux analyses de structure de l'économie et aux modèles de prévision utilisés par l'administration et les chercheurs.",
    ],
  },
  {
    id: "annuaire-agricole-2023",
    title: "Annuaire statistique agricole 2023",
    date: "2025-02-14",
    thematique: "Agriculture, élevage et pêche",
    sectors: ["annuaire", "agriculture"],
    excerpt: "Superficies, production et rendements des principales cultures en 2023, du riz aux cultures de rente, ainsi que les données sur l'élevage et la pêche.",
    body: [
      "L'annuaire agricole présente les statistiques de la campagne 2023 pour les cultures vivrières (riz, manioc, maïs, patate douce, légumineuses), les cultures de rente (vanille, girofle, café, cacao, litchi) et les cultures industrielles.",
      "Pour chaque culture, il donne les superficies cultivées, la production et les rendements par région. Des chapitres sont consacrés à l'élevage, à la pêche et à l'aquaculture, aux prix aux producteurs et aux exportations de produits agricoles.",
      "L'annuaire est réalisé avec le ministère de l'Agriculture et de l'Élevage et le ministère de la Pêche et de l'Économie bleue.",
    ],
  },
  {
    id: "elevage-bovin-2024",
    title: "Enquête sur l'élevage bovin 2024",
    date: "2025-10-02",
    thematique: "Agriculture, élevage et pêche",
    sectors: ["agriculture"],
    excerpt: "Effectifs, structure des troupeaux et pratiques d'élevage des zébus, place des bovins dans l'économie des ménages ruraux et circuits de commercialisation.",
    body: [
      "Le zébu occupe une place centrale dans l'agriculture et la vie sociale à Madagascar. Cette enquête, menée en 2024 auprès des ménages éleveurs, actualise la connaissance du cheptel bovin.",
      "Elle décrit la taille et la composition des troupeaux, l'utilisation des animaux (traction, lait, viande, épargne), l'alimentation, les soins vétérinaires, les pertes liées aux maladies et aux vols, ainsi que les ventes sur les marchés à bestiaux.",
      "Les résultats sont présentés par région, avec une attention particulière aux grandes zones d'élevage de l'Ouest et du Sud.",
    ],
  },
  {
    id: "annuaire-education-2024",
    title: "Annuaire des statistiques de l'éducation 2024",
    date: "2025-08-21",
    thematique: "Éducation",
    sectors: ["annuaire", "education"],
    excerpt: "Établissements, enseignants, effectifs d'élèves et résultats scolaires de l'année 2024, du préscolaire à l'enseignement secondaire.",
    body: [
      "L'annuaire de l'éducation présente les données de l'année scolaire, collectées auprès des établissements publics et privés : nombre d'écoles, de salles de classe, d'enseignants et d'élèves, du préscolaire au lycée.",
      "Il calcule les principaux indicateurs du système éducatif : taux de scolarisation, ratio élèves par enseignant, taux de redoublement et d'abandon, taux d'achèvement du primaire et résultats aux examens officiels.",
      "Les tableaux sont détaillés par région et par circonscription scolaire. L'annuaire est produit avec le ministère de l'Éducation nationale.",
    ],
  },
  {
    id: "eau-assainissement-mics",
    title: "Accès des ménages à l'eau potable et à l'assainissement (MICS-7)",
    date: "2026-03-30",
    thematique: "Eau, assainissement et hygiène",
    sectors: ["mics", "eau"],
    excerpt: "D'où vient l'eau que boivent les ménages, combien de temps faut-il pour la chercher, de quelles toilettes disposent-ils : les résultats de la MICS-7 sur l'eau, l'assainissement et l'hygiène.",
    body: [
      "Cette publication thématique exploite le module « eau, assainissement et hygiène » de l'enquête MICS-7 2025. Elle classe les sources d'eau de boisson et les installations sanitaires selon l'échelle de service du programme commun OMS-UNICEF.",
      "Elle décrit le temps consacré à la corvée d'eau et les personnes qui en sont chargées, la qualité de l'eau de boisson, la défécation à l'air libre et la présence d'un dispositif de lavage des mains avec du savon.",
      "Les écarts entre milieux urbain et rural, entre régions et selon le niveau de vie des ménages sont mis en évidence, afin d'orienter les investissements du secteur.",
    ],
  },
  {
    id: "comptes-forets-2023",
    title: "Comptes de l'environnement : forêts et couverture forestière 2023",
    date: "2025-04-17",
    thematique: "Environnement",
    sectors: ["environnement"],
    excerpt: "Superficie et état des forêts malgaches, évolution de la couverture forestière et liens avec l'activité économique, selon le cadre des comptes économiques de l'environnement.",
    body: [
      "Les comptes des forêts suivent le Système de comptabilité économique et environnementale (SCEE) des Nations unies. Ils mesurent les stocks de forêts naturelles et de plantations et leurs variations d'une année sur l'autre.",
      "La publication présente la superficie forestière par type de forêt et par région, les pertes liées aux défrichements et aux feux, les reboisements, ainsi que les prélèvements de bois d'œuvre et de bois énergie.",
      "Elle a été réalisée avec le ministère de l'Environnement et du Développement durable et s'appuie sur des données de télédétection.",
    ],
  },
  {
    id: "bilan-energetique-2023",
    title: "Bilan énergétique national 2023",
    date: "2025-03-06",
    thematique: "Énergie et hydrocarbures",
    sectors: ["energie"],
    excerpt: "Production, importations et consommation d'énergie à Madagascar en 2023 : bois et charbon de bois, produits pétroliers, électricité et énergies renouvelables.",
    body: [
      "Le bilan énergétique retrace, pour l'année 2023, l'ensemble des flux d'énergie du pays, de la production et des importations jusqu'à la consommation finale des ménages, des entreprises et des transports.",
      "Il met en évidence la place prépondérante de la biomasse (bois de chauffe et charbon de bois) dans la consommation des ménages, la dépendance aux produits pétroliers importés et la part de l'hydroélectricité et du solaire dans la production d'électricité.",
      "Le document est établi avec le ministère de l'Énergie et des Hydrocarbures, l'Office malgache des hydrocarbures et la JIRAMA.",
    ],
  },
  {
    id: "tourisme-2025",
    title: "Statistiques du tourisme : arrivées des visiteurs non résidents 2025",
    date: "2026-02-19",
    thematique: "Tourisme et artisanat",
    sectors: ["tourisme"],
    excerpt: "Les arrivées de visiteurs non résidents en 2025 par mois, par pays de résidence, par motif de séjour et par point d'entrée.",
    body: [
      "Cette publication présente les statistiques des arrivées de visiteurs non résidents aux frontières de Madagascar en 2025, établies à partir des fiches de débarquement aux aéroports et aux ports.",
      "Les arrivées sont ventilées par mois, par pays de résidence, par motif de séjour (loisirs, affaires, visite à la famille) et par point d'entrée. La durée moyenne de séjour et les principaux types d'hébergement sont également présentés.",
      "Ces statistiques sont produites avec le ministère du Tourisme et l'Office national du tourisme de Madagascar.",
    ],
  },
  {
    id: "artisanat-2024",
    title: "Enquête sur l'artisanat 2024",
    date: "2025-07-09",
    thematique: "Tourisme et artisanat",
    sectors: ["artisanat-enquete", "tourisme"],
    excerpt: "Les artisans malgaches et leurs activités : filières, matières premières, emploi, revenus et débouchés de la vannerie, du textile, du bois et des autres métiers d'art.",
    body: [
      "L'enquête sur l'artisanat a été menée en 2024 auprès des artisans et des ateliers dans les principales zones de production du pays.",
      "Elle décrit les filières (vannerie et raphia, broderie et textile, travail du bois, de la corne, du métal et de la pierre), l'origine des matières premières, l'emploi et la formation, les revenus tirés de l'activité et les circuits de vente, du marché local à l'exportation.",
      "Les résultats aident à orienter l'appui public à un secteur qui fait vivre de nombreux ménages et contribue à l'offre touristique.",
    ],
  },
  {
    id: "commerce-exterieur-2025",
    title: "Commerce extérieur de Madagascar 2025",
    date: "2026-05-14",
    thematique: "Commerce et consommation",
    sectors: ["commerce"],
    excerpt: "Les exportations et importations de marchandises de Madagascar en 2025, par produit, par pays partenaire et par port, et l'évolution de la balance commerciale.",
    body: [
      "Les statistiques du commerce extérieur sont établies à partir des déclarations en douane. Cette publication présente les échanges de marchandises de l'année 2025.",
      "Elle détaille les principaux produits exportés (vanille, girofle, nickel et cobalt, produits textiles, crevettes) et importés (produits pétroliers, riz, biens d'équipement, véhicules), les pays clients et fournisseurs, ainsi que l'activité des principaux ports dont Toamasina.",
      "Les valeurs sont exprimées en ariary et en dollars des États-Unis. Les données mensuelles sont disponibles auprès de la Direction des statistiques économiques.",
    ],
  },
  {
    id: "epm-2022",
    title: "Enquête permanente auprès des ménages (EPM) 2022 : profil de la pauvreté",
    date: "2024-09-26",
    thematique: "Conditions de vie des ménages",
    sectors: ["epm"],
    excerpt: "Niveau de vie des ménages, incidence et profondeur de la pauvreté, inégalités et accès aux services de base, d'après l'Enquête permanente auprès des ménages 2022.",
    body: [
      "L'Enquête permanente auprès des ménages (EPM) mesure les conditions de vie de la population à partir de la consommation des ménages. L'édition 2022 a été réalisée auprès d'un échantillon représentatif des régions et des milieux urbain et rural.",
      "Le rapport présente le seuil de pauvreté, l'incidence, la profondeur et la sévérité de la pauvreté, les inégalités de consommation, ainsi que les caractéristiques des ménages pauvres : taille, activité du chef de ménage, éducation, logement et accès aux services.",
      "Les résultats servent au suivi de la stratégie nationale de réduction de la pauvreté et des Objectifs de développement durable.",
    ],
  },
  {
    id: "covid-entreprises",
    title: "Effets de la COVID-19 sur les entreprises : enquête à haute fréquence",
    date: "2021-03-31",
    thematique: "Impact de la COVID-19",
    sectors: ["ehtm"],
    excerpt: "Comment les entreprises malgaches ont traversé la crise sanitaire : fermetures, baisse d'activité, emploi, trésorerie et mesures d'adaptation, suivies par téléphone en plusieurs vagues.",
    body: [
      "Pour suivre rapidement les effets de la pandémie de COVID-19, l'INSTAT a interrogé par téléphone, à plusieurs reprises, un panel d'entreprises formelles des principaux secteurs d'activité.",
      "L'enquête mesure les fermetures temporaires ou définitives, l'évolution du chiffre d'affaires, les réductions d'effectifs et d'heures travaillées, les difficultés de trésorerie et d'approvisionnement, ainsi que le recours aux mesures de soutien de l'État.",
      "Les résultats sont présentés par secteur et par taille d'entreprise, et comparés d'une vague à l'autre pour suivre la reprise.",
    ],
  },
  {
    id: "ide-2024",
    title: "Investissements directs étrangers à Madagascar 2024",
    date: "2025-12-18",
    thematique: "Économie",
    sectors: ["ide"],
    excerpt: "Les flux et les stocks d'investissements directs étrangers à Madagascar en 2024, par secteur d'activité et par pays d'origine.",
    body: [
      "Cette publication présente les résultats de l'enquête annuelle sur les investissements directs étrangers, menée avec la Banque centrale de Madagascar auprès des entreprises à capitaux étrangers.",
      "Elle décrit les flux d'investissements entrants en 2024 (apports en capital, bénéfices réinvestis, prêts intragroupe), les stocks accumulés, la répartition par secteur (mines, industrie, télécommunications, services financiers, tourisme) et par pays d'origine.",
      "L'enquête recueille aussi l'opinion des investisseurs sur le climat des affaires et leurs perspectives à court terme.",
    ],
  },
  {
    id: "annuaire-madagascar-2024",
    title: "Annuaire statistique de Madagascar 2024",
    date: "2026-01-29",
    thematique: "Économie",
    sectors: ["annuaire"],
    excerpt: "L'ouvrage de référence de la statistique malgache : les dernières données disponibles dans tous les domaines, de la population aux finances publiques.",
    body: [
      "L'Annuaire statistique de Madagascar rassemble en un seul volume les principales séries produites par l'INSTAT et par les services statistiques des ministères.",
      "Il couvre le territoire et le climat, la population, l'éducation, la santé, l'emploi, l'agriculture, l'industrie, l'énergie, les transports, le tourisme, les prix, le commerce extérieur, la monnaie et les finances publiques. Chaque chapitre précise les sources et les définitions.",
      "Les séries portent, selon les domaines, sur les cinq à dix dernières années, avec des données par région lorsqu'elles existent.",
    ],
  },
];
