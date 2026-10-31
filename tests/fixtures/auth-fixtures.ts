export const guidoTenant = "guido";

export const superAdminBearerClaims = {
  iss: "http://localhost:8080/realms/saas-contable",
  aud: "account",
  azp: "guido",
  typ: "Bearer",
  sub: "6bd018d9-f123-47b6-bb1e-a96e37f841f6",
  authorization: {
    client_id: guidoTenant,
    routes: ["/home/customers", "/home/welcome"],
    actions: ["/view/customers/all"],
  },
  resource_access: { guido: { roles: ["SUPER_ADMIN"] } },
} as const;
