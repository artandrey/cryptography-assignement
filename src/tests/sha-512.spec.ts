import { sha512 } from '../sha-512.js';

describe('sha 512', () => {
  const input = new TextEncoder().encode('test');

  it('returns a Uint8Array', () => {
    expect(sha512(input)).toBeInstanceOf(Uint8Array);
  });

  it('has length of 64 bytes', () => {
    expect(sha512(input)).toHaveLength(64);
  });

  it('hashes to the expected value', () => {
    const result = sha512(input);
    const hex = Buffer.from(result).toString('hex');

    expect(hex).toBe(
      'ee26b0dd4af7e749aa1a8ee3c10ae9923f618980772e473f8819a5d4940e0db27ac185f8a0e1d5f84f88bc887fd67b143732c304cc5fa9ad8e6f57f50028a8ff',
    );
  });
});
