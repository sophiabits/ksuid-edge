import baseConvertIntArray from 'base-convert-int-array';

const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function base62(view: DataView, fixedLength: number): string {
  const numbs = new Array(view.byteLength);
  for (let offset = 0; offset < view.byteLength; offset++) {
    numbs[offset] = view.getUint8(offset);
  }

  return baseConvertIntArray(numbs, { from: 256, to: 62, fixedLength })
    .map((value: number) => BASE62[value])
    .join('');
}

// https://github.com/novemberborn/ksuid/blob/90ca4c1508f216e03923de610291786a0d6a868c/base62.js#L13C40-L21C85
export function debase62(data: string, fixedLength: number) {
  const input = Array.from(data, (char) => {
    const charCode = char.charCodeAt(0);
    if (charCode < 58) return charCode - 48;
    if (charCode < 91) return charCode - 55;
    return charCode - 61;
  });

  return new Uint8Array(baseConvertIntArray(input, { from: 62, to: 256, fixedLength })).buffer;
}
