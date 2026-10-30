import { describe, expect, it } from 'vitest';
import { validateReceipt } from '../../src/payments/domain/payment.js';
describe('payment invariants', () => { it('rejects oversized receipts', () => expect(() => validateReceipt(15_728_641, 'application/pdf')).toThrow()); it('accepts allowed receipt types', () => expect(() => validateReceipt(1, 'application/pdf')).not.toThrow()); });
