declare const littleEndianBrand: unique symbol;

export type LittleEndianBytes = Uint8Array & {
  readonly [littleEndianBrand]: true;
};
