# Configuración de Keycloak para desarrollo

La instancia local utiliza el realm `saas-contable` y el cliente OIDC público `guido`.

- Issuer: `http://localhost:8080/realms/saas-contable`
- Audience del access token: `account`
- Tenant canónico: `authorization.client_id` (`guido`)
- Permisos de entrada: `authorization.routes` y `authorization.actions`
- Permisos internos: `Permission[]` normalizados por la aplicación

El usuario de desarrollo debe tener `authorization.client_id=guido`. Los roles pueden no existir o no contener atributos; en ese caso el usuario se autentica, pero no obtiene acceso a operaciones protegidas.

## Perfil de usuario

En `saas-contable > Realm Settings > User Profile`, definir los atributos
personalizados `alias` y `avatar` como texto. `avatar` contiene el object key
completo de MinIO, por ejemplo `profiles/guido/{sub}/avatar.png`; el navegador
nunca elige una ruta arbitraria.
