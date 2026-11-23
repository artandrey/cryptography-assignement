import { LittleEndianBytes } from './types.js';

export function asLittleEndian(bytes: Uint8Array): LittleEndianBytes {
  return bytes as LittleEndianBytes;
}

export function bytesToNumber(bytes: LittleEndianBytes): bigint {
  let result = 0n;

  for (let i = bytes.length - 1; i >= 0; i--) {
    result = result * 256n + BigInt(bytes[i]);
  }

  return result;
}

export function numberToBytes(n: bigint): LittleEndianBytes {
  if (n < 0n || n >= 2n ** 256n) {
    throw new Error('Number must fit into 32 bytes');
  }

  const bytes = new Uint8Array(32);

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number(n % 256n);
    n /= 256n;
  }

  return asLittleEndian(bytes);
}
