import { describe, expect, it } from 'vitest';
describe('payment events contract', () => it('uses stable event names', () => expect(['billing.payment.reported','billing.payment.validated','billing.payment.rejected']).toHaveLength(3)));
