#!/usr/bin/env bash
# Scénario de bout en bout de l'API, à lancer sur une stack fraîche (données d'exemple, SEED_DEMO=true) :
#   services/test/api-smoke.sh http://localhost:8080/api
# Chaque ligne affiche OK ou ÉCHEC avec le code HTTP attendu ; le script se termine en erreur s'il y a un échec.
# Les connexions sont regroupées au début : la passerelle limite /auth/login à 10 par minute.

set -u
API=${1:-http://localhost:8080/api}
BODY=$(mktemp)
trap 'rm -f "$BODY"' EXIT
PASSED=0
FAILED=0

# req MÉTHODE CHEMIN [JETON] [JSON] → affiche le code HTTP, corps dans $BODY
req() {
  local method=$1 path=$2 token=${3:-} data=${4:-}
  local args=(-s -o "$BODY" -w "%{http_code}" -X "$method" "$API$path")
  [[ -n $token ]] && args+=(-H "Authorization: Bearer $token")
  [[ -n $data ]] && args+=(-H "Content-Type: application/json" -d "$data")
  curl "${args[@]}"
}

check() { # LIBELLÉ ATTENDU OBTENU
  if [[ $2 == "$3" ]]; then
    PASSED=$((PASSED + 1)); echo "OK     $1 ($3)"
  else
    FAILED=$((FAILED + 1)); echo "ÉCHEC  $1 : attendu $2, obtenu $3 — $(head -c 200 "$BODY")"
  fi
}

json() { python3 -c "import json,sys; d=json.load(open('$BODY')); print($1)"; }

login() {
  curl -s -X POST "$API/auth/login" -H "Content-Type: application/json" \
    -d "{\"email\":\"$1\",\"password\":\"${2:-demo1234}\"}" |
    python3 -c "import json,sys; print(json.load(sys.stdin).get('token',''))"
}

echo "== Authentification"
check "mauvais mot de passe" 401 "$(req POST /auth/login "" '{"email":"admin@instat.demo","password":"faux"}')"
check "compte désactivé" 403 "$(req POST /auth/login "" '{"email":"tahiry@instat.demo","password":"demo1234"}')"
SA=$(login superadmin@instat.demo)
AD=$(login ADMIN@instat.demo)
ED=$(login editeur@instat.demo)
sleep 7 # la passerelle n'accepte qu'une connexion toutes les 6 s au-delà des 6 premières
ED2=$(login voahangy@instat.demo)
[[ -n $SA && -n $AD && -n $ED && -n $ED2 ]] || { echo "ÉCHEC  connexion des comptes de démonstration"; exit 1; }
check "profil (me)" 200 "$(req GET /auth/me "$ED")"
check "rôle dans le profil" editor "$(json "d['role']")"
check "sans jeton" 401 "$(req GET /auth/me)"
check "jeton altéré" 401 "$(req GET /auth/me "${ED}x")"
check "matrice des droits" 200 "$(req GET /auth/permissions)"
check "Mon compte : nom" 200 "$(req PATCH /auth/me "$ED" '{"name":"Éditeur démo (modifié)"}')"
check "nom enregistré" "Éditeur démo (modifié)" "$(json "d['name']")"
check "Mon compte : nom vide" 400 "$(req PATCH /auth/me "$ED" '{"name":""}')"
check "Mon compte : mauvais mot de passe actuel" 400 "$(req POST /auth/password "$ED" '{"currentPassword":"faux","newPassword":"nouveau-mdp-1"}')"
req PATCH /auth/me "$ED" '{"name":"Éditeur démo"}' >/dev/null

echo "== Comptes"
check "liste des comptes (éditeur)" 403 "$(req GET /users "$ED")"
check "liste des comptes (admin)" 200 "$(req GET /users "$AD")"
check "admin : crée un éditeur" 201 "$(req POST /users "$AD" '{"name":"Éditeur créé","email":"cree@instat.demo","role":"editor","password":"motdepasse1"}')"
ADMIN_EDITOR=$(json "d['id']")
check "admin : renomme un éditeur" 200 "$(req PATCH "/users/$ADMIN_EDITOR" "$AD" '{"name":"Éditeur renommé"}')"
check "admin : ne crée pas d'admin" 403 "$(req POST /users "$AD" '{"name":"X","email":"x@instat.demo","role":"admin"}')"
check "admin : ne change pas un rôle" 403 "$(req PATCH "/users/$ADMIN_EDITOR" "$AD" '{"role":"admin"}')"
check "admin : ne suspend pas" 403 "$(req PATCH "/users/$ADMIN_EDITOR" "$AD" '{"active":false}')"
check "admin : ne modifie pas un autre admin" 403 "$(req PATCH /users/user-5 "$AD" '{"name":"X"}')"
check "admin : ne supprime pas" 403 "$(req DELETE "/users/$ADMIN_EDITOR" "$AD")"
check "super admin : suspend" 200 "$(req PATCH "/users/$ADMIN_EDITOR" "$SA" '{"active":false}')"
check "super admin : supprime" 204 "$(req DELETE "/users/$ADMIN_EDITOR" "$SA")"
check "liste des comptes (super admin)" 200 "$(req GET /users "$SA")"
check "création d'un compte" 201 "$(req POST /users "$SA" '{"name":"Test","email":"Test@Instat.demo","role":"editor","lastLogin":"ignoré"}')"
NEW_USER=$(json "d['id']")
check "e-mail normalisé" test@instat.demo "$(json "d['email']")"
check "e-mail en double" 409 "$(req POST /users "$SA" '{"name":"T2","email":"test@instat.demo","role":"editor"}')"
check "mot de passe défini" 200 "$(req PATCH "/users/$NEW_USER" "$SA" '{"password":"motdepasse1"}')"
check "on ne change pas son propre rôle" 403 "$(req PATCH /users/demo-1 "$SA" '{"role":"admin"}')"
check "on ne se supprime pas" 403 "$(req DELETE /users/demo-1 "$SA")"
check "suppression d'un compte" 204 "$(req DELETE "/users/$NEW_USER" "$SA")"
check "compte déjà supprimé" 404 "$(req DELETE "/users/$NEW_USER" "$SA")"

echo "== Publications (site public)"
check "liste nationale" 200 "$(req GET '/publications?scope=national&limit=3')"
check "3 résultats" 3 "$(json "len(d)")"
check "liste régionale, type déduit" "Tableau de bord régional" "$(req GET '/publications?scope=regional&limit=1' >/dev/null; json "d[0]['kind']")"
check "portée invalide" 400 "$(req GET '/publications?scope=x')"
check "recherche sans accents" 200 "$(req GET '/publications?q=ECONOMIE')"
check "filtre par secteurs" 200 "$(req GET '/publications?sector=annuaire&sector=rgph')"
check "secteur inconnu" 400 "$(req GET '/publications?sector=inconnu')"
check "fiche" 200 "$(req GET /publications/pub-tbe-63)"
check "dernière NIPC" 200 "$(req GET /publications/latest-nipc)"
check "actualités" 200 "$(req GET '/news?limit=2')"
check "2 actualités" 2 "$(json "len(d)")"
check "thématiques" 200 "$(req GET /thematiques)"
check "secteurs" 200 "$(req GET /sectors)"

echo "== Publications (back-office et workflow de validation)"
check "sans jeton" 401 "$(req GET /admin/publications)"
check "liste (éditeur)" 200 "$(req GET /admin/publications "$ED")"
check "les exemples sont en ligne" published "$(req GET /admin/publications/pub-tbe-63 "$ED" >/dev/null; json "d['status']")"
PUB='{"title":"NIPC test","level":"national","regionId":"reg-diana","thematiqueId":"th-economie","excerpt":"E","content":"C","date":"2026-05-28","latestNipc":true,"sectors":["nipc"],"documents":[{"id":"d1","name":"a.pdf","size":10}]}'
check "création (éditeur)" 201 "$(req POST /admin/publications "$ED" "$PUB")"
NEW_PUB=$(json "d['id']")
check "c'est un brouillon" draft "$(json "d['status']")"
check "auteur enregistré" demo-3 "$(json "d['createdBy']")"
check "région effacée (nationale)" False "$(json "'regionId' in d")"
check "brouillon absent du site" 404 "$(req GET "/publications/$NEW_PUB")"
check "le marqueur NIPC en ligne ne bouge pas" pub-nipc-2026-03 "$(req GET /publications/latest-nipc >/dev/null; json "d['id']")"
check "un autre éditeur ne modifie pas" 403 "$(req PATCH "/admin/publications/$NEW_PUB" "$ED2" '{"title":"X"}')"
check "un autre éditeur ne soumet pas" 403 "$(req POST "/admin/publications/$NEW_PUB/submit" "$ED2")"
check "passage en régionale" 200 "$(req PATCH "/admin/publications/$NEW_PUB" "$ED" '{"level":"regional","regionId":"reg-diana"}')"
check "régionale sans région" 400 "$(req PATCH "/admin/publications/$NEW_PUB" "$ED" '{"level":"regional","regionId":null}')"
check "secteur inconnu" 400 "$(req PATCH "/admin/publications/$NEW_PUB" "$ED" '{"sectors":["zzz"]}')"
check "thématique inconnue" 400 "$(req PATCH "/admin/publications/$NEW_PUB" "$ED" '{"thematiqueId":"th-nope"}')"
check "image en javascript:" 400 "$(req PATCH "/admin/publications/$NEW_PUB" "$ED" '{"imageUrl":"javascript:alert(1)"}')"
check "l'éditeur ne publie pas lui-même" 403 "$(req POST "/admin/publications/$NEW_PUB/publish" "$ED")"
check "soumission" 200 "$(req POST "/admin/publications/$NEW_PUB/submit" "$ED")"
check "statut soumis" submitted "$(json "d['status']")"
check "pas de double soumission" 409 "$(req POST "/admin/publications/$NEW_PUB/submit" "$ED")"
check "plus modifiable pendant la validation" 409 "$(req PATCH "/admin/publications/$NEW_PUB" "$ED" '{"title":"X"}')"
check "l'éditeur ne renvoie pas" 403 "$(req POST "/admin/publications/$NEW_PUB/return" "$ED" '{"comment":"Non"}')"
check "renvoi sans commentaire" 400 "$(req POST "/admin/publications/$NEW_PUB/return" "$AD" '{}')"
check "renvoi avec commentaire" 200 "$(req POST "/admin/publications/$NEW_PUB/return" "$AD" '{"comment":"Ajoutez la source des données."}')"
check "statut renvoyé" returned "$(json "d['status']")"
check "commentaire visible par l'éditeur" "Ajoutez la source des données." "$(req GET "/admin/publications/$NEW_PUB" "$ED" >/dev/null; json "d['returnComment']")"
check "correction par l'auteur" 200 "$(req PATCH "/admin/publications/$NEW_PUB" "$ED" '{"content":"C, source : INSTAT."}')"
check "nouvelle soumission" 200 "$(req POST "/admin/publications/$NEW_PUB/submit" "$ED")"
check "publication par l'admin" 200 "$(req POST "/admin/publications/$NEW_PUB/publish" "$AD")"
check "statut publié" published "$(json "d['status']")"
check "plus de commentaire de renvoi" False "$(json "'returnComment' in d")"
check "pas de double publication" 409 "$(req POST "/admin/publications/$NEW_PUB/publish" "$AD")"
check "en ligne sur le site" 200 "$(req GET "/publications/$NEW_PUB")"
check "le site ne montre ni auteur ni statut interne" False "$(json "'createdBy' in d or 'returnComment' in d")"
check "elle prend le marqueur NIPC" "$NEW_PUB" "$(req GET /publications/latest-nipc >/dev/null; json "d['id']")"
check "un seul marqueur NIPC en ligne" 1 "$(req GET /admin/publications "$AD" >/dev/null; json "sum(1 for p in d if p['latestNipc'] and p['status']=='published')")"
check "l'éditeur ne modifie plus une publication en ligne" 403 "$(req PATCH "/admin/publications/$NEW_PUB" "$ED" '{"title":"X"}')"
check "l'admin corrige une publication en ligne" 200 "$(req PATCH "/admin/publications/$NEW_PUB" "$AD" '{"title":"NIPC test (corrigé)"}')"
check "historique" 200 "$(req GET "/admin/publications/$NEW_PUB/reviews" "$ED")"
check "4 étapes dans l'historique" "submitted,returned,submitted,published" "$(json "','.join(r['action'] for r in d)")"
check "tableau de bord sans jeton" 401 "$(req GET /admin/publications/stats)"
check "tableau de bord (éditeur)" 200 "$(req GET /admin/publications/stats "$ED")"
check "dernière activité = la mise en ligne" published "$(json "d['recentActivity'][0]['action']")"
check "toutes les thématiques comptées" 16 "$(json "len(d['byThematique'])")"
check "publications en ligne = national + régional" True "$(json "d['byStatus']['published'] == d['publishedByLevel']['national'] + d['publishedByLevel']['regional']")"
check "l'admin publie directement un brouillon" 201 "$(req POST /admin/publications "$AD" "${PUB/NIPC test/Brouillon admin}")"
ADMIN_PUB=$(json "d['id']")
check "publication directe" 200 "$(req POST "/admin/publications/$ADMIN_PUB/publish" "$AD")"
check "région utilisée" 409 "$(req DELETE /regions/reg-diana "$AD")"
check "suppression (éditeur)" 403 "$(req DELETE "/admin/publications/$NEW_PUB" "$ED")"
check "suppression (admin)" 204 "$(req DELETE "/admin/publications/$NEW_PUB" "$AD")"
check "historique supprimé avec elle" 404 "$(req GET "/admin/publications/$NEW_PUB/reviews" "$AD")"
check "suppression (admin, 2)" 204 "$(req DELETE "/admin/publications/$ADMIN_PUB" "$AD")"
check "le marqueur NIPC n'est plus porté par la publication supprimée" 404 "$(req GET /publications/latest-nipc)"

echo "== Thématiques, régions, actualités"
check "création (éditeur)" 403 "$(req POST /thematiques "$ED" '{"name":"X","alias":"x"}')"
check "alias invalide" 400 "$(req POST /thematiques "$AD" '{"name":"X","alias":"X Y"}')"
check "alias en double" 409 "$(req POST /thematiques "$AD" '{"name":"X","alias":"economie"}')"
check "thématique utilisée" 409 "$(req DELETE /thematiques/th-economie "$AD")"
check "picto défini" 200 "$(req PATCH /thematiques/th-sante "$AD" '{"pictoUrl":"/api/files/file-0123456789abcdef"}')"
check "picto effacé (null)" 200 "$(req PATCH /thematiques/th-sante "$AD" '{"pictoUrl":null}')"
check "picto absent de la réponse" False "$(json "'pictoUrl' in d")"
check "création d'une actualité" 201 "$(req POST /news "$AD" '{"title":"Actualité de test","date":"2026-10-01"}')"
NEW_NEWS=$(json "d['id']")
check "lien par défaut" "#/actualites/$NEW_NEWS" "$(json "d['href']")"
check "suppression de l'actualité" 204 "$(req DELETE "/news/$NEW_NEWS" "$AD")"

echo "== Madagascar en chiffres"
check "chiffres clés" 200 "$(req GET /indicators)"
check "types" 200 "$(req GET /chiffres/types)"
check "indicateurs d'un type" 200 "$(req GET '/chiffres/indicators?typeId=type-geo')"
check "valeurs d'une région" 200 "$(req GET '/chiffres/values?figureRegionId=fr-madagascar')"
VALUE='{"figureRegionId":"fr-madagascar","indicatorId":"ind-superficie","year":2019,"value":1.5,"unit":"km²","source":"Test"}'
check "valeur saisie par l'éditeur" 201 "$(req POST /chiffres/values "$ED" "${VALUE/2019/2020}")"
EDITOR_VALUE=$(json "d['id']")
check "valeur corrigée par l'éditeur" 200 "$(req PATCH "/chiffres/values/$EDITOR_VALUE" "$ED" '{"value":2.5}')"
check "l'éditeur ne supprime pas" 403 "$(req DELETE "/chiffres/values/$EDITOR_VALUE" "$ED")"
check "l'éditeur ne gère pas les indicateurs" 403 "$(req POST /chiffres/indicators "$ED" '{"typeId":"type-geo","name":"X","picto":""}')"
check "valeur en double" 409 "$(req POST /chiffres/values "$AD" '{"figureRegionId":"fr-madagascar","indicatorId":"ind-superficie","year":2018,"value":1,"unit":"km²","source":"s"}')"
check "lien javascript:" 400 "$(req POST /chiffres/values "$AD" "${VALUE%\}},\"link\":\"javascript:x\"}")"
check "ajout d'une valeur" 201 "$(req POST /chiffres/values "$AD" "${VALUE%\}},\"link\":\"https://instat.mg\"}")"
check "type utilisé" 409 "$(req DELETE /chiffres/types/type-geo "$AD")"
check "fiche supprimée avec ses valeurs" 204 "$(req DELETE /chiffres/regions/fr-reg-diana "$AD")"
check "plus de valeurs" 0 "$(req GET '/chiffres/values?figureRegionId=fr-reg-diana' >/dev/null; json "len(d)")"

echo "== Fichiers"
PDF=$(mktemp --suffix=.pdf); SVG=$(mktemp --suffix=.svg)
printf '%%PDF-1.4 test' >"$PDF"; printf '<svg/>' >"$SVG"
upload() { curl -s -o "$BODY" -w "%{http_code}" ${2:+-H "Authorization: Bearer $2"} -F "file=@$1;type=$3;filename=${4:-fichier}" "$API/files"; }
check "envoi d'un PDF" 201 "$(upload "$PDF" "$ED" application/pdf "Rapport été.pdf")"
FILE=$(json "d['id']")
check "nom conservé" "Rapport été.pdf" "$(json "d['name']")"
check "SVG refusé" 415 "$(upload "$SVG" "$ED" image/svg+xml)"
check "envoi sans connexion" 401 "$(upload "$PDF" "" application/pdf)"
check "téléchargement" 200 "$(req GET "/files/$FILE")"
check "identifiant invalide" 404 "$(req GET /files/pas-un-identifiant)"
check "suppression (éditeur)" 403 "$(req DELETE "/files/$FILE" "$ED")"
check "suppression (admin)" 204 "$(req DELETE "/files/$FILE" "$AD")"
rm -f "$PDF" "$SVG"

echo
echo "Résultat : $PASSED OK, $FAILED échec(s)."
[[ $FAILED -eq 0 ]]
