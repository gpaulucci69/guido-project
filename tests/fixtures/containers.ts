export type ContainerFixture = {
  image: string;
  port: number;
  environment: Record<string, string>;
};
export const integrationFixtures: readonly ContainerFixture[] = [
  {
    image: "postgres:16-alpine",
    port: 5432,
    environment: { POSTGRES_DB: "saas_contable" },
  },
  { image: "nats:2.10-alpine", port: 4222, environment: { JS: "true" } },
  { image: "quay.io/keycloak/keycloak:26.0", port: 8080, environment: {} },
];
