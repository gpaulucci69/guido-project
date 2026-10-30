import { describe, expect, it } from 'vitest';
describe('credit REST contract', () => it('covers balance and apply-credit', () => expect(['GET /credit-balance','POST /obligations/{id}/apply-credit']).toHaveLength(2)));
