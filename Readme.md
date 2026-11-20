# SETUP

# KEYCLOAK

## EXPORT SETUP (RUN EVERY KEYCLOAK SETUP CHANGES)
Export/Import vía CLI (This method include users and password hashes)

### STEP 01 (CREATE THE FILE WITH KEYCLOAK SETUP)

```bash
docker exec -it <nombre_contenedor_keycloak> \
  /opt/keycloak/bin/kc.sh export \
  --dir /opt/keycloak/data/export \
  --realm <nombre-de-tu-realm> \
  --users realm_file \
  --http-management-port 9001
```

--realm: El realm específico a exportar (si se omite, exporta todos).

--users realm_file: Agrupa los usuarios dentro del mismo archivo JSON del realm (también puedes usar different_files si tienes miles de usuarios).

--dir: Directorio destino donde se guardará el archivo generado (ej. <realm>-realm.json).

### STEP 02 (EXTRACT THE CREATED FILE FROM THE CONTAINER AND COPY TO LOCAL MACHINE)

```bash
docker cp <nombre_contenedor_keycloak>:/opt/keycloak/data/export/<nombre-de-tu-realm>-realm.json ./realm-export.json
```

### STEP 03 (IMPORT SETUP INTO NEW KEYCLOAK INSTANCE)

Importación en el arranque (Recomendado para Docker Compose)
Monta el archivo exportado en la carpeta /opt/keycloak/data/import/ del nuevo contenedor y pasa la bandera --import-realm

```yaml
services:
  keycloak:
    image: quay.io/keycloak/keycloak:latest
    command: start-dev --import-realm
    volumes:
      - ./realm-export.json:/opt/keycloak/data/import/realm-export.json:ro
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    ports:
      - "8080:8080"
```

### STEP 04 (REBOOT KEYCLOAK WITH A CLEAN SETUP)

Reboot Keycloak with a clean DB.
The import flag only acts on an empty database: --import-realm only processes the JSON file if the realm does not exist in the database yet. If  already have the persistent volume 'keycloak_data', if the database was previously initialized, Keycloak will ignore the file.
In order to --import-realm read the JSON and load it into PostgreSQL:

```bash
# 1. Stop Keycloak services and delete the volume from it`s DB
docker compose stop keycloak keycloak-db
docker compose rm -f keycloak keycloak-db
docker volume rm guido-project_keycloak_data # (o el prefijo de volumen de tu carpeta: docker volume ls | grep keycloak_data)
# o también:
docker volume rm $(docker volume ls -q | grep keycloak_data)

# 2. Levantar nuevamente Keycloak y su base de datos
docker compose up -d keycloak-db
docker compose up -d keycloak
```

### STEP 05 (DISABLE HTTPS FOR DEV ENVIRONMENT)
Run this inside KC Docker containter
```bash
/opt/keycloak/bin/kcadm.sh update realms/master \
  -s sslRequired=NONE \
  --server http://localhost:8080 \
  --realm master \
  --user admin \
  --password 'TU_PASSWORD'
```

### STEP 06 (CREATE LOCAL DIRS FOR DOCKER VOLUMES)
```bash
sudo mkdir -p /srv/saas/{postgres,keycloak-db,minio,nats}
```

```bash
docker run --rm --entrypoint sh postgres:16-alpine -c 'id postgres'
docker run --rm --entrypoint sh nats:2.10-alpine -c 'id'
docker run --rm --entrypoint sh bitnamilegacy/minio:2025.7.23-debian-12-r5 -c 'id'

sudo chown UID:GID ./srv/saas/postgres ./srv/saas/keycloak-db
sudo chmod 700 ./srv/saas/postgres ./srv/saas/keycloak-db

sudo chown UID:GID ./srv/saas/nats ./srv/saas/minio
sudo chmod 750 ./srv/saas/nats ../srv/saas/minio

sudo chmod +a 'user:gus allow list,search,readattr,writeattr,readextattr,writeextattr,readsecurity,add_file,add_subdirectory,delete_child,file_inherit,directory_inherit' \
  ./srv/saas/{postgres,keycloak-db,nats,minio}
```