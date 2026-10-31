ALTER TABLE tenants ADD COLUMN IF NOT EXISTS client_id VARCHAR(100);

UPDATE tenants
SET client_id = id::text
WHERE client_id IS NULL;

ALTER TABLE tenants ALTER COLUMN client_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS tenants_client_id_key ON tenants (client_id);
