ALTER TABLE accounting_clients
  ADD COLUMN IF NOT EXISTS type VARCHAR(20) NOT NULL DEFAULT 'LEGAL_ENTITY',
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(120),
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(120),
  ADD COLUMN IF NOT EXISTS legal_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS trade_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS tax_address VARCHAR(300),
  ADD COLUMN IF NOT EXISTS legal_representative_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS legal_representative_tax_id VARCHAR(11),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE accounting_clients
SET legal_name = NULLIF(business_name, ''),
    type = 'LEGAL_ENTITY'
WHERE legal_name IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS accounting_clients_tenant_id_cuit_key
  ON accounting_clients (tenant_id, cuit);

ALTER TABLE accounting_clients
  ADD CONSTRAINT accounting_clients_type_check
  CHECK (type IN ('INDIVIDUAL', 'LEGAL_ENTITY'));

ALTER TABLE accounting_clients
  ADD CONSTRAINT accounting_clients_representative_pair_check
  CHECK ((legal_representative_name IS NULL) = (legal_representative_tax_id IS NULL));
