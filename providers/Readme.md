# mapper de atributos "action" y "route" de los client roles asociados a un usuario para incluirlos en el token

## crear el .jar de la siguiiente manera

jar -cvf role-routes-actions-mapper.jar META-INF/ role-routes-actions-mapper.js

## incluir el .jar en el file system de keycloak.

### En docker-compose.yml sería como se indica a continuación:

volumes: # Montaje del provider JAR compilado - ./providers/role-routes-actions-mapper.jar:/opt/keycloak/providers/role-routes-actions-mapper.jar:ro
