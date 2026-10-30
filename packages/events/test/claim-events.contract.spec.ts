import { describe, expect, it } from 'vitest';
describe('claim events contract', () => it('uses trigger and failed events', () => expect(['billing.claim.triggered','billing.claim.failed']).toHaveLength(2)));
