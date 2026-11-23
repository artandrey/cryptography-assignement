import { describe, expect, it } from 'vitest';
import {
  decodePoint,
  encodePoint,
  mulPointToNumber,
  O,
  p,
  pointAdd,
  readPointBytes,
  recoverX,
  sqrtMod,
} from '../point.js';

describe('point add', () => {
  // (0, -1) mod p.
  const point = { x: 0n, y: p - 1n };

  it('identity + identity = identity', () => {
    expect(pointAdd(O, O)).toEqual(O);
  });

  it.each([O, point])('identity + point = point', ({ x, y }) => {
    expect(pointAdd(O, { x, y })).toEqual({ x, y });
    expect(pointAdd({ x, y }, O)).toEqual({ x, y });
  });

  it('(0, -1) + (0, -1) = identity', () => {
    expect(pointAdd(point, point)).toEqual(O);
  });
});

// Mathematical constant from the specification:
// https://www.rfc-editor.org/rfc/rfc8032.html#section-5.1
const B = {
  x: 15112221349535400772501151409588531511454012693041857206046113283949847762202n,
  y: 46316835694926478169428394003475163141307993866256225615783033603165251855960n,
};

describe('mulPointToNumber', () => {
  it('B multiplied by 0 = O', () => {
    expect(mulPointToNumber(B, 0n)).toEqual(O);
  });

  it('B multiplied by 1 = B', () => {
    expect(mulPointToNumber(B, 1n)).toEqual(B);
  });

  it('B multiplied by 2 = B + B', () => {
    expect(mulPointToNumber(B, 2n)).toEqual(pointAdd(B, B));
  });

  it.each([0n, 1n, 2n, 13n])('O multiplied by %s = O', (n) => {
    expect(mulPointToNumber(O, n)).toEqual(O);
  });

  it.each([3n, 4n, 5n, 8n, 13n])(
    'multiplying by %s matches repeated addition',
    (n) => {
      let expected = O;

      for (let i = 0n; i < n; i++) {
        expected = pointAdd(expected, B);
      }

      expect(mulPointToNumber(B, n)).toEqual(expected);
    },
  );

  it('handles integers larger than Number.MAX_SAFE_INTEGER', () => {
    const p = 2n ** 255n - 19n;
    const point = { x: 0n, y: p - 1n };

    expect(mulPointToNumber(point, 9007199254740992n)).toEqual(O);
    expect(mulPointToNumber(point, 9007199254740993n)).toEqual(point);
  });
});

describe('encodePoint', () => {
  it('returns a Uint8Array with 32 bytes', () => {
    const bytes = encodePoint(O);

    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes).toHaveLength(32);
  });

  it('encodes O as 1', () => {
    const expected = new Uint8Array(32);
    expected[0] = 1;

    expect(encodePoint(O)).toEqual(expected);
  });

  it('writes y in little-endian order', () => {
    const point = { x: 0n, y: p - 1n };
    const expected = new Uint8Array(32).fill(255);

    // p - 1 = 2^255 - 20.
    expected[0] = 256 - 20;
    expected[31] = 127;

    expect(encodePoint(point)).toEqual(expected);
  });

  it('encodes point (even x) without setting the parity bit', () => {
    const expected = new Uint8Array(32).fill(102);
    expected[0] = 88;

    expect(encodePoint(B)).toEqual(expected);
  });

  it('sets the parity bit for odd x without changing y', () => {
    const point = { x: p - B.x, y: B.y };
    const expected = new Uint8Array(32).fill(102);
    expected[0] = 88;
    expected[31] += 128;

    expect(encodePoint(point)).toEqual(expected);
  });
});

describe('readPointBytes', () => {
  it.each([O, { x: 0n, y: p - 1n }, B, { x: p - B.x, y: B.y }])(
    'reads y and x parity after encoding (%#)',
    (point) => {
      const bytes = encodePoint(point);

      expect(readPointBytes(bytes)).toEqual({
        y: point.y,
        odd: point.x % 2n === 1n,
      });
    },
  );

  it('reads independently specified bytes', () => {
    const bytes = new Uint8Array(32);
    bytes[0] = 2;
    bytes[1] = 1;
    bytes[31] = 128;

    expect(readPointBytes(bytes)).toEqual({
      y: 258n,
      odd: true,
    });
  });

  it.each([0, 31, 33])('rejects an array of length %s', (length) => {
    expect(() => readPointBytes(new Uint8Array(length))).toThrow();
  });
});

describe('sqrtMod', () => {
  it.each([0n, p, 2n * p])('returns zero for a multiple of p (%#)', (n) => {
    expect(sqrtMod(n)).toBe(0n);
  });

  it.each([
    { n: 1n, root: 1n },
    { n: 4n, root: 2n },
    { n: 9n, root: 3n },
    { n: 16n, root: 4n },
    { n: 25n, root: 5n },
  ])('finds a square root (%#)', ({ n, root }) => {
    expect([root, p - root]).toContain(sqrtMod(n));
  });

  it('returns null when no square root exists', (n) => {
    expect(sqrtMod(2n)).toBeNull();
  });

  it('handles an input larger than p', () => {
    expect([2n, p - 2n]).toContain(sqrtMod(p + 4n));
  });

  it('handles a negative input', () => {
    expect([2n, p - 2n]).toContain(sqrtMod(4n - p));
  });
});

describe('recoverX', () => {
  it.each([1n, p - 1n])('recovers zero x (%#)', (y) => {
    expect(recoverX(y, false)).toBe(0n);
  });

  it.each([1n, p - 1n])('rejects zero x marked as odd (%#)', (y) => {
    expect(() => recoverX(y, true)).toThrow('Zero x cannot be odd');
  });

  it('recovers the even x of B', () => {
    expect(recoverX(B.y, false)).toBe(B.x);
  });

  it('recovers the odd x for the same y', () => {
    expect(recoverX(B.y, true)).toBe(p - B.x);
  });
});

describe('high value tests', () => {
  it.each([B, O])('decodes encoded point', (point) => {
    expect(decodePoint(encodePoint(point))).toEqual(point);
  });
});
