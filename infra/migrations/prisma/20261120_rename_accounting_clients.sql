-- Apply after 20261113_client_types.sql.
BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE public.accounting_clients RENAME TO clients;
COMMIT;
