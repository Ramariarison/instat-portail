# Déploiement sur Oracle Cloud (offre « Always Free ») — Portail INSTAT Madagascar

Même principe que sur GCP (`docs/deploiement-gcp.md`) : une machine virtuelle fait tourner `docker compose`, avec
Caddy (HTTPS automatique) devant la passerelle, et les sauvegardes copiées dans un stockage objet. Particularités
d'Oracle Cloud :

- la machine gratuite est **ARM** (Ampere A1) : PostgreSQL tourne avec l'image `postgres:17-alpine`
  (`POSTGRES_IMAGE`), l'image PostGIS n'existant qu'en amd64 (PostGIS n'est pas utilisé) ;
- **deux pare-feu** à ouvrir : la *security list* du réseau Oracle, et celui du système Ubuntu de la machine ;
- les sauvegardes vont dans **Object Storage**, la machine s'y identifie seule (*instance principal*, aucune clé stockée).

```
Internet ──443──▶ caddy ──▶ gateway (nginx : site + /api) ──▶ auth · publications · chiffres · files ──▶ postgres
                  (VM Ampere A1, Ubuntu 24.04, docker compose)                         volumes : pgdata, files
```

Ressources gratuites utilisées (limites « Always Free », sans durée) : 4 OCPU ARM et 24 Go de mémoire, 100 Go de disque
de démarrage (sur 200), un bucket Object Storage (20 Go), 4 sauvegardes du disque (sur 5).

> **Rester dans le gratuit** : à chaque création, vérifier la mention **« Always Free-eligible »**. Les 300 $ de crédit
> d'essai (30 jours) permettent de créer des ressources payantes : ne pas s'en servir ici.

> **Machine inactive récupérée** : sur un compte resté en « Free Tier », Oracle peut arrêter une machine Always Free
> jugée inactive (processeur, réseau et mémoire très peu utilisés pendant 7 jours). Un portail peu visité peut être
> concerné. Parades : les sauvegardes hors de la machine (étape 11), et, le jour où le site est officiel, passer le compte
> en **Pay As You Go** (les ressources Always Free restent gratuites, ces règles ne s'appliquent plus).

Dans les commandes, remplacer :

| Valeur | Par |
|---|---|
| `IP` | l'adresse publique de la machine (étape 5) |
| `portail.instat.mg` | le domaine du site |
| `<url-du-dépôt>` | `https://github.com/Ramariarison/instat-portail.git` |

---

## 1. Créer le compte

1. https://www.oracle.com/cloud/free/ → **« Start for free »**.
2. Pays : Madagascar ; nom, adresse e-mail (lien de vérification envoyé par e-mail).
3. **Cloud Account Name** : par exemple `instat` (c'est le nom du « tenancy », demandé à chaque connexion).
4. **Home Region** : **South Africa Central (Johannesburg)**, la plus proche de Madagascar.
   ⚠️ Définitif : les machines Always Free ne se créent que dans cette région.
5. Adresse, téléphone, puis la carte bancaire : une **réservation temporaire** (environ 1 $) vérifie la carte, puis
   est annulée ; rien n'est prélevé. À saisir vous-même.
6. Attendre l'e-mail « Your Oracle Cloud account is fully provisioned » (de quelques minutes à quelques heures),
   puis se connecter sur https://cloud.oracle.com avec le *Cloud Account Name*.

## 2. Créer un compartiment

Un compartiment regroupe les ressources du portail (et sert à limiter les droits de la machine, étape 10).

Menu ☰ → **Identity & Security → Compartments → Create Compartment** : nom `instat`, parent : la racine.

Ensuite, **choisir le compartiment `instat`** dans la liste de gauche de chaque écran avant de créer une ressource.

## 3. Créer le réseau

Menu ☰ → **Networking → Virtual Cloud Networks → Start VCN Wizard → Create VCN with Internet Connectivity** :
nom `instat-vcn`, compartiment `instat`, le reste par défaut → **Create**.

Ouvrir le web : **instat-vcn → Subnets → public subnet-instat-vcn → Security Lists → Default Security List → Add
Ingress Rules**, trois règles avec *Source CIDR* `0.0.0.0/0` :

| IP Protocol | Destination Port Range |
|---|---|
| TCP | 80 |
| TCP | 443 |
| UDP | 443 |

La règle SSH (TCP 22) existe déjà. Ne jamais ouvrir 5432, 5050 ni 8080.

## 4. Créer la machine

Menu ☰ → **Compute → Instances → Create instance** :

- **Name** : `instat-vm`, compartiment `instat` ;
- **Image** : *Change image* → **Canonical Ubuntu 24.04** ;
- **Shape** : *Change shape* → **Ampere** → **VM.Standard.A1.Flex**, **4 OCPU**, **24 Go** (mention *Always Free-eligible*) ;
- **Networking** : `instat-vcn`, sous-réseau public, *Assign a public IPv4 address* coché ;
- **SSH keys** : *Generate a key pair for me* → **Save private key** (fichier `ssh-key-….key`, à garder précieusement :
  sans lui, plus d'accès à la machine) ;
- **Boot volume** : *Specify a custom boot volume size* → **100 Go**.

**Create**. Si le message *Out of capacity for shape VM.Standard.A1.Flex* apparaît : les machines ARM gratuites sont
momentanément toutes prises dans la région ; réessayer plus tard (souvent tôt le matin), ou avec 2 OCPU et 12 Go.

## 5. Adresse publique

Sur la page de l'instance, **Public IP address** : c'est `IP`. Elle reste la même tant que l'instance existe
(redémarrages compris). Pour la garder même si l'instance est recréée : **Attached VNICs → la VNIC → IPv4 Addresses →
⋯ → Edit → Reserved public IP**.

## 6. Se connecter à la machine

Depuis Windows (PowerShell), dans le dossier où se trouve la clé :

```powershell
icacls .\ssh-key.key /inheritance:r
icacls .\ssh-key.key /grant:r "$($env:USERNAME):(R)"
ssh -i .\ssh-key.key ubuntu@IP
```

Depuis Linux ou WSL : `chmod 600 ssh-key.key && ssh -i ssh-key.key ubuntu@IP`.

## 7. Ouvrir le pare-feu d'Ubuntu

Les images Ubuntu d'Oracle bloquent tout sauf SSH, en plus de la *security list* :

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p udp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

## 8. Installer Docker, récupérer le code, écrire le `.env`

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
sudo apt-get install -y git pipx
exit
```

Se reconnecter (`ssh …`), puis :

```bash
git clone <url-du-dépôt> instat-portail
cd instat-portail
cp .env.example .env
for v in JWT_SECRET POSTGRES_PASSWORD AUTH_DB_PASSWORD PUBLICATIONS_DB_PASSWORD CHIFFRES_DB_PASSWORD; do
  sed -i "s|^$v=.*|$v=$(openssl rand -hex 32)|" .env
done
nano .env
```

Régler :

```ini
SEED_DEMO=false
BOOTSTRAP_ADMIN_EMAIL=prenom.nom@instat.mg
BOOTSTRAP_ADMIN_PASSWORD=<mot de passe solide, retiré après la première connexion>
CORS_ORIGIN=

COMPOSE_PROFILES=production
DOMAIN=portail.instat.mg
GATEWAY_PORT=127.0.0.1:8080
POSTGRES_IMAGE=postgres:17-alpine
BACKUP_BUCKET=oci://instat-sauvegardes
```

puis `chmod 600 .env`. **Garder une copie du `.env`** en lieu sûr (gestionnaire de mots de passe) : une sauvegarde des
bases ne se restaure qu'avec les mêmes mots de passe.

**Pas encore de nom de domaine ?** Pour essayer, `DOMAIN=IP-AVEC-DES-TIRETS.sslip.io` (ex. `158-101-12-34.sslip.io`) :
ce nom pointe tout seul vers l'adresse et Caddy obtient un vrai certificat HTTPS.

## 9. Nom de domaine et lancement

Chez le gestionnaire du domaine : enregistrement **A** `portail` vers `IP`. Vérifier : `getent hosts portail.instat.mg`.

```bash
docker compose up -d --build        # premier lancement : plusieurs minutes
docker compose ps                   # tous « healthy », caddy « running »
docker compose logs caddy | grep -i certificate
```

Ouvrir https://portail.instat.mg, se connecter avec `BOOTSTRAP_ADMIN_EMAIL`, puis **effacer `BOOTSTRAP_ADMIN_PASSWORD`**
du `.env`. Contrôles : `docker compose logs gateway | tail` montre les adresses des visiteurs (pas `172.…`) ;
`curl -I http://portail.instat.mg` redirige vers `https://`.

Le site ne répond pas ? Vérifier dans l'ordre : la *security list* (étape 3), le pare-feu Ubuntu (étape 7),
`docker compose ps`, puis `docker compose logs caddy`.

## 10. Bucket des sauvegardes et droits de la machine

1. **Bucket** : Menu ☰ → **Storage → Buckets** (compartiment `instat`) → **Create Bucket** : nom
   `instat-sauvegardes`, *Standard*, le reste par défaut (jamais public).
2. **Groupe dynamique** (désigne la machine) : Menu ☰ → **Identity & Security → Domains → Default → Dynamic groups →
   Create dynamic group** : nom `instat-vm`, règle (OCID copié sur la page de l'instance) :
   ```
   instance.id = 'ocid1.instance.oc1.af-johannesburg-1.…'
   ```
3. **Politique** (ce que la machine peut faire) : Menu ☰ → **Identity & Security → Policies** (compartiment racine) →
   **Create Policy** : nom `instat-vm-sauvegardes`, *Show manual editor* :
   ```
   Allow dynamic-group 'Default'/'instat-vm' to manage objects in compartment instat where all {target.bucket.name = 'instat-sauvegardes', any {request.permission = 'OBJECT_CREATE', request.permission = 'OBJECT_INSPECT'}}
   ```
   La machine peut déposer et lister des sauvegardes, pas les lire ni les effacer (même compromise).
4. **Outil `oci`** sur la machine, puis essai (les droits mettent quelques minutes à s'appliquer) :
   ```bash
   pipx install oci-cli
   ~/.local/bin/oci os object list --auth instance_principal --bucket-name instat-sauvegardes
   ```
   Réponse attendue : `{"data": []}` (ou la liste des objets). `NotAuthorizedOrNotFound` : revoir 2 et 3.

**Conservation (facultatif)** : pour effacer automatiquement les sauvegardes de plus de 60 jours, ajouter à la politique
la ligne `Allow service objectstorage-af-johannesburg-1 to manage object-family in compartment instat`, puis
**Buckets → instat-sauvegardes → Lifecycle Policy Rules → Create Rule** : *Delete*, 60 jours. Sinon, faire le ménage
de temps en temps : une nuit de sauvegarde pèse quelques Mo, les 20 Go gratuits tiennent longtemps.

## 11. Sauvegardes

Essai manuel, puis tâche planifiée (`crontab -e`), tous les jours à 2 h 30 :

```bash
services/backup/backup.sh
```

```cron
30 2 * * * $HOME/instat-portail/services/backup/backup.sh >> $HOME/sauvegarde.log 2>&1
```

Le script garde 7 jours en local et copie chaque sauvegarde dans `instat-sauvegardes`.

**Sauvegardes du disque** (gratuites jusqu'à 5) : Menu ☰ → **Storage → Block Storage → Backup Policies → Create** :
`instat-hebdo`, une sauvegarde **hebdomadaire**, conservée **4 semaines**. Puis **Compute → Boot Volumes → instat-vm
(Boot Volume) → Edit → Backup policy** : `instat-hebdo`.

**Restaurer** : télécharger les deux fichiers depuis la console (**Buckets → instat-sauvegardes → ⋯ → Download**),
les copier sur la machine (`scp -i ssh-key.key fichier ubuntu@IP:instat-portail/sauvegardes/`), puis suivre
« Restaurer » dans `docs/deploiement-gcp.md` (mêmes commandes).

## 12. Mettre à jour le portail

```bash
cd ~/instat-portail
git pull
docker compose up -d --build
docker image prune -f
```

pgAdmin : tunnel SSH depuis le poste (`ssh -i ssh-key.key -L 5050:127.0.0.1:5050 ubuntu@IP`) après
`docker compose --profile outils up -d pgadmin` sur la machine, puis http://localhost:5050 ; l'arrêter ensuite.
