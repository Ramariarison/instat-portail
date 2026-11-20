# Schéma des données — Portail INSTAT Madagascar

Document de référence pour rédiger le **dictionnaire de données** du mémoire.
Il est tiré directement des migrations SQL du projet (état au 9 novembre 2026, après la migration 002 du service Chiffres).

## 1. Architecture des données

- SGBD : **PostgreSQL 17** (image PostGIS, extension non utilisée pour l'instant).
- Architecture microservices : **une base et un rôle PostgreSQL par service**. Aucun service ne lit les tables d'un autre,
  donc **aucune clé étrangère entre deux bases** (les liens entre bases sont « logiques », vérifiés par l'application).
- Accès aux données en SQL écrit à la main (pas d'ORM), valeurs toujours paramétrées.
- Schéma créé par des migrations versionnées (`NNN_description.sql`), appliquées une seule fois au démarrage du service ;
  chaque base contient une table technique `schema_migrations` qui les recense.

| Base | Service | Tables métier |
|---|---|---|
| `auth` | Auth (connexion, comptes) | `users` |
| `publications` | Publications | `thematiques`, `regions`, `publications`, `publication_reviews`, `news`, `demo_seeds` |
| `chiffres` | Chiffres (« Madagascar en chiffres ») | `data_types`, `indicator_defs`, `figure_regions`, `figure_values`, `key_figures` |
| *(aucune)* | Files (fichiers envoyés) | pas de table : fichiers sur disque + métadonnées JSON |

### Conventions communes

- **Identifiants** : texte, préfixé selon l'entité, suivi d'un suffixe aléatoire (ex. `pub-3f9a…`).

  | Préfixe | Entité | Préfixe | Entité |
  |---|---|---|---|
  | `user-` | users | `type-` | data_types |
  | `th-` | thematiques | `ind-` | indicator_defs |
  | `reg-` | regions | `fr-` | figure_regions |
  | `pub-` | publications | `val-` | figure_values |
  | `rev-` | publication_reviews | `kf-` | key_figures |
  | `news-` | news | `file-` | fichiers (service Files) |

- **Noms de colonnes** en `snake_case` en base, exposés en `camelCase` par l'API (ex. `image_url` → `imageUrl`).
- **Dates** : `date` au format `AAAA-MM-JJ` ; horodatages `timestamptz` (avec fuseau).
- Champ optionnel = colonne `NULL` autorisée ; il n'est pas renvoyé par l'API quand il est vide.
- Liens et images : seulement `http(s)://`, chemin `/…` ou ancre `#…` (contrôle applicatif).

## 2. Base `auth`

### Table `users` — comptes du back-office

| Colonne | Type | Null | Défaut | Contraintes / description |
|---|---|---|---|---|
| `id` | text | non | — | Clé primaire, préfixe `user-` |
| `name` | text | non | — | Nom affiché (modifiable dans « Mon compte ») |
| `email` | text | non | — | Unique **sans tenir compte de la casse** (index unique sur `lower(email)`) |
| `role` | text | non | — | `super_admin`, `admin` ou `editor` (CHECK) |
| `active` | boolean | non | `true` | `false` = compte suspendu (connexion refusée) |
| `password_hash` | text | oui | — | Empreinte du mot de passe ; `NULL` = compte créé sans mot de passe, connexion impossible |
| `last_login` | timestamptz | oui | — | Date de la dernière connexion |
| `created_at` | timestamptz | non | `now()` | Date de création |

Règles applicatives : un administrateur ne crée que des éditeurs ; seul le super administrateur supprime un compte ;
personne ne modifie son propre rôle ni ne se suspend ; il reste toujours au moins un super administrateur actif.

## 3. Base `publications`

### Table `thematiques` — thématiques de classement des publications

| Colonne | Type | Null | Défaut | Contraintes / description |
|---|---|---|---|---|
| `id` | text | non | — | Clé primaire, préfixe `th-` |
| `name` | text | non | — | Libellé (ex. « Démographie ») |
| `alias` | text | non | — | Unique ; slug d'URL (`^[a-z0-9]+(-[a-z0-9]+)*$`), utilisé dans `#/themes/<alias>` |
| `picto_url` | text | oui | — | Adresse du pictogramme |
| `covid` | boolean | non | `false` | Thématique liée à la COVID-19 |
| `in_menu_publications` | boolean | non | `false` | Affichée dans le menu « Publications » |
| `in_menu_themes` | boolean | non | `false` | Affichée dans le menu « Thèmes et données » |
| `in_menu_services` | boolean | non | `false` | Affichée dans le menu « Services » |

### Table `regions` — régions de Madagascar

| Colonne | Type | Null | Défaut | Contraintes / description |
|---|---|---|---|---|
| `id` | text | non | — | Clé primaire, préfixe `reg-` |
| `name` | text | non | — | Unique (ex. « Analamanga ») ; sert aussi à placer la région sur la carte du site |

Pas de colonne d'image : la silhouette de chaque région est dessinée par le site à partir du fond de carte
(23 régions, découpage de 2021). L'ancienne colonne `picto` (simple nom de fichier) a été supprimée (migration 005).

### Table `publications` — publications statistiques

| Colonne | Type | Null | Défaut | Contraintes / description |
|---|---|---|---|---|
| `id` | text | non | — | Clé primaire, préfixe `pub-` |
| `title` | text | non | — | Titre |
| `image_url` | text | oui | — | Image de titre (adresse renvoyée par le service Files) |
| `level` | text | non | — | `national` ou `regional` (CHECK) |
| `region_id` | text | oui | — | FK → `regions(id)`, ON DELETE RESTRICT. **Obligatoire si `level = 'regional'`, vide si `national`** (CHECK) |
| `thematique_id` | text | non | — | FK → `thematiques(id)`, ON DELETE RESTRICT |
| `excerpt` | text | non | — | Résumé court (listes, cartes) |
| `content` | text | non | — | Texte complet |
| `documents` | jsonb | non | `'[]'` | Liste des documents joints : `[{ "id", "name", "size" }]`, `id` = identifiant `file-…` du service Files |
| `date` | date | non | — | Date de la publication |
| `latest_nipc` | boolean | non | `false` | Marqueur « la plus récente NIPC » : **une seule parmi les publications en ligne** (index unique partiel) |
| `sectors` | text[] | non | `'{}'` | Secteurs concernés : identifiants de la liste fixe (§ 6) |
| `status` | text | non | `'draft'` | `draft`, `submitted`, `returned`, `published` (CHECK) — workflow de validation |
| `created_by` | text | oui | — | Identifiant de l'auteur (`user-…` de la base `auth`, sans FK) |
| `created_by_name` | text | oui | — | Nom de l'auteur au moment de la création (copie) |
| `submitted_at` | timestamptz | oui | — | Dernière soumission à validation |
| `published_at` | timestamptz | oui | — | Mise en ligne |
| `created_at` | timestamptz | non | `now()` | Création |
| `updated_at` | timestamptz | non | `now()` | Dernière modification |

Index : `(level, date DESC)`, `(status, date DESC)`, `thematique_id`, `region_id`, `created_by`.
Le type de publication affiché sur le site (`kind`) n'est pas stocké : il est déduit du premier secteur.

Workflow : brouillon (`draft`) → soumise (`submitted`) → publiée (`published`), ou renvoyée (`returned`) avec commentaire
obligatoire. Seules les publications `published` sont visibles sur le site public.

### Table `publication_reviews` — historique du workflow de validation

| Colonne | Type | Null | Défaut | Contraintes / description |
|---|---|---|---|---|
| `id` | text | non | — | Clé primaire, préfixe `rev-` |
| `publication_id` | text | non | — | FK → `publications(id)`, **ON DELETE CASCADE** |
| `action` | text | non | — | `submitted`, `returned` ou `published` (CHECK) |
| `comment` | text | oui | — | **Obligatoire si `action = 'returned'`** (CHECK) |
| `author_id` | text | non | — | Auteur de la décision (`user-…`, sans FK) |
| `author_name` | text | non | — | Nom de l'auteur (copie) |
| `created_at` | timestamptz | non | `now()` | Date de la décision |

Index : `(publication_id, created_at)`.

### Table `news` — actualités du bandeau d'accueil

| Colonne | Type | Null | Défaut | Contraintes / description |
|---|---|---|---|---|
| `id` | text | non | — | Clé primaire, préfixe `news-` |
| `title` | text | non | — | Titre |
| `date` | date | oui | — | Date servant au tri |
| `date_label` | text | oui | — | Libellé de date libre affiché (ex. « 22 et 23 janvier 2026 ») |
| `context` | text | oui | — | Contexte (lieu, événement) |
| `href` | text | oui | — | Lien « Lire l'actualité » |
| `created_at` | timestamptz | non | `now()` | Création |

### Table `demo_seeds` — table technique

| Colonne | Type | Null | Défaut | Contraintes / description |
|---|---|---|---|---|
| `name` | text | non | — | Clé primaire : nom du lot de données d'exemple déjà chargé |
| `applied_at` | timestamptz | non | `now()` | Date de chargement |

Sert à ne charger chaque lot d'exemples qu'une fois (environnement de démonstration seulement).

## 4. Base `chiffres` (« Madagascar en chiffres »)

### Table `data_types` — types de données (domaines d'indicateurs)

| Colonne | Type | Null | Défaut | Contraintes / description |
|---|---|---|---|---|
| `id` | text | non | — | Clé primaire, préfixe `type-` |
| `name` | text | non | — | Unique (ex. « Démographie », « Éducation ») |
| `picto` | text | non | `''` | Pictogramme |

### Table `indicator_defs` — définitions des indicateurs

| Colonne | Type | Null | Défaut | Contraintes / description |
|---|---|---|---|---|
| `id` | text | non | — | Clé primaire, préfixe `ind-` |
| `type_id` | text | non | — | FK → `data_types(id)`, ON DELETE RESTRICT (index) |
| `name` | text | non | — | Libellé de l'indicateur (ex. « Population totale ») |
| `picto` | text | non | `''` | Pictogramme |

### Table `figure_regions` — territoires présentés dans « Madagascar en chiffres »

| Colonne | Type | Null | Défaut | Contraintes / description |
|---|---|---|---|---|
| `id` | text | non | — | Clé primaire, préfixe `fr-` |
| `name` | text | non | — | Unique (ex. « National », « Analamanga ») |
| `region_id` | text | oui | — | Unique ; `NULL` = niveau national, sinon identifiant `reg-…` de la base `publications` (**lien logique, sans FK** car bases séparées) |

### Table `figure_values` — valeurs des indicateurs

| Colonne | Type | Null | Défaut | Contraintes / description |
|---|---|---|---|---|
| `id` | text | non | — | Clé primaire, préfixe `val-` |
| `figure_region_id` | text | non | — | FK → `figure_regions(id)`, **ON DELETE CASCADE** |
| `indicator_id` | text | non | — | FK → `indicator_defs(id)`, ON DELETE RESTRICT (index) |
| `year` | integer | non | — | Année, entre 1900 et 2100 (CHECK) |
| `month` | smallint | oui | — | Mois, de 1 à 12 (CHECK), pour une valeur mensuelle (NIPC) ; vide pour une valeur annuelle |
| `value` | double precision | non | — | Valeur numérique |
| `unit` | text | non | — | Unité (ex. « habitants », « % ») |
| `source` | text | non | — | Source de la donnée (ex. « RGPH-3 ») |
| `link` | text | oui | — | Lien vers la source |

Contrainte d'unicité : **une seule valeur par (`figure_region_id`, `indicator_id`, `year`, `month`)** (index unique
sur `coalesce(month, 0)`, migration 002). Une même région peut donc avoir une série d'années, ou de mois.

### Table `key_figures` — chiffres clés de la page d'accueil

Choix des indicateurs mis en avant à l'accueil. Aucune valeur n'y est stockée : l'accueil affiche la valeur la plus
récente (année, puis mois) de l'indicateur dans la fiche nationale (`figure_regions.region_id` NULL).

| Colonne | Type | Null | Défaut | Contraintes / description |
|---|---|---|---|---|
| `id` | text | non | — | Clé primaire, préfixe `kf-` |
| `indicator_id` | text | non | — | FK → `indicator_defs(id)`, ON DELETE RESTRICT ; unique (un indicateur une seule fois) |
| `label` | text | oui | — | Libellé à l'accueil ; vide : nom de l'indicateur |
| `decimals` | integer | non | `0` | Nombre de décimales affichées, de 0 à 6 (CHECK) |
| `position` | integer | non | `0` | Ordre d'affichage |

## 5. Service Files (sans base de données)

Les fichiers envoyés (images, documents PDF, tableurs…) sont stockés sur un volume disque ; chacun est accompagné
d'un fichier de métadonnées `<id>.json` :

| Champ | Type | Description |
|---|---|---|
| `id` | texte | Identifiant, préfixe `file-` |
| `name` | texte | Nom d'origine du fichier |
| `size` | entier | Taille en octets (50 Mo maximum par défaut) |
| `type` | texte | Type MIME (SVG et HTML refusés) |
| `uploadedBy` | texte | Identifiant de l'utilisateur qui l'a envoyé |
| `uploadedAt` | horodatage | Date d'envoi |

Une publication y fait référence par `publications.image_url` (adresse) et `publications.documents[].id`.

## 6. Listes de valeurs (domaines)

- `users.role` : `super_admin` (Super administrateur), `admin` (Administrateur), `editor` (Éditeur).
- `publications.level` : `national`, `regional`.
- `publications.status` : `draft` (brouillon), `submitted` (soumise), `returned` (renvoyée), `published` (publiée).
- `publication_reviews.action` : `submitted`, `returned`, `published`.
- `publications.sectors` (liste fixe définie dans le code) :

| id | Libellé |
|---|---|
| rgph | Recensement général de la population et de l'habitation (RGPH) |
| eds-md | Enquête démographique et de santé (EDS-MD) |
| mics | Enquête par grappes à indicateurs multiples (MICS) |
| epm | Enquête périodique auprès des ménages (EPM) |
| madio | MADIO |
| ilo | ILO |
| jas | Journées africaines de la statistique (JAS) |
| jms | Journée mondiale de la statistique (JMS) |
| tbe | Tableau de bord de l'économie (TBE) |
| agriculture | Agriculture (élevage, agriculture, pêche) |
| education | Éducation |
| eau | Eau, assainissement et hygiène |
| sante | Santé |
| environnement | Environnement |
| enempsi | Enquête nationale sur l'emploi et le secteur informel (ENEMPSI) |
| nipc | Nouvel indice des prix à la consommation (NIPC) |
| etat-civil | État civil |
| annuaire | Annuaire statistique |
| etablissements | Établissements formels |
| ehtm | Enquête à haute fréquence par téléphone mobile (EHTM) |
| ensomd | Enquête nationale sur le suivi des OMD (ENSOMD 2012-2013) |
| vehicules | Immatriculation des véhicules |
| artisanat-enquete | Enquête sur l'artisanat |
| ide | Investissements directs étrangers (IDE) |
| situation-economique | Situation économique |
| monographies | Monographies |
| energie | Énergie et hydrocarbures |
| tourisme | Tourisme et artisanat |
| commerce | Commerce et consommation |
| travail | Travail |

## 7. Relations

Clés étrangères réelles (dans une même base) :

- `publications.region_id` → `regions.id` (0..1 région par publication ; une région, 0..n publications)
- `publications.thematique_id` → `thematiques.id` (1 thématique par publication)
- `publication_reviews.publication_id` → `publications.id` (une publication, 0..n décisions ; suppression en cascade)
- `indicator_defs.type_id` → `data_types.id` (1 type par indicateur)
- `figure_values.figure_region_id` → `figure_regions.id` (suppression en cascade)
- `figure_values.indicator_id` → `indicator_defs.id`
- `key_figures.indicator_id` → `indicator_defs.id` (un chiffre clé par indicateur)

Liens logiques entre bases (sans clé étrangère, vérifiés ou copiés par l'application) :

- `publications.created_by`, `publication_reviews.author_id` → `auth.users.id` (le nom est recopié dans `*_name`)
- `figure_regions.region_id` → `publications.regions.id`
- `publications.image_url`, `publications.documents[].id` → fichiers du service Files

Suppression d'une thématique, d'une région, d'un type ou d'un indicateur encore utilisé : refusée (`ON DELETE RESTRICT`).
