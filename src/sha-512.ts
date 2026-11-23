import { createHash } from 'node:crypto';

export function sha512(input: Uint8Array): Uint8Array {
  return new Uint8Array(createHash('sha512').update(input).digest());
}
