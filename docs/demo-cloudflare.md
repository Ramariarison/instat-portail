# Démonstration en ligne depuis ce poste (tunnel Cloudflare) — Portail INSTAT Madagascar

Pour une démonstration (soutenance, présentation) : le portail tourne sur ce poste avec `docker compose`, et un
**tunnel Cloudflare** lui donne une adresse publique en HTTPS, du type `https://mots-au-hasard.trycloudflare.com`.
Gratuit, sans compte, sans carte bancaire, sans serveur : le service `tunnel` (profil `demo` de `docker-compose.yml`)
ouvre une connexion sortante vers Cloudflare, aucun port n'est ouvert sur le poste.

```
visiteur ──HTTPS──▶ Cloudflare ◀──tunnel sortant── tunnel (cloudflared) ──▶ gateway ──▶ services ──▶ postgres
                                                    (ce poste, docker compose)
```

Limites : l'adresse **change à chaque démarrage du tunnel** (redémarrage du poste compris) ; le poste doit rester
allumé et connecté ; service gratuit de Cloudflare prévu pour des essais, sans garantie de disponibilité. Pour un
site permanent, voir `docs/deploiement-gcp.md` ou `docs/deploiement-oracle.md`.

## Lancer

Depuis la racine du dépôt, avec le `.env` de développement (`SEED_DEMO=true` : données d'exemple et comptes de
démonstration, pratiques pour montrer les trois rôles) :

```bash
docker compose --profile demo up -d --build
```

Adresse publique (quelques secondes après le démarrage) :

```bash
docker compose logs tunnel | grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' | tail -1
```

L'ouvrir dans le navigateur, et sur un téléphone pour vérifier qu'elle est bien joignable de l'extérieur.

## Arrêter

```bash
docker compose stop tunnel              # coupe seulement l'adresse publique, le portail reste sur http://localhost:8080
docker compose --profile demo down      # arrête tout (les données sont conservées ; ne pas ajouter -v)
```

## Sécurité

- Avec `SEED_DEMO=true`, la page de connexion **affiche les comptes de démonstration** et leur mot de passe
  (`demo1234`). Toute personne qui a l'adresse peut donc se connecter : ne la diffuser qu'au jury, et **arrêter le
  tunnel après la démonstration**.
- L'adresse, tirée au hasard, n'est annoncée nulle part ; elle disparaît dès que le tunnel s'arrête.
- La passerelle voit l'adresse réelle des visiteurs (`X-Forwarded-For` posé par le tunnel, `REAL_IP_FROM`) : la limite
  de tentatives de connexion s'applique bien à chacun.

## Le jour de la démonstration

1. **La veille** : une répétition complète par l'adresse publique (connexion, workflow de validation, carte de
   « Madagascar en chiffres »).
2. **Avant d'entrer dans la salle** : lancer, récupérer la nouvelle adresse, l'ouvrir une fois.
3. **Mise en veille du poste désactivée**, chargeur branché : en veille, le tunnel coupe.
4. **Connexion de secours** : partage de connexion d'un téléphone, si le réseau de la salle est filtré ou lent.
5. **Plan B hors ligne** : http://localhost:8080 fonctionne sans Internet, avec les mêmes données.
