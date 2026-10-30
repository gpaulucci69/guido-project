ALTER TABLE payment_obligations
  ADD CONSTRAINT payment_obligations_currency_ars CHECK (currency = 'ARS'),
  ADD CONSTRAINT payment_obligations_amounts_positive CHECK (total_amount > 0 AND balance_due >= 0),
  ADD CONSTRAINT payment_obligations_period_valid CHECK (period_start_date <= period_end_date AND due_date >= period_end_date);

ALTER TABLE studio_notification_settings
  ADD CONSTRAINT studio_notification_settings_grace_range CHECK (grace_after_due_days BETWEEN 0 AND 30),
  ADD CONSTRAINT studio_notification_settings_interval_range CHECK (reminder_interval_days BETWEEN 1 AND 60);

ALTER TABLE payment_submissions
  ADD CONSTRAINT payment_submissions_amount_positive CHECK (amount > 0),
  ADD CONSTRAINT payment_submissions_receipt_size_limit CHECK (receipt_file_size_bytes IS NULL OR receipt_file_size_bytes <= 15728640),
  ADD CONSTRAINT payment_submissions_receipt_mime CHECK (receipt_file_mime_type IS NULL OR receipt_file_mime_type IN ('application/pdf', 'image/png', 'image/jpeg'));

CREATE UNIQUE INDEX payment_submissions_pending_once_idx
  ON payment_submissions (obligation_id, id)
  WHERE status = 'PENDING_VALIDATION';
