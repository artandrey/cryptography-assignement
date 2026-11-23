import { getPublicKey, getSecretNumber } from './keys.js';
import { asLittleEndian, bytesToNumber, numberToBytes } from './mapping.js';
import { B, encodePoint, L, mulPointToNumber } from './point.js';
import { sha512 } from './sha-512.js';

export function sign(seed: Uint8Array, message: Uint8Array) {
  const hash = sha512(seed);
  const prefix = hash.slice(32);

  const input = new Uint8Array(prefix.length + message.length);
  input.set(prefix);
  input.set(message, prefix.length);

  const r = bytesToNumber(asLittleEndian(sha512(input))) % L;

  const R = encodePoint(mulPointToNumber(B, r));
  const publicKey = getPublicKey(seed);

  const challengeInput = new Uint8Array(
    R.length + publicKey.length + message.length,
  );

  challengeInput.set(R);
  challengeInput.set(publicKey, R.length);
  challengeInput.set(message, R.length + publicKey.length);

  const k = bytesToNumber(asLittleEndian(sha512(challengeInput))) % L;

  const secretNumber = getSecretNumber(seed);
  const S = (r + k * secretNumber) % L;

  const signature = new Uint8Array(64);
  signature.set(R);
  signature.set(numberToBytes(S), 32);

  return signature;
}
