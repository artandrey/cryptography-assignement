import { asLittleEndian, bytesToNumber } from './mapping.js';
import { B, L, decodePoint, mulPointToNumber, pointAdd } from './point.js';
import type { Point } from './point.js';
import { sha512 } from './sha-512.js';

export function verify(
  publicKey: Uint8Array,
  message: Uint8Array,
  signature: Uint8Array,
): boolean {
  if (publicKey.length !== 32 || signature.length !== 64) {
    return false;
  }

  const encodedR = signature.slice(0, 32);
  const S = bytesToNumber(asLittleEndian(signature.slice(32)));

  if (S >= L) {
    return false;
  }

  let R: Point;
  let A: Point;

  try {
    R = decodePoint(encodedR);
    A = decodePoint(publicKey);
  } catch {
    return false;
  }

  const input = new Uint8Array(64 + message.length);
  input.set(encodedR);
  input.set(publicKey, 32);
  input.set(message, 64);

  const k = bytesToNumber(asLittleEndian(sha512(input))) % L;

  const left = mulPointToNumber(B, 8n * S);

  const right = pointAdd(mulPointToNumber(R, 8n), mulPointToNumber(A, 8n * k));

  return left.x === right.x && left.y === right.y;
}
