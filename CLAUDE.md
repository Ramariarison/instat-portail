# Portail INSTAT Madagascar

Front React existant + microservices back-end, orchestrés par `docker-compose.yml`.

```
instat-portail/
├── instat-front-v2/     front React 19 + TypeScript + Tailwind 4 (Vite) — NE PAS MODIFIER sans accord explicite
├── services/            microservices (Node 24 + TypeScript + Fastify, PostgreSQL)
│   ├── shared/          code commun : contrat, RBAC, JWT, HTTP, SQL, CRUD générique
│   ├── auth/            connexion, jetons, comptes            → base « auth »
│   ├── publications/    thématiques, régions, publications, actualités → base « publications »
│   ├── chiffres/        « Madagascar en chiffres » + chiffres clés      → base « chiffres »
│   ├── files/           fichiers envoyés (images, documents)  → volume disque
│   ├── gateway/         nginx : passerelle /api + sert le build du front
│   └── postgres/        script de création des bases (une base et un rôle par service)
├── docker-compose.yml
└── .env.example
```

## Le contrat

Le front fait foi. Les réponses JSON reprennent **exactement** ses types :

- `instat-front-v2/src/types.ts` (site public : `User`, `Publication`, `NewsItem`, `Indicator`, `Role`)
- `instat-front-v2/src/admin/data/types.ts` (back-office : `Thematique`, `Region`, `AdminPublication`, `DataType`, `IndicatorDef`, `FigureRegion`, `FigureValue`, `AdminUser`)
- `instat-front-v2/src/admin/permissions.ts` (matrice RBAC)

Ils sont recopiés dans `services/shared/contract.ts` et `services/shared/permissions.ts`, et la liste des secteurs dans
`services/publications/src/sectors.ts`. **Si l'un change, changer l'autre.**

Règles de forme : camelCase ; un champ optionnel absent n'est pas renvoyé (jamais `null`, voir `compact()` dans
`shared/db.ts`) ; en écriture, `null` efface un champ optionnel ; identifiants texte préfixés (`pub-…`, `th-…`) ;
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

`SEED_DEMO=true` charge les données d'exemple du front (mêmes identifiants) et les comptes de démonstration
`superadmin@instat.demo`, `admin@instat.demo`, `editeur@instat.demo` (mot de passe `demo1234`), seulement si les tables sont vides.
En production : `SEED_DEMO=false` et `BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD` pour le premier super administrateur.

Hors Docker (un PostgreSQL accessible est nécessaire) :

```bash
cd services && npm install
npm run typecheck
JWT_SECRET=<32+ caractères> DATABASE_URL=postgres://… SEED_DEMO=true PORT=3001 npm run dev:auth
```

Pas d'étape de build : Node 24 exécute le TypeScript directement (suppression des types). Conséquences :
imports relatifs **avec l'extension `.ts`**, `import type` pour les types, pas d'`enum`, pas de `namespace`,
pas de propriétés de paramètres de constructeur (`erasableSyntaxOnly` dans `services/tsconfig.json`).

## Routes (via la passerelle, préfixe `/api`)

La passerelle retire `/api` et route selon le premier segment (`services/gateway/default.conf.template`).
Lecture publique sauf mention ; écriture = jeton `Authorization: Bearer …` + droit de la matrice RBAC.

| Service | Routes |
|---|---|
| auth | `POST /auth/login` → `{ token, expiresIn, user }` · `GET /auth/me` · `POST /auth/password` · `GET /auth/permissions` · `/users` (droit `users`) |
| publications | `GET /publications?scope=&thematiqueId=&regionId=&q=&limit=&offset=` → `Publication[]` (total dans `X-Total-Count`) · `GET /publications/:id` · `GET /publications/latest-nipc` · `/admin/publications` (droit `publications`) · `/thematiques` · `/regions` · `GET /sectors` · `/news` → `NewsItem[]` |
| chiffres | `/indicators` → `Indicator[]` (chiffres clés de l'accueil) · `/chiffres/types` · `/chiffres/indicators?typeId=` · `/chiffres/regions` · `/chiffres/values?figureRegionId=&indicatorId=` |
| files | `POST /files` (multipart, champ `file`, tout utilisateur connecté) → `{ id, name, size, type, url }` · `GET /files/:id` · `DELETE /files/:id` |

Convention CRUD (`registerCrud` dans `shared/crud.ts`) : `GET /x`, `GET /x/:id`, `POST /x` (201), `PATCH /x/:id`
(mise à jour **partielle**, comme `Collection.update` côté front), `DELETE /x/:id` (204), `?limit=` sur la liste.
`/users` et `/admin/publications` suivent la même convention mais sont écrits à la main (règles propres).

Correspondance avec le magasin en mémoire du front (`src/admin/data/AdminDataContext.tsx`) :
`add` → POST, `update` → PATCH, `remove` → DELETE, `savePublication` → POST/PATCH `/admin/publications`
(le marqueur `latestNipc` est retiré des autres dans la même transaction), `removeFigureRegion` → DELETE `/chiffres/regions/:id` (valeurs supprimées en cascade).

## Règles métier tenues côté serveur

- RBAC à chaque écriture (`requirePermission(resource, action)`), y compris les cas que le front masque seulement.
- Comptes : e-mail unique (insensible à la casse), impossible de modifier son propre rôle, de se désactiver ou de se supprimer,
  et il reste toujours au moins un super administrateur actif. Compte créé sans `password` : ne peut pas se connecter
  tant qu'un super administrateur ne lui en a pas donné un (`PATCH /users/:id { password }`). Un compte désactivé ne peut plus se connecter
  et `GET /auth/me` le refuse, mais un jeton déjà émis reste valable jusqu'à son expiration pour les autres services.
- Publications : région obligatoire si `level = regional` (et effacée si `national`), secteurs dans la liste connue, une seule `latestNipc`.
- Suppression d'une thématique, d'une région, d'un type ou d'un indicateur encore utilisé : 409 `IN_USE`.
- Une seule valeur par (région en chiffres, indicateur, année) : 409 `ALREADY_EXISTS`.
- Liens et images affichés sur le site : `http(s)://`, chemin `/…` ou ancre `#…` seulement. Fichiers : pas de SVG ni de HTML.

## Ajouter une migration

Fichier `services/<service>/migrations/NNN_description.sql`, appliqué au démarrage, une seule fois, dans une transaction
(`migrate()` dans `shared/db.ts`). Ne jamais modifier une migration déjà appliquée : en ajouter une nouvelle.

## Le front

Relié à l'API (voir « Microservices » dans `instat-front-v2/README.md`). Pages publiques (`src/pages/`, routées dans `App.tsx`) :
`#/publications` (liste filtrable, filtres gardés dans l'adresse), `#/publications/:id` (fiche et documents),
`#/actualites` ; toute autre route `#/…` affiche « Page en préparation ». Repères :
- `src/lib/api.ts` : seul point d'accès à `/api` (jeton, erreurs `ApiError` avec le message du service, `uploadFile`).
- `src/admin/data/AdminDataContext.tsx` : collections du back-office (`add` → POST, `update` → PATCH avec `null`
  pour un champ vidé, `remove` → DELETE) ; `src/admin/useAction.ts` annonce réussite ou erreur.
- `npm run dev` relaie `/api` vers la passerelle (`vite.config.ts`) : lancer `docker compose up` d'abord.
- Images et documents passent par `POST /api/files` ; on enregistre l'`url` (image) ou l'`id` (document) renvoyés.

## Points ouverts

- `Publication.kind` n'est pas saisi dans le back-office : il est déduit du premier secteur (`kindOf()` dans `publications/src/sectors.ts`).
- Les chiffres clés de l'accueil (`/indicators`) et les actualités (`/news`) n'ont pas d'écran d'administration dans le front.
- Les actualités n'ont pas de contenu (seulement titre, date, contexte) : pas de page de détail, « Lire l'actualité » mène à la page « en préparation ».
- Routage par hash (`#/…`, `src/lib/route.ts`) : simple, mais invisible pour les moteurs de recherche. Passer à React Router (adresses `/publications/…`) le jour où le référencement compte.
- Documents d'exemple (`doc-…` des données de démonstration) : aucun fichier réel derrière.
- `figure_regions.region_id` désigne une région du service Publications sans clé étrangère (bases séparées) :
  supprimer une région ne touche pas « Madagascar en chiffres ».
- JWT HS256 avec un secret partagé : passer en RS256 (clé privée dans Auth seulement) si d'autres équipes ajoutent des services.
- Image de titre 900 × 600 : vérifiée par le front seulement.
- Carte interactive : l'image PostgreSQL est déjà PostGIS (base modèle `template_postgis`), aucun service ne l'utilise encore.
