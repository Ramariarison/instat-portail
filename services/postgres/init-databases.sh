#!/bin/sh
# Exécuté une seule fois, à la création du volume PostgreSQL (docker-entrypoint-initdb.d).
# Une base et un rôle par service : aucun service ne peut lire les tables d'un autre.
set -eu

create() {
  name="$1"
  password="$2"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres \
    -v name="$name" -v password="$password" <<'SQL'
CREATE ROLE :"name" LOGIN PASSWORD :'password';
CREATE DATABASE :"name" OWNER :"name";
REVOKE ALL ON DATABASE :"name" FROM PUBLIC;
SQL
}

create auth "$AUTH_DB_PASSWORD"
create publications "$PUBLICATIONS_DB_PASSWORD"
create chiffres "$CHIFFRES_DB_PASSWORD"
