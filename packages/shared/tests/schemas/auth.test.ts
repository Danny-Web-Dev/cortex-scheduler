import { describe, expect, it } from 'vitest';
import { RequestOtpSchema, normalizePhone } from '../../src/schemas/auth';

describe('normalizePhone', () => {
  it('rewrites local Israeli format to +972', () => {
    expect(normalizePhone('0541234567')).toBe('+972541234567');
  });

  it('rewrites 00-prefixed international format to +', () => {
    expect(normalizePhone('00972541234567')).toBe('+972541234567');
  });

  it('leaves +-prefixed input unchanged', () => {
    expect(normalizePhone('+972541234567')).toBe('+972541234567');
  });

  it('strips spaces, dashes, and parens before normalizing', () => {
    expect(normalizePhone('054-123 (4567)')).toBe('+972541234567');
  });
});

describe('RequestOtpSchema', () => {
  it('accepts a valid Israeli mobile number', () => {
    expect(RequestOtpSchema.safeParse({ phone: '0541234567' }).success).toBe(true);
  });

  it('rejects a non-Israeli-shaped number of plausible length', () => {
    expect(RequestOtpSchema.safeParse({ phone: '1111111111' }).success).toBe(false);
  });

  it('rejects an Israeli landline (non-mobile leading digit)', () => {
    expect(RequestOtpSchema.safeParse({ phone: '021234567' }).success).toBe(false);
  });

  it('rejects a too-short number', () => {
    expect(RequestOtpSchema.safeParse({ phone: '05412345' }).success).toBe(false);
  });

  it('rejects a too-long number', () => {
    expect(RequestOtpSchema.safeParse({ phone: '054123456789' }).success).toBe(false);
  });
});
