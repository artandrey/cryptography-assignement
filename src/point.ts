import { memo } from './memo.js';
import { inverse, mod, powMod } from './mod.js';

export class Point {
  constructor(
    public readonly x: bigint,
    public readonly y: bigint,
  ) {}

  public static from(x: bigint, y: bigint) {
    return new Point(x, y);
  }
}

export const L = 2n ** 252n + 27742317777372353535851937790883648493n;
export const p = 2n ** 255n - 19n;
export const d = mod(-121665n * inverse(121666n, p), p);
// https://www.rfc-editor.org/rfc/rfc8032.html#section-5.1
export const B = Point.from(
  15112221349535400772501151409588531511454012693041857206046113283949847762202n,
  46316835694926478169428394003475163141307993866256225615783033603165251855960n,
);

export const O: Point = Point.from(0n, 1n);

export function pointAdd(a: Point, b: Point): Point {
  const t = mod(d * a.x * b.x * a.y * b.y, p);
  const x = mod((a.x * b.y + a.y * b.x) * inverse(1n + t, p), p);
  const y = mod((a.y * b.y + a.x * b.x) * inverse(1n - t, p), p);

  return { x, y };
}

export let mulPointToNumber = (a: Point, n: bigint): Point => {
  if (n === 0n) {
    return O;
  }
  if (n === 1n) {
    return a;
  }

  return pointAdd(mulPointToNumber(a, n / 2n), mulPointToNumber(a, n - n / 2n));
};

mulPointToNumber = memo(mulPointToNumber);

export function encodePoint(point: Point): Uint8Array {
  const bytes = new Uint8Array(32);
  let { y } = point;

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number(y % 256n);
    y /= 256n;
  }

  if (point.x % 2n === 1n) {
    bytes[31] += 128;
  }

  return bytes;
}

export function readPointBytes(bytes: Uint8Array) {
  if (bytes.length !== 32) {
    throw new Error('Expected 32 bytes');
  }

  const odd = bytes[31] >= 128;
  let y = BigInt(bytes[31] % 128);

  for (let i = 30; i >= 0; i--) {
    y = y * 256n + BigInt(bytes[i]);
  }

  return { y, odd };
}

export function sqrtMod(n: bigint): bigint | null {
  n = mod(n, p);
  let x = powMod(n, (p + 3n) / 8n, p);

  if (mod(x * x, p) !== n) {
    const correction = powMod(2n, (p - 1n) / 4n, p);
    x = mod(x * correction, p);
  }

  if (mod(x * x, p) !== n) {
    return null;
  }

  return x;
}

export function recoverX(y: bigint, odd: boolean): bigint {
  if (y < 0n || y >= p) {
    throw new Error('Invalid y coordinate');
  }

  const y2 = mod(y * y, p);
  const x2 = mod((y2 - 1n) * inverse(1n + d * y2, p), p);
  let x = sqrtMod(x2);

  if (x === null) {
    throw new Error('Point is not on the curve');
  }

  if ((x % 2n === 1n) !== odd) {
    x = mod(-x, p);
  }

  return x;
}

export function decodePoint(bytes: Uint8Array): Point {
  const { y, odd } = readPointBytes(bytes);
  const x = recoverX(y, odd);

  return Point.from(x, y);
}
