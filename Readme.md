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