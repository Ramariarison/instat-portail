# Portail INSTAT Madagascar

Front React existant + microservices back-end, orchestrés par `docker-compose.yml`.

```
instat-portail/
├── instat-front-v2/     front React 19 + TypeScript + Tailwind 4 (Vite) — NE PAS MODIFIER sans accord explicite
├── services/            microservices NestJS 12 (moteur HTTP Fastify), PostgreSQL — monorepo Nest
│   ├── libs/common/     bibliothèque commune (@app/common) : contrat, RBAC, sécurité, base, erreurs, démarrage
│   ├── apps/auth/       connexion, jetons, comptes            → base « auth »
│   ├── apps/publications/  thématiques, régions, secteurs, publications, actualités → base « publications »
│   ├── apps/chiffres/   « Madagascar en chiffres » + chiffres clés      → base « chiffres »
│   ├── apps/files/      fichiers envoyés (images, documents)  → volume disque
│   ├── test/            scénario de bout en bout de l'API (api-smoke.sh)
│   ├── gateway/         nginx : passerelle /api + sert le build du front
│   ├── pgadmin/         serveur déclaré pour pgAdmin (outil de développement)
│   └── postgres/        script de création des bases (une base et un rôle par service)
├── docker-compose.yml
└── .env.example
```

## Le contrat

Le front fait foi. Les réponses JSON reprennent **exactement** ses types :

- `instat-front-v2/src/types.ts` (site public : `User`, `Publication`, `NewsItem`, `Indicator`, `Role`)
- `instat-front-v2/src/admin/data/types.ts` (back-office : `Thematique`, `Region`, `AdminPublication`, `DataType`, `IndicatorDef`, `FigureRegion`, `FigureValue`, `AdminUser`)
- `instat-front-v2/src/admin/permissions.ts` (matrice RBAC)

Ils sont recopiés dans `services/libs/common/src/contract/` (`contract.types.ts`, `permissions.ts`), et la liste des
secteurs dans `services/apps/publications/src/sectors/sectors.constants.ts`. **Si l'un change, changer l'autre.**

Règles de forme : camelCase ; un champ optionnel absent n'est pas renvoyé (jamais `null`, voir `compact()` dans
`libs/common/src/database/compact.ts`) ; en écriture, `null` efface un champ optionnel ; identifiants texte préfixés (`pub-…`, `th-…`) ;
dates `AAAA-MM-JJ`. Erreurs : `{ "error": { "code": "IN_USE", "message": "…" } }`, code stable + message en français.

## Lancer

```bash
cp .env.example .env
docker compose up --build        # http://localhost:8080 (site) et http://localhost:8080/api/...
docker compose down -v           # tout effacer, bases comprises
docker compose --profile outils up -d   # + pgAdmin sur http://localhost:5050 (poste local seulement)
```

pgAdmin (profil `outils`, jamais démarré par défaut) : le serveur « INSTAT (local) » est déjà déclaré
(`services/pgadmin/servers.json`) ; se connecter avec l'utilisateur `postgres` et `POSTGRES_PASSWORD` du `.env`.
Il tourne sans écran de connexion et n'écoute que sur 127.0.0.1 : ne pas l'exposer ailleurs.

`SEED_DEMO=true` charge les données d'exemple du front (mêmes identifiants), plus un lot d'exemples couvrant toutes
les thématiques (chaque lot une seule fois : table `demo_seeds` du service Publications), et les comptes de démonstration
`superadmin@instat.demo`, `admin@instat.demo`, `editeur@instat.demo` (mot de passe `demo1234`), seulement si les tables sont vides.
En production : `SEED_DEMO=false` et `BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD` pour le premier super administrateur.

Hors Docker (un PostgreSQL accessible est nécessaire), depuis `services/` :

```bash
npm install
npm run typecheck && npm test          # typage + tests unitaires (Jest, fichiers *.spec.ts)
JWT_SECRET=<32+ caractères> DATABASE_URL=postgres://… SEED_DEMO=true PORT=3001 npm run start:auth
test/api-smoke.sh http://localhost:8080/api   # scénario de bout en bout, sur une stack fraîche
```

Documentation OpenAPI (Swagger) de chaque service : http://localhost:8080/api/docs/auth/ (idem `publications`,
`chiffres`, `files`), générée à partir des contrôleurs et des DTO.

## Organisation du code (NestJS)

Un dossier par ressource, un fichier par rôle — ne pas tout regrouper dans un même fichier :

```
apps/<service>/src/
├── main.ts                    démarrage (bootstrapService de @app/common)
├── app.module.ts              module racine : base, sécurité, santé, modules métier
├── <ressource>/
│   ├── <ressource>.module.ts
│   ├── <ressource>.controller.ts   routes HTTP, décorateurs @Public / @RequirePermission
│   ├── <ressource>.service.ts      règles métier
│   ├── <ressource>.repository.ts   SQL (hérite de SqlRepository)
│   └── dto/                        create-*.dto.ts, update-*.dto.ts (PartialType), list-*.query.ts (class-validator)
└── seed/                      données d'exemple (SEED_DEMO=true)
apps/<service>/migrations/     NNN_description.sql
```

- **Sécurité** : `SecurityModule` installe une garde globale (`AccessGuard`). Toute route exige un jeton, sauf
  `@Public()` ; `@RequirePermission(ressource, action)` vérifie la matrice RBAC ; `@CurrentUser()` donne l'utilisateur.
- **Erreurs** : lever `ApiException` (`notFound`, `forbidden`, `badRequest`, `conflict`) ; `AllExceptionsFilter` produit
  le format `{ error: { code, message } }` et traduit les contraintes PostgreSQL (409 `ALREADY_EXISTS` / `IN_USE`…).
- **Validation** : DTO class-validator ; les champs inconnus sont retirés (whitelist), les paramètres de requête convertis.
- **Accès aux données** : SQL écrit à la main (pas d'ORM), via `SqlRepository` (lecture, création, mise à jour partielle,
  suppression) et `runInTransaction`. Les colonnes viennent du code, les valeurs sont toujours paramétrées.
- **Build** : webpack (Nest CLI) produit un fichier par service ; l'image Docker ne contient que ce fichier, les
  migrations et les dépendances de production.

## Routes (via la passerelle, préfixe `/api`)

La passerelle retire `/api` et route selon le premier segment (`services/gateway/default.conf.template`).
Le détail de chaque route (paramètres, corps, réponses) est dans la documentation Swagger.
Lecture publique sauf mention ; écriture = jeton `Authorization: Bearer …` + droit de la matrice RBAC.

| Service | Routes |
|---|---|
| auth | `POST /auth/login` → `{ token, expiresIn, user }` · `GET /auth/me` · `PATCH /auth/me` (nom) · `POST /auth/password` · `GET /auth/permissions` · `/users` (droit `users`) |
| publications | `GET /publications?scope=&thematiqueId=&regionId=&q=&sector=…&limit=&offset=` → `Publication[]` (total dans `X-Total-Count` ; `sector` répétable : au moins un des secteurs) · `GET /publications/:id` · `GET /publications/latest-nipc` (site public : publications en ligne seulement) · `/admin/publications` (droit `publications`) + `POST /admin/publications/:id/submit` · `/publish` · `/return` `{ comment }` (droit `validate`) · `GET /admin/publications/:id/reviews` · `GET /admin/publications/stats` (tableau de bord) · `/thematiques` · `/regions` · `GET /sectors` · `/news` → `NewsItem[]` |
| chiffres | `/indicators` → `Indicator[]` (chiffres clés de l'accueil) · `/chiffres/types` · `/chiffres/indicators?typeId=` · `/chiffres/regions` · `/chiffres/values?figureRegionId=&indicatorId=` |
| files | `POST /files` (multipart, champ `file`, tout utilisateur connecté) → `{ id, name, size, type, url }` · `GET /files/:id` · `DELETE /files/:id` |

Convention CRUD : `GET /x`, `GET /x/:id`, `POST /x` (201), `PATCH /x/:id` (mise à jour **partielle**, comme
`Collection.update` côté front), `DELETE /x/:id` (204).

Correspondance avec le magasin en mémoire du front (`src/admin/data/AdminDataContext.tsx`) :
`add` → POST, `update` → PATCH, `remove` → DELETE, `savePublication` → POST/PATCH `/admin/publications`
(le marqueur `latestNipc` est retiré des autres dans la même transaction), `removeFigureRegion` → DELETE `/chiffres/regions/:id` (valeurs supprimées en cascade).

## Règles métier tenues côté serveur

Rôles (matrice dans `libs/common/src/contract/permissions.ts`, identique au front) :

| | Super administrateur | Administrateur | Éditeur |
|---|---|---|---|
| Publications | tout, dont valider | tout, dont valider | créer, modifier les siennes, soumettre |
| Thématiques, régions, types, indicateurs | tout | tout | — |
| Données par régions (`figures`) | tout | tout | consulter, ajouter, modifier |
| Comptes (`users`) | tout | comptes éditeurs : créer, consulter, modifier | — |
| Mon compte (nom, mot de passe) | oui | oui | oui |

- **Workflow de validation** (`apps/publications/src/publications/workflow/`, règles pures + tests) :
  brouillon → soumise → publiée, ou renvoyée avec un commentaire obligatoire. L'éditeur modifie et soumet ses
  brouillons et ses publications renvoyées ; l'administrateur publie, renvoie, publie directement un brouillon, et
  il est seul à modifier une publication en ligne. Seules les publications `published` sont visibles sur le site.
  Refus pour une question de droit : 403 ; pour une question de statut : 409 `INVALID_STATE`.
  Historique dans `publication_reviews`. Le marqueur « la plus récente NIPC » ne compte qu'en ligne : un brouillon
  peut le porter, il le prend aux autres au moment de sa publication.
- **Comptes** (`apps/auth/src/users/account-policy.ts`) : l'administrateur ne crée que des éditeurs et ne change ni
  rôle ni statut ; seul le super administrateur supprime. Personne ne modifie son propre rôle, ne se suspend ni ne se
  supprime ; il reste toujours au moins un super administrateur actif. Compte créé sans `password` : pas de connexion
  possible tant qu'on ne lui en donne pas un. Un compte suspendu ne se connecte plus et `GET /auth/me` le refuse, mais
  un jeton déjà émis reste valable jusqu'à son expiration pour les autres services ; de même, un nom changé dans
  « Mon compte » n'apparaît dans les jetons (auteur des publications) qu'à la connexion suivante.
- Publications : région obligatoire si `level = regional` (et effacée si `national`), secteurs dans la liste connue.
- Suppression d'une thématique, d'une région, d'un type ou d'un indicateur encore utilisé : 409 `IN_USE`.
- Une seule valeur par (région en chiffres, indicateur, année) : 409 `ALREADY_EXISTS`.
- Liens et images affichés sur le site : `http(s)://`, chemin `/…` ou ancre `#…` seulement. Fichiers : pas de SVG ni de HTML.

## Ajouter une migration

Fichier `services/<service>/migrations/NNN_description.sql`, appliqué au démarrage, une seule fois, dans une transaction
(`MigrationRunner` dans `libs/common/src/database/`). Ne jamais modifier une migration déjà appliquée : en ajouter une nouvelle.

## Le front

Relié à l'API (voir « Microservices » dans `instat-front-v2/README.md`). Pages publiques (`src/pages/`, routées dans `App.tsx`) :
`#/publications` (liste filtrable, filtres gardés dans l'adresse), `#/publications/:id` (fiche et documents),
`#/actualites`, `#/themes/<slug>` (rubriques du menu « Thèmes et données » : `slug` = alias d'une thématique
du back-office, ou groupe de secteurs défini dans `src/data/collections.ts`) ; toute autre route `#/…` affiche
« Page en préparation ». Repères :
- `src/lib/api.ts` : seul point d'accès à `/api` (jeton, erreurs `ApiError` avec le message du service, `uploadFile`).
- `src/admin/data/AdminDataContext.tsx` : collections du back-office (`add` → POST, `update` → PATCH avec `null`
  pour un champ vidé, `remove` → DELETE) et étapes du workflow ; `src/admin/useAction.ts` annonce réussite ou erreur.
- `src/admin/workflow.ts` : mêmes règles de workflow que le service, pour afficher les bons boutons (« Enregistrer et
  soumettre », « Enregistrer et publier », « Renvoyer… ») ; une publication non modifiable s'ouvre en consultation.
- `#/admin/compte` : « Mon compte » (nom, mot de passe), pour tous les rôles, depuis le menu du compte.
- `#/admin` : tableau de bord selon le rôle (`src/admin/pages/tableau-de-bord/`) — éditeur : ses publications à
  corriger, en attente, en brouillon ; administrateur : file « À valider », activité récente, publications en ligne par
  thématique, couverture de « Madagascar en chiffres » ; super administrateur : en plus, l'état des comptes. Pas de
  graphique décoratif : chiffres, tableaux et barres de longueur (une couleur, valeur toujours écrite).
- `npm run dev` relaie `/api` vers la passerelle (`vite.config.ts`) : lancer `docker compose up` d'abord.
- Images et documents passent par `POST /api/files` ; on enregistre l'`url` (image) ou l'`id` (document) renvoyés.

## Points ouverts

- `Publication.kind` n'est pas saisi dans le back-office : il est déduit du premier secteur (`kindOf()` dans `apps/publications/src/publications/publication-kind.ts`).
- Les chiffres clés de l'accueil (`/indicators`) et les actualités (`/news`) n'ont pas d'écran d'administration dans le front.
- Les actualités n'ont pas de contenu (seulement titre, date, contexte) : pas de page de détail, « Lire l'actualité » mène à la page « en préparation ».
- Routage par hash (`#/…`, `src/lib/route.ts`) : simple, mais invisible pour les moteurs de recherche. Passer à React Router (adresses `/publications/…`) le jour où le référencement compte.
- Documents d'exemple (`doc-…` des données de démonstration) : aucun fichier réel derrière.
- `figure_regions.region_id` désigne une région du service Publications sans clé étrangère (bases séparées) :
  supprimer une région ne touche pas « Madagascar en chiffres ».
- JWT HS256 avec un secret partagé : passer en RS256 (clé privée dans Auth seulement) si d'autres équipes ajoutent des services.
- Image de titre 900 × 600 : vérifiée par le front seulement.
- Carte interactive : l'image PostgreSQL est déjà PostGIS (base modèle `template_postgis`), aucun service ne l'utilise encore.
