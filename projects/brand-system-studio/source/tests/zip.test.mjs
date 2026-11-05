import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createZip } from '../src/export/zip.js';

// A minimal STORED-only ZIP reader, used only to verify createZip's
// output round-trips correctly — not shipped in src/. Reads the end of
// central directory, walks central directory entries, and extracts each
// file directly from its local header + data (not trusting the writer's
// own offsets blindly — this is the test, so it re-derives everything
// from the bytes themselves).
function readStoredZip(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  // Find End Of Central Directory (fixed-size footer, no comment used here).
  const eocdOffset = bytes.length - 22;
  assert.equal(view.getUint32(eocdOffset, true), 0x06054b50, 'EOCD signature not found where expected');
  const entryCount = view.getUint16(eocdOffset + 10, true);
  const centralOffset = view.getUint32(eocdOffset + 16, true);

  const files = [];
  let p = centralOffset;
  for (let i = 0; i < entryCount; i++) {
    assert.equal(view.getUint32(p, true), 0x02014b50, `central directory entry ${i} signature mismatch`);
    const crc = view.getUint32(p + 16, true);
    const compSize = view.getUint32(p + 20, true);
    const uncompSize = view.getUint32(p + 24, true);
    const nameLen = view.getUint16(p + 28, true);
    const localOffset = view.getUint32(p + 42, true);
    const name = new TextDecoder().decode(bytes.subarray(p + 46, p + 46 + nameLen));
    p += 46 + nameLen;

    assert.equal(view.getUint32(localOffset, true), 0x04034b50, `local header for "${name}" not found at recorded offset`);
    const localNameLen = view.getUint16(localOffset + 26, true);
    const localExtraLen = view.getUint16(localOffset + 28, true);
    const dataStart = localOffset + 30 + localNameLen + localExtraLen;
    const data = bytes.subarray(dataStart, dataStart + compSize);
    assert.equal(data.length, uncompSize, `stored entry "${name}" size mismatch`);

    files.push({ name, crc, content: new TextDecoder().decode(data) });
  }
  return files;
}

function crc32Reference(str) {
  // Independent CRC32 implementation (not imported from zip.js), so the
  // test doesn't just check the writer agrees with itself.
  let crc = 0xffffffff;
  const bytes = new TextEncoder().encode(str);
  for (const byte of bytes) {
    crc ^= byte;
    for (let k = 0; k < 8; k++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

test('createZip round-trips file names and contents exactly', () => {
  const input = [
    { name: 'tokens.json', content: JSON.stringify({ hello: 'world' }, null, 2) },
    { name: 'DESIGN.md', content: '# Design\n\nSome guidance.\n' },
    { name: 'nested/path/file.txt', content: 'nested entry content' },
  ];
  const zipBytes = createZip(input);
  const extracted = readStoredZip(zipBytes);

  assert.equal(extracted.length, input.length);
  for (let i = 0; i < input.length; i++) {
    assert.equal(extracted[i].name, input[i].name);
    assert.equal(extracted[i].content, input[i].content);
  }
});

test('createZip entries have correct CRC32 (verified against an independent implementation)', () => {
  const input = [{ name: 'a.txt', content: 'The quick brown fox jumps over the lazy dog' }];
  const extracted = readStoredZip(createZip(input));
  assert.equal(extracted[0].crc, crc32Reference(input[0].content));
});

test('createZip handles an empty file list', () => {
  const extracted = readStoredZip(createZip([]));
  assert.deepEqual(extracted, []);
});

test('createZip handles unicode content correctly', () => {
  const input = [{ name: 'readme.md', content: '# Café — â€” naïve 日本語' }];
  const extracted = readStoredZip(createZip(input));
  assert.equal(extracted[0].content, input[0].content);
});
