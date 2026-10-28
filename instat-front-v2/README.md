# INSTAT Madagascar – refonte de la page d'accueil

Prototype du front-end de la page d'accueil, en **React 19 + TypeScript + Tailwind CSS 4** (build avec Vite).

## Lancer le projet

Le front dialogue avec les microservices du dossier `../services` par leur passerelle :
lancer d'abord `docker compose up` à la racine du dépôt (voir `../CLAUDE.md`).

```bash
npm install
npm run dev      # développement : http://localhost:5173 (/api est relayé vers http://localhost:8080)
npm run build    # vérification TypeScript + build de production dans dist/
npm run preview  # prévisualisation du build
```

Prérequis : Node.js 20 ou plus récent.

## Bibliothèque d'icônes

**lucide-react** (https://lucide.dev) : icônes SVG légères, importées une à une (seules celles utilisées sont embarquées dans le build).

## Typographie

- Titres : **Newsreader** (empattements, axe optique, italique pour les accents de titre)
- Texte et interface : **Public Sans** (chiffres tabulaires pour les indicateurs)
- Repères, dates, sources, codes : **IBM Plex Mono**

Les polices sont installées via `@fontsource` : aucune requête vers un service externe.

## Identité graphique

L'interface reprend les codes d'une publication statistique imprimée (annuaire, bulletin) plutôt que ceux d'une application :

- angles presque droits (`--radius-*` dans `src/index.css`), filets fins, filet épais noir en tête de tableau ;
- sections numérotées comme des tableaux (`components/home/SectionHead.tsx`, classe `.running-head`) ;
- laterite réservé aux repères : numéros, onglet actif, valeur mise en avant ;
- papier millimétré en fond des bandeaux verts (`.graph-paper`) ;
- thèmes présentés comme un sommaire, avec points de conduite (`.leader`) ;
- mention de source sous les indicateurs.

## Structure

```
src/
├── App.tsx                      routage : accueil, pages publiques, back-office
├── config.ts                    réglages VITE_* : données d'exemple, comptes de démonstration
├── types.ts                     types partagés (User, Role, Publication…)
├── context/AuthContext.tsx      état de connexion (user, login, logout)
├── lib/api.ts                   client de la passerelle d'API (jeton, erreurs, envoi de fichiers)
├── services/authService.ts      connexion par le service Auth (POST /auth/login)
├── hooks/useApiData.ts          lecture publique d'une ressource de l'API
├── pages/                       Publications (liste, fiche, rubriques #/themes/…), Actualités, « page en préparation »
├── hooks/useDismiss.ts          fermeture au clic extérieur / Échap
├── lib/format.ts                dates, nombres, initiales (fr-FR)
├── data/                        contenus fixes (navigation, thèmes, rubriques par secteurs) et données d'exemple (VITE_SAMPLE_DATA)
└── components/
    ├── layout/   TopBar, Navbar (menus + mobile), Logo, Footer
    ├── auth/     LoginModal, UserMenu
    └── home/     Hero (+ actualités), KeyFigures, Publications, Themes, DataAndServices
```

## Connexion des trois rôles

- Le bouton **Connexion** de la barre de navigation ouvre une fenêtre modale (`<dialog>` natif : focus piégé, fermeture avec Échap).
- Il n'y a **qu'un seul formulaire** : le rôle n'est pas choisi par l'utilisateur, il vient du compte.
  Trois rôles : `super_admin`, `admin`, `editor` (`src/types.ts`, libellés dans `src/data/roles.ts`).
- Une fois connecté, la barre affiche le menu du compte avec des raccourcis **selon le rôle**
  (l'éditeur voit « Rédiger une publication », l'administrateur ajoute la gestion de « Madagascar en chiffres »,
  le super administrateur ajoute la gestion des utilisateurs).
- Ces raccourcis ne sont qu'un reflet visuel. Les droits réels doivent être contrôlés côté serveur (RBAC dans le service d'authentification).

Comptes de démonstration (mot de passe `demo1234`) : `superadmin@instat.demo`, `admin@instat.demo`, `editeur@instat.demo`.
Ils sont créés par le service Auth quand `SEED_DEMO=true`, et proposés dans la fenêtre de connexion selon
`VITE_SHOW_DEMO_ACCOUNTS` (oui par défaut en développement ; dans l'image Docker, il suit `SEED_DEMO`).

## Microservices

Le front ne parle qu'à la passerelle d'API (`/api`), par `src/lib/api.ts`.

| Élément du front | Service |
|---|---|
| `services/authService.ts`, `context/AuthContext.tsx` | Auth : `POST /auth/login`, `GET /auth/me` (session restaurée au rechargement) |
| `components/home/KeyFigures.tsx` | « Madagascar en chiffres » : `GET /indicators` |
| `components/home/Publications.tsx` | Publications : `GET /publications?scope=…&limit=6` |
| `components/home/Hero.tsx` (actualités) | Publications : `GET /news` |
| `admin/data/AdminDataContext.tsx` | tout le back-office : chargé à la connexion, chaque écriture attend la réponse du serveur |
| `admin/ui/ImageUpload.tsx`, documents des publications | Fichiers : `POST /files` |

- Le jeton est gardé dans le `sessionStorage` de l'onglet ; un jeton refusé (expiré, compte désactivé) déconnecte.
- Les droits affichés (`admin/permissions.ts`) ne sont qu'un reflet : chaque écriture est contrôlée par le service.
- Publications : circuit de validation (brouillon, à valider, renvoyée, en ligne) ; règles dans `admin/workflow.ts`,
  écrans dans `admin/pages/publications/` (`WorkflowPanel`, `ReturnDialog`).
- « Mon compte » (`admin/pages/compte/`) : nom et mot de passe, pour tous les rôles.
- Une écriture refusée (doublon, élément utilisé ailleurs, droits) affiche le message du service ; la fenêtre reste ouverte.
- Réglages au build (`.env.example`) : `VITE_API_URL`, `VITE_API_PROXY`, `VITE_SAMPLE_DATA`, `VITE_SHOW_DEMO_ACCOUNTS`.

## Points à compléter

- Le **logo** est une marque provisoire (`components/layout/Logo.tsx`) : remplacer par le logo officiel.
- Les **valeurs des indicateurs** sont des exemples (signalés dans la page).
- Les **liens** utilisent un routage par hash (`#/publications/…`, `src/lib/route.ts`). Les rubriques pas encore rédigées
  affichent « Page en préparation ». Passer à React Router le jour où le référencement compte.
- La **carte interactive** (PostGIS côté données) n'est pas incluse : le lien « Explorer la carte interactive » est prévu pour elle.

## Accessibilité

Lien d'évitement, navigation au clavier (menus, onglets, carrousel), focus visible, `aria-live` sur les actualités,
formulaire avec libellés et erreur annoncée (`role="alert"`), `prefers-reduced-motion` respecté.
Le carrousel ne défile pas tout seul.
