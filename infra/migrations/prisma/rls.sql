DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['studio_notification_settings','accounting_clients','payment_obligations','payment_submissions','customer_credit_balances','credit_balance_movements','debt_claim_history','quick_action_tokens','change_audit_entries'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY tenant_isolation ON %I USING (tenant_id = current_setting(''app.current_tenant'', true)::uuid)', t);
  END LOOP;
END $$;
