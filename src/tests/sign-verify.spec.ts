import { Buffer } from 'node:buffer';
import { describe, expect, it } from 'vitest';
import { getPublicKey } from '../keys.js';
import { verify } from '../verify.js';
import { numberToBytes } from '../mapping.js';
import { p, L } from '../point.js';
import { vectors } from './fixture/rfc8032-ed25519-vectors.js';
import { sign } from '../sign.js';

const bytes = (hex: string) => new Uint8Array(Buffer.from(hex, 'hex'));

describe.each(vectors)('$name', ({ seed, publicKey, message, signature }) => {
  it('generates the official public key', () => {
    expect(getPublicKey(bytes(seed))).toEqual(bytes(publicKey));
  });
  it('generates the official signature', () => {
    expect(sign(bytes(seed), bytes(message))).toEqual(bytes(signature));
  });
  it('accepts the official signature', () => {
    expect(verify(bytes(publicKey), bytes(message), bytes(signature))).toBe(
      true,
    );
  });
  it('accepts our generated signature with our generated public key', () => {
    const actual = sign(bytes(seed), bytes(message));
    expect(verify(getPublicKey(bytes(seed)), bytes(message), actual)).toBe(
      true,
    );
  });
  it('rejects a changed message', () => {
    const changed = new Uint8Array([...bytes(message), 0]);
    expect(verify(bytes(publicKey), changed, bytes(signature))).toBe(false);
  });
  it.each([0, 32])('rejects a changed signature byte at index %i', (index) => {
    const changed = bytes(signature);
    changed[index] ^= 1;
    expect(verify(bytes(publicKey), bytes(message), changed)).toBe(false);
  });
  it('rejects another public key', () => {
    const other = vectors.find((vector) => vector.publicKey !== publicKey)!;
    expect(
      verify(bytes(other.publicKey), bytes(message), bytes(signature)),
    ).toBe(false);
  });
  it.each([0, 31, 33])('rejects public key length %i', (length) => {
    const changed = new Uint8Array(length);
    changed.set(bytes(publicKey).subarray(0, length));
    expect(verify(changed, bytes(message), bytes(signature))).toBe(false);
  });
  it.each([0, 63, 65])('rejects signature length %i', (length) => {
    const changed = new Uint8Array(length);
    changed.set(bytes(signature).subarray(0, length));
    expect(verify(bytes(publicKey), bytes(message), changed)).toBe(false);
  });
  it.each([L, L + 1n, 2n ** 256n - 1n])('rejects S = %s', (S) => {
    const changed = bytes(signature);
    changed.set(numberToBytes(S), 32);
    expect(verify(bytes(publicKey), bytes(message), changed)).toBe(false);
  });
  it('rejects R encoded with y = p', () => {
    const changed = bytes(signature);
    changed.set(numberToBytes(p));
    expect(verify(bytes(publicKey), bytes(message), changed)).toBe(false);
  });
  it('rejects a public key encoded with y = p', () => {
    expect(verify(numberToBytes(p), bytes(message), bytes(signature))).toBe(
      false,
    );
  });
});
