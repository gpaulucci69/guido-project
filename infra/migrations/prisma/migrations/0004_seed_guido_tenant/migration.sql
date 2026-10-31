INSERT INTO tenants (id, client_id, name, cuit)
VALUES ('39785b70-8ae1-42c1-b22d-1cb0777bc889', 'guido', 'Guido', '20204063886')
ON CONFLICT (client_id) DO UPDATE
SET name = EXCLUDED.name, cuit = EXCLUDED.cuit;
