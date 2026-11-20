# Déploiement sur Google Cloud Platform — Portail INSTAT Madagascar

Une machine virtuelle Compute Engine fait tourner la même pile que sur le poste de développement
(`docker compose`), avec en plus :

- **Caddy** (profil `production` de `docker-compose.yml`, `services/caddy/Caddyfile`) : HTTPS avec un certificat
  Let's Encrypt obtenu et renouvelé automatiquement, devant la passerelle nginx ;
- **les sauvegardes** (`services/backup/backup.sh`) : bases et fichiers envoyés, chaque nuit, copiés dans Cloud Storage ;
- **des instantanés quotidiens du disque** de la machine.

```
Internet ──443──▶ caddy ──▶ gateway (nginx : site + /api) ──▶ auth · publications · chiffres · files ──▶ postgres
                  (VM Compute Engine, docker compose)                                     volumes : pgdata, files
```

Coût indicatif : VM e2-medium + disque de 30 Go + IP fixe ≈ 30 à 40 $ par mois (région `africa-south1`), couverts
pendant 90 jours par le crédit de l'essai gratuit.

Dans les commandes ci-dessous, remplacez :

| Valeur | Par |
|---|---|
| `PROJET` | l'identifiant du projet GCP (ex. `instat-portail-123456`) |
| `portail.instat.mg` | le domaine du site |
| `gs://instat-portail-sauvegardes` | un nom de bucket libre (unique sur tout GCP) |
| `<url-du-dépôt>` | l'adresse Git du dépôt |

---

## 1. Créer le compte et activer l'essai gratuit

1. Aller sur https://cloud.google.com/free → **« Commencer gratuitement »**, avec un compte Google de l'INSTAT
   (pas un compte personnel : le service ne doit pas dépendre d'une seule personne).
2. Pays, type de compte **Organisation**, accepter les conditions.
3. Saisir une carte Visa ou Mastercard (les cartes prépayées sont souvent refusées). Elle sert à vérifier l'identité :
   rien n'est prélevé tant que le compte n'est pas passé manuellement en compte payant.
4. Crédit obtenu : **300 $ pendant 90 jours**.

> À la fin de l'essai, les ressources sont arrêtées si le compte n'est pas passé en payant
> (**Facturation → Passer à un compte payant**). Le faire avant le 90ᵉ jour pour ne pas couper le site.

## 2. Créer le projet et une alerte de budget

1. Console https://console.cloud.google.com → sélecteur de projet en haut → **Nouveau projet** → `instat-portail`.
   Noter l'identifiant exact affiché (`PROJET`).
2. **Facturation → Budgets et alertes → Créer un budget** : 40 $ par mois, alertes par e-mail à 50 %, 90 % et 100 %.

## 3. Ouvrir Cloud Shell

Icône **`>_`** en haut à droite de la console : un terminal dans le navigateur, `gcloud` déjà installé et connecté.
Toutes les commandes des étapes 3 à 5 s'y tapent.

```bash
gcloud config set project PROJET
gcloud services enable compute.googleapis.com storage.googleapis.com
```

## 4. Compte de service et bucket des sauvegardes

La VM tourne avec un compte de service dédié qui n'a qu'un droit : déposer des fichiers dans le bucket des sauvegardes
(il ne peut ni les lire ni les effacer, même si la machine est compromise).

```bash
gcloud iam service-accounts create instat-vm --display-name="VM du portail INSTAT"

gcloud storage buckets create gs://instat-portail-sauvegardes \
  --location=africa-south1 --uniform-bucket-level-access --public-access-prevention

gcloud storage buckets add-iam-policy-binding gs://instat-portail-sauvegardes \
  --member=serviceAccount:instat-vm@PROJET.iam.gserviceaccount.com --role=roles/storage.objectCreator
```

Effacement automatique des sauvegardes de plus de 60 jours :

```bash
echo '{"rule":[{"action":{"type":"Delete"},"condition":{"age":60}}]}' > cycle.json
gcloud storage buckets update gs://instat-portail-sauvegardes --lifecycle-file=cycle.json
```

## 5. IP fixe, pare-feu et machine virtuelle

```bash
gcloud compute addresses create instat-ip --region=africa-south1
gcloud compute addresses describe instat-ip --region=africa-south1 --format="value(address)"   # noter l'IP

gcloud compute firewall-rules create instat-web --allow=tcp:80,tcp:443,udp:443 --target-tags=instat-web

gcloud compute instances create instat-vm \
  --zone=africa-south1-a --machine-type=e2-medium \
  --image-family=debian-12 --image-project=debian-cloud --boot-disk-size=30GB \
  --address=instat-ip --tags=instat-web \
  --service-account=instat-vm@PROJET.iam.gserviceaccount.com --scopes=cloud-platform
```

- e2-medium (2 vCPU, 4 Go) au minimum : la construction des images (front Vite, services webpack) manque de mémoire
  sur une e2-small.
- Ne jamais ouvrir 5432 (PostgreSQL), 5050 (pgAdmin) ni 8080 (passerelle) : seuls 80 et 443 sont publics.
- L'accès SSH (port 22) passe par `gcloud compute ssh`, déjà autorisé par la règle par défaut du projet.

## 6. Nom de domaine

Chez le gestionnaire du domaine : enregistrement **A** `portail` (→ `portail.instat.mg`) vers l'IP notée à l'étape 5.
Vérifier depuis Cloud Shell, avant l'étape 9 (sans cela, Caddy n'obtient pas de certificat) :

```bash
getent hosts portail.instat.mg
```

## 7. Installer Docker sur la machine

```bash
gcloud compute ssh instat-vm --zone=africa-south1-a
```

Sur la VM :

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
sudo apt-get install -y git unattended-upgrades     # mises à jour de sécurité automatiques du système
exit
```

Se reconnecter (`gcloud compute ssh …`) pour que le groupe `docker` soit pris en compte, puis vérifier : `docker ps`.

## 8. Récupérer le code et écrire le `.env`

Sur le poste de développement, tout doit être commité et poussé. Sur la VM :

```bash
git clone <url-du-dépôt> instat-portail
cd instat-portail
cp .env.example .env
for v in JWT_SECRET POSTGRES_PASSWORD AUTH_DB_PASSWORD PUBLICATIONS_DB_PASSWORD CHIFFRES_DB_PASSWORD; do
  sed -i "s|^$v=.*|$v=$(openssl rand -hex 32)|" .env
done
nano .env
```

Dépôt privé : utiliser une clé de déploiement SSH en lecture seule (GitHub/GitLab → *Deploy keys*), jamais un mot de passe.

Dans `nano`, régler :

```ini
SEED_DEMO=false
BOOTSTRAP_ADMIN_EMAIL=prenom.nom@instat.mg
BOOTSTRAP_ADMIN_PASSWORD=<mot de passe solide, retiré après la première connexion>
CORS_ORIGIN=

COMPOSE_PROFILES=production
DOMAIN=portail.instat.mg
GATEWAY_PORT=127.0.0.1:8080
BACKUP_BUCKET=gs://instat-portail-sauvegardes
```

Puis :

```bash
chmod 600 .env
```

**Garder une copie du `.env`** dans le gestionnaire de mots de passe de l'INSTAT : une sauvegarde des bases ne se
restaure qu'avec les mêmes mots de passe, et sans `JWT_SECRET` tous les jetons émis deviennent invalides.

## 9. Lancer le portail

```bash
docker compose up -d --build        # premier lancement : plusieurs minutes
docker compose ps                   # tous les services « healthy », caddy « running »
docker compose logs caddy | grep -i certificate
```

Ouvrir https://portail.instat.mg, se connecter avec `BOOTSTRAP_ADMIN_EMAIL`, puis **effacer la ligne
`BOOTSTRAP_ADMIN_PASSWORD`** du `.env` (le compte existe désormais, la variable ne sert plus).

Contrôles :

- `docker compose logs gateway | tail` : les adresses affichées sont celles des visiteurs (pas `172.…`), sinon la
  limite de tentatives de connexion s'appliquerait à tout le monde à la fois (`REAL_IP_FROM`) ;
- `curl -I http://portail.instat.mg` renvoie une redirection vers `https://` ;
- https://portail.instat.mg/api/docs/auth/ affiche la documentation de l'API.

## 10. Sauvegardes

### Chaque nuit, bases et fichiers vers Cloud Storage

Essai manuel :

```bash
services/backup/backup.sh
ls -lh sauvegardes/
```

Puis tâche planifiée (`crontab -e`), tous les jours à 2 h 30 :

```cron
30 2 * * * $HOME/instat-portail/services/backup/backup.sh >> $HOME/sauvegarde.log 2>&1
```

Le script garde 7 jours en local (`BACKUP_KEEP_DAYS`) ; le bucket en garde 60 (règle de l'étape 4).

### Instantanés du disque

Console → **Compute Engine → Instantanés → Créer une planification d'instantanés** (région `africa-south1`,
quotidienne, conservation 14 jours), puis **Disques → instat-vm → Modifier → Planification d'instantanés**.

### Restaurer

Sur la machine (ou une nouvelle, préparée jusqu'à l'étape 8 avec **le même `.env`**). Pour une sauvegarde du bucket,
la récupérer d'abord depuis Cloud Shell (le compte de la VM ne peut pas lire le bucket) :
`gcloud storage cp gs://instat-portail-sauvegardes/<date>-* .` puis la copier sur la VM (`gcloud compute scp`).

```bash
cd ~/instat-portail
docker compose up -d postgres
docker compose stop caddy gateway auth publications chiffres files

# Bases : la sauvegarde supprime puis recrée les bases et les rôles (messages « already exists » sans gravité).
gunzip -c sauvegardes/<date>-bases.sql.gz | docker compose exec -T postgres psql -U postgres -d postgres

# Fichiers envoyés
docker compose run --rm -T --no-deps --entrypoint tar files -C /data/files -xzf - < sauvegardes/<date>-fichiers.tar.gz

docker compose up -d
```

Faire au moins une restauration d'essai (sur une VM de test) avant de compter sur les sauvegardes.

## 11. Mettre à jour le portail

```bash
cd ~/instat-portail
git pull
docker compose up -d --build        # les migrations s'appliquent au démarrage des services
docker image prune -f               # libère l'espace des anciennes images
```

Pour se connecter à pgAdmin sur le serveur, ne pas ouvrir de port : tunnel SSH depuis le poste
(`gcloud compute ssh instat-vm --zone=africa-south1-a -- -L 5050:127.0.0.1:5050`) après
`docker compose --profile outils up -d pgadmin` sur la VM, puis http://localhost:5050 ; l'arrêter ensuite
(`docker compose stop pgadmin`).
