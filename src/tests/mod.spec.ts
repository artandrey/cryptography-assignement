import { inverse, mod, powMod } from '../mod.js';
import { p } from '../point.js';

describe('mod', () => {
  it('returns correct remainder for positive and negative ints', () => {
    expect(mod(10n, 7n)).toBe(3n);
    expect(mod(14n, 7n)).toBe(0n);
    expect(mod(-1n, 7n)).toBe(6n);
  });
});

describe('powMod', () => {
  it('returns correct results', () => {
    expect(powMod(3n, 4n, 7n)).toBe(4n);
    expect(powMod(2n, 10n, 1000n)).toBe(24n);
    expect(powMod(5n, 0n, 7n)).toBe(1n);
  });

  it('words correctly with big numbers using (a * b) mod m = ((a mod m) * (b mod m)) mod m', () => {
    expect(powMod(2n, p - 2n, p)).toBe(
      28948022309329048855892746252171976963317496166410141009864396001978282409975n,
    );
  });
});

describe('inverse', () => {
  it('returns correct results', () => {
    expect(inverse(3n, 7n)).toBe(5n);
    expect(inverse(2n, 7n)).toBe(4n);
    expect(inverse(-3n, 7n)).toBe(2n);
    expect(() => inverse(0n, 7n)).toThrow();
    expect(() => inverse(7n, 7n)).toThrow();
  });
});
