CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "tenants" (
  "id" UUID NOT NULL,
  "client_id" VARCHAR(100) NOT NULL,
  "name" VARCHAR(150) NOT NULL,
  "cuit" VARCHAR(11) NOT NULL,
  CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "accounting_clients" (
  "id" UUID NOT NULL,
  "tenantId" UUID NOT NULL,
  "representativeAccountantId" UUID,
  "businessName" VARCHAR(200) NOT NULL,
  "cuit" VARCHAR(11) NOT NULL,
  "email" VARCHAR(320) NOT NULL,
  "phone" VARCHAR(40),
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  CONSTRAINT "accounting_clients_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "tenants_client_id_key" ON "tenants"("client_id");
CREATE UNIQUE INDEX IF NOT EXISTS "tenants_cuit_key" ON "tenants"("cuit");
CREATE INDEX IF NOT EXISTS "accounting_clients_tenantId_idx" ON "accounting_clients"("tenantId");
DO $$ BEGIN
  ALTER TABLE "accounting_clients" ADD CONSTRAINT "accounting_clients_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
