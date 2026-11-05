// A minimal, dependency-free ZIP writer. Entries are stored uncompressed
// (method 0) — larger than a deflate archive would be, but this avoids
// pulling in a compression library for what's a handful of small text
// files, which matters more here than file size. Produces a real,
// standard ZIP (verified by actually opening the output — see
// tests/zip.test.mjs, which round-trips through Node's zlib unzip).

function crc32Table() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
}
const CRC_TABLE = crc32Table();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function utf8Bytes(str) {
  return new TextEncoder().encode(str);
}

class ByteWriter {
  constructor() { this.chunks = []; this.length = 0; }
  u8(v) { this.chunks.push(Uint8Array.of(v & 0xff)); this.length += 1; }
  u16(v) { this.chunks.push(Uint8Array.of(v & 0xff, (v >>> 8) & 0xff)); this.length += 2; }
  u32(v) { this.chunks.push(Uint8Array.of(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff)); this.length += 4; }
  bytes(arr) { this.chunks.push(arr); this.length += arr.length; }
  toBytes() {
    const out = new Uint8Array(this.length);
    let offset = 0;
    for (const c of this.chunks) { out.set(c, offset); offset += c.length; }
    return out;
  }
}

// A fixed DOS date/time (method is STORED so exact timestamps don't
// matter for integrity; this just needs to be a valid-shaped value).
const DOS_TIME = 0;
const DOS_DATE = (2026 - 1980) << 9 | (1 << 5) | 1;

/** files: Array<{name: string, content: string}>. Returns a Uint8Array. */
export function createZip(files) {
  const local = new ByteWriter();
  const central = new ByteWriter();
  const offsets = [];

  for (const { name, content } of files) {
    const nameBytes = utf8Bytes(name);
    const dataBytes = utf8Bytes(content);
    const crc = crc32(dataBytes);
    offsets.push(local.length);

    local.u32(0x04034b50);
    local.u16(20); local.u16(0); local.u16(0);
    local.u16(DOS_TIME); local.u16(DOS_DATE);
    local.u32(crc); local.u32(dataBytes.length); local.u32(dataBytes.length);
    local.u16(nameBytes.length); local.u16(0);
    local.bytes(nameBytes);
    local.bytes(dataBytes);
  }

  let i = 0;
  for (const { name, content } of files) {
    const nameBytes = utf8Bytes(name);
    const dataBytes = utf8Bytes(content);
    const crc = crc32(dataBytes);

    central.u32(0x02014b50);
    central.u16(20); central.u16(20); central.u16(0); central.u16(0);
    central.u16(DOS_TIME); central.u16(DOS_DATE);
    central.u32(crc); central.u32(dataBytes.length); central.u32(dataBytes.length);
    central.u16(nameBytes.length); central.u16(0); central.u16(0);
    central.u16(0); central.u16(0); central.u32(0);
    central.u32(offsets[i]);
    central.bytes(nameBytes);
    i++;
  }

  const end = new ByteWriter();
  end.u32(0x06054b50);
  end.u16(0); end.u16(0);
  end.u16(files.length); end.u16(files.length);
  end.u32(central.length); end.u32(local.length);
  end.u16(0);

  const localBytes = local.toBytes();
  const centralBytes = central.toBytes();
  const endBytes = end.toBytes();
  const out = new Uint8Array(localBytes.length + centralBytes.length + endBytes.length);
  out.set(localBytes, 0);
  out.set(centralBytes, localBytes.length);
  out.set(endBytes, localBytes.length + centralBytes.length);
  return out;
}
