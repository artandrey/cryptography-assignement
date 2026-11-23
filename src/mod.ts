export function mod(n: bigint, m: bigint): bigint {
  const remainder = n % m;
  if (remainder < 0) {
    return m - remainder * -1n;
  }
  return remainder;
}

export function powMod(base: bigint, exponent: bigint, m: bigint): bigint {
  base = mod(base, m);
  let result = mod(1n, m);

  while (exponent > 0n) {
    if (exponent % 2n === 1n) {
      result = mod(result * base, m);
    }

    base = mod(base * base, m);
    exponent /= 2n;
  }

  return result;
}

export function inverse(a: bigint, p: bigint): bigint {
  const n = mod(a, p);

  if (n === 0n) {
    throw new Error('Zero has no modular inverse');
  }

  return powMod(n, p - 2n, p);
}
