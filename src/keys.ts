import { B, encodePoint, mulPointToNumber } from './point.js';
import { sha512 } from './sha-512.js';

export function getSecretNumber(seed: Uint8Array): bigint {
  if (seed.length !== 32) {
    throw new Error('Expected a 32-byte seed');
  }

  const hash = sha512(seed);
  const bytes = hash.slice(0, 32);

  bytes[0] &= 248;
  bytes[31] &= 127;
  bytes[31] |= 64;

  let s = 0n;

  for (let i = bytes.length - 1; i >= 0; i--) {
    s = s * 256n + BigInt(bytes[i]);
  }

  return s;
}

export function getPublicKey(seed: Uint8Array): Uint8Array {
  const secretNumber = getSecretNumber(seed);
  const point = mulPointToNumber(B, secretNumber);

  return encodePoint(point);
}
