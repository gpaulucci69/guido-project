/**
 * Custom Script Mapper para Keycloak 26 (Quarkus)
 * Extrae rutas, acciones y resuelve el client ID y client OID de la sesión.
 */

var ArrayList = Java.type("java.util.ArrayList");
var HashMap = Java.type("java.util.HashMap");
var HashSet = Java.type("java.util.HashSet");

var routesSet = new HashSet();
var actionsSet = new HashSet();

// 1. Obtener la sesión activa, realm y cliente emisor
var context = keycloakSession.getContext();
var realm = context.getRealm();
var currentClient = context.getClient();

// Identificadores del cliente
var clientId = null;
var clientInternalId = null;
var clientNumericOid = null;

if (currentClient !== null && currentClient !== undefined) {
  // Client ID alfanumérico (ej: "guido")
  clientId = currentClient.getClientId();

  // Internal ID / OID de Keycloak (UUID String, ej: "7d0d04c4-727e-407b-83c7-123456789abc")
  clientInternalId = currentClient.getId();

  // Opción A: Si configuraste un atributo personalizado "oid" en el cliente de Keycloak
  var customOidAttr = currentClient.getAttribute("oid");
  if (
    customOidAttr !== null &&
    customOidAttr !== undefined &&
    customOidAttr.trim() !== ""
  ) {
    clientNumericOid = parseInt(customOidAttr, 10);
  } else {
    // Opción B: Hash numérico determinista de 32 bits positivo derivado del UUID
    // Garantiza que siempre viaje un valor numérico estable para este cliente
    clientNumericOid = currentClient.getId().hashCode() & 0x7fffffff;
  }
}

// 2. Recolectar roles efectivos del usuario (Realm roles)
var userRoles = user.getRoleMappingsStream();
userRoles.forEach(function (role) {
  var routeAttr = role.getAttributeStream("route");
  if (routeAttr !== null && routeAttr !== undefined) {
    routeAttr.forEach(function (r) {
      if (r) routesSet.add(r.trim());
    });
  }

  var actionAttr = role.getAttributeStream("action");
  if (actionAttr !== null && actionAttr !== undefined) {
    actionAttr.forEach(function (a) {
      if (a) actionsSet.add(a.trim());
    });
  }
});

// 3. Recolectar roles de cliente
var clients = realm.getClientsStream();
clients.forEach(function (client) {
  var clientRoles = user.getClientRoleMappingsStream(client);
  if (clientRoles !== null && clientRoles !== undefined) {
    clientRoles.forEach(function (cRole) {
      var cRouteAttr = cRole.getAttributeStream("route");
      if (cRouteAttr !== null && cRouteAttr !== undefined) {
        cRouteAttr.forEach(function (r) {
          if (r) routesSet.add(r.trim());
        });
      }

      var cActionAttr = cRole.getAttributeStream("action");
      if (cActionAttr !== null && cActionAttr !== undefined) {
        cActionAttr.forEach(function (a) {
          if (a) actionsSet.add(a.trim());
        });
      }
    });
  }
});

// 4. Convertir a colecciones legibles para JSON
var routesList = new ArrayList(routesSet);
var actionsList = new ArrayList(actionsSet);

// 5. Armar objeto final para el claim
var authorization = new HashMap();
authorization.put("routes", routesList);
authorization.put("actions", actionsList);
authorization.put("client_id", clientId); // Alfanumérico (ej: "guido")
authorization.put("client_internal_id", clientInternalId); // UUID de Keycloak
authorization.put("client_oid", clientNumericOid); // Entero numérico

exports = authorization;
