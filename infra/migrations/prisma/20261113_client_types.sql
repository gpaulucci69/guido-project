BEGIN;
DO $$ BEGIN
  CREATE TYPE "ClientType" AS ENUM ('INDIVIDUAL', 'LEGAL_ENTITY');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
ALTER TABLE accounting_clients
  ADD COLUMN IF NOT EXISTS type "ClientType" NOT NULL DEFAULT 'LEGAL_ENTITY',
  ADD COLUMN IF NOT EXISTS "firstName" VARCHAR(120),
  ADD COLUMN IF NOT EXISTS "lastName" VARCHAR(120),
  ADD COLUMN IF NOT EXISTS "legalName" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "tradeName" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "taxAddress" VARCHAR(300),
  ADD COLUMN IF NOT EXISTS "legalRepresentativeName" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "legalRepresentativeTaxId" VARCHAR(11),
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE accounting_clients
SET "legalName" = NULLIF("businessName", '')
WHERE type = 'LEGAL_ENTITY' AND "legalName" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "accounting_clients_tenantId_cuit_key"
  ON accounting_clients ("tenantId", cuit);

DO $$ BEGIN
ALTER TABLE accounting_clients
  ADD CONSTRAINT accounting_clients_representative_pair_check
  CHECK (("legalRepresentativeName" IS NULL) = ("legalRepresentativeTaxId" IS NULL));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
COMMIT;
