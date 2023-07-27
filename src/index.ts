import { base62, debase62 } from './base62';
import crypto from './crypto';

const EPOCH_IN_MS = 14e11;

const MAX_TIME_IN_MS = 1e3 * (2 ** 32 - 1) + EPOCH_IN_MS;

// Timestamp is a uint32
const TIMESTAMP_BYTE_LENGTH = 4;

// Payload is 16-bytes
const PAYLOAD_BYTE_LENGTH = 16;

// KSUIDs are 20 bytes when binary encoded
const BYTE_LENGTH = TIMESTAMP_BYTE_LENGTH + PAYLOAD_BYTE_LENGTH;

// The length of a KSUID when string (base62) encoded
const STRING_ENCODED_LENGTH = 27;

const TIME_IN_MS_ASSERTION = `Valid KSUID timestamps must be in milliseconds since ${new Date(
  0,
).toISOString()},
  no earlier than ${new Date(EPOCH_IN_MS).toISOString()} and no later than ${new Date(
    MAX_TIME_IN_MS,
  ).toISOString()}
`
  .trim()
  .replace(/(\n|\s)+/g, ' ')
  .replace(/\.000Z/g, 'Z');

const VALID_ENCODING_ASSERTION = `Valid encoded KSUIDs are ${STRING_ENCODED_LENGTH} characters`;

const VALID_BUFFER_ASSERTION = `Valid KSUID buffers are ${BYTE_LENGTH} bytes`;

const VALID_PAYLOAD_ASSERTION = `Valid KSUID payloads are ${PAYLOAD_BYTE_LENGTH} bytes`;

function randomBytes() {
  return crypto.getRandomValues(new Uint8Array(16));
}

function fromParts(timestamp: number, payload: Uint8Array) {
  const buffer = new ArrayBuffer(BYTE_LENGTH);
  const view = new DataView(buffer);

  const timestampEpoch = Math.floor((timestamp - EPOCH_IN_MS) / 1e3);
  view.setUint32(0, timestampEpoch, false);
  let offset = TIMESTAMP_BYTE_LENGTH;
  for (const byte of payload) {
    view.setUint8(offset, byte);
    offset++;
  }

  return view.buffer;
}

class KSUID {
  /** A string-encoded maximum value for a KSUID */
  static MAX_STRING_ENCODED = 'aWgEPTl1tmebfsQzFP4bxwgy80V';
  /** A string-encoded minimum value for a KSUID */
  static MIN_STRING_ENCODED = '000000000000000000000000000';

  private view: DataView;

  constructor(buffer: ArrayBufferLike) {
    if (!KSUID.isValid(buffer)) {
      throw new TypeError(VALID_BUFFER_ASSERTION);
    }

    this.view = new DataView(buffer);
  }

  get raw() {
    return this.view.buffer.slice(0);
  }

  get date() {
    return new Date(1e3 * this.timestamp + EPOCH_IN_MS);
  }

  get timestamp() {
    return this.view.getUint32(0, false);
  }

  get payload() {
    return this.view.buffer.slice(TIMESTAMP_BYTE_LENGTH, BYTE_LENGTH);
  }

  get string() {
    return base62(this.view, STRING_ENCODED_LENGTH).padStart(STRING_ENCODED_LENGTH, '0');
  }

  get [Symbol.toStringTag]() {
    return 'KSUID';
  }

  compare(other: KSUID) {
    if (this === other) return 0;

    const a = new Uint8Array(this.view.buffer);
    const b = new Uint8Array(other.view.buffer);

    for (let offset = 0; offset < a.length; offset++) {
      if (a[offset] < b[offset]) return -1;
      if (a[offset] > b[offset]) return 1;
    }

    return 0;
  }

  equals(other: KSUID) {
    return this.compare(other) === 0;
  }

  toString() {
    return `${this[Symbol.toStringTag]} { ${this.string} }`;
  }

  static async random(timestamp = Date.now()) {
    return KSUID.randomSync(timestamp);
  }

  static randomSync(timestamp = Date.now()) {
    return new KSUID(fromParts(timestamp, randomBytes()));
  }

  static fromParts(timestamp: number, payload: Uint8Array) {
    if (!Number.isInteger(timestamp) || timestamp < EPOCH_IN_MS || timestamp > MAX_TIME_IN_MS) {
      throw new TypeError(TIME_IN_MS_ASSERTION);
    }
    if (!Buffer.isBuffer(payload) || payload.byteLength !== PAYLOAD_BYTE_LENGTH) {
      throw new TypeError(VALID_PAYLOAD_ASSERTION);
    }

    return new KSUID(fromParts(timestamp, payload));
  }

  static isValid(buffer: ArrayBufferLike) {
    return buffer.byteLength === BYTE_LENGTH;
  }

  static parse(data: string) {
    if (data.length !== STRING_ENCODED_LENGTH) {
      throw new TypeError(VALID_ENCODING_ASSERTION);
    }

    const decoded = debase62(data, BYTE_LENGTH);
    if (decoded.byteLength === BYTE_LENGTH) {
      return new KSUID(decoded);
    }

    const buffer = new ArrayBuffer(BYTE_LENGTH);
    const dstView = new DataView(buffer);
    const srcView = new DataView(decoded);

    const padEnd = BYTE_LENGTH - decoded.byteLength;
    for (let offset = 0; offset < padEnd; offset++) {
      dstView.setUint8(offset, 0);
    }
    for (let offset = padEnd; offset < BYTE_LENGTH; offset++) {
      dstView.setUint8(offset, srcView.getUint8(offset - padEnd));
    }
    return new KSUID(buffer);
  }
}

module.exports = KSUID;
export default KSUID;
