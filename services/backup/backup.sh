#!/usr/bin/env bash
# Sauvegarde du portail, sur le serveur : bases PostgreSQL (pg_dumpall) et fichiers envoyés (volume « files »).
#   services/backup/backup.sh
#   → sauvegardes/AAAA-MM-JJ_HHMM-bases.sql.gz et sauvegardes/AAAA-MM-JJ_HHMM-fichiers.tar.gz
# Variables (facultatives, lues dans l'environnement ou dans le .env du dépôt) :
#   BACKUP_BUCKET=gs://…   copie en plus chaque sauvegarde vers Cloud Storage (gcloud storage cp)
#   BACKUP_DIR             dossier local (défaut : sauvegardes, à la racine du dépôt)
#   BACKUP_KEEP_DAYS       durée de conservation locale en jours (défaut : 7)
# Restauration : voir docs/deploiement-gcp.md.
set -euo pipefail

cd "$(dirname "$0")/../.."

env_value() {
  grep -E "^$1=" .env 2>/dev/null | tail -n 1 | cut -d= -f2- || true
}
bucket="${BACKUP_BUCKET:-$(env_value BACKUP_BUCKET)}"
dir="${BACKUP_DIR:-$(env_value BACKUP_DIR)}"
dir="${dir:-sauvegardes}"
keep="${BACKUP_KEEP_DAYS:-$(env_value BACKUP_KEEP_DAYS)}"
keep="${keep:-7}"
stamp="$(date +%Y-%m-%d_%H%M)"

umask 077
mkdir -p "$dir"

# Fichier .part pendant l'écriture : une sauvegarde interrompue ne passe jamais pour complète.
docker compose exec -T postgres pg_dumpall -U postgres --clean --if-exists \
  | gzip > "$dir/$stamp-bases.sql.gz.part"
mv "$dir/$stamp-bases.sql.gz.part" "$dir/$stamp-bases.sql.gz"

docker compose exec -T files tar -C /data/files -czf - . > "$dir/$stamp-fichiers.tar.gz.part"
mv "$dir/$stamp-fichiers.tar.gz.part" "$dir/$stamp-fichiers.tar.gz"

if [ -n "$bucket" ]; then
  gcloud storage cp --quiet "$dir/$stamp-bases.sql.gz" "$dir/$stamp-fichiers.tar.gz" "${bucket%/}/"
fi

find "$dir" -maxdepth 1 -name '*.gz' -mtime +"$keep" -delete
find "$dir" -maxdepth 1 -name '*.part' -mmin +60 -delete

echo "Sauvegarde $stamp terminée ($dir${bucket:+, copiée vers $bucket})."
