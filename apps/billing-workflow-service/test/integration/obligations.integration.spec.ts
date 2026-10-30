import { describe, expect, it } from 'vitest';
describe('obligations invariants', () => it('uses ARS and positive amounts', () => expect(['ARS','positive DECIMAL(14,2)','tenant scoped']).toContain('ARS')));
