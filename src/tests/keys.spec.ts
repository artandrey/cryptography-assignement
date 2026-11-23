import { describe, expect, it } from 'vitest';
import { getSecretNumber } from '../keys.js';

describe('getSecretNumber', () => {
  it('returns the expected number for a zero-filled seed', () => {
    expect(getSecretNumber(new Uint8Array(32))).toBe(
      39325648866980652792715009169219496062012184734522019333892538943312776480336n,
    );
  });

  it('returns the expected number for bytes from 0 to 31', () => {
    const seed = Uint8Array.from({ length: 32 }, (_, i) => i);

    expect(getSecretNumber(seed)).toBe(
      50459379271018302582465998844449622265826330103819895252966304478993432089656n,
    );
  });

  it.each([0, 31, 33, 64])('rejects seed length %s', (length) => {
    expect(() => getSecretNumber(new Uint8Array(length))).toThrow(
      'Expected a 32-byte seed',
    );
  });
});
