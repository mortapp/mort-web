import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHibpRangeResponse } from '../lib/leaked-password-response.mjs';

const suffix = '1E4C9B93F3F0682250B6CF8331B7EE68FD8';

test('recognizes a positive matching HIBP suffix', () => {
  assert.equal(parseHibpRangeResponse(`${suffix}:7\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:0`, suffix), true);
});

test('does not flag a padded zero-count suffix', () => {
  assert.equal(parseHibpRangeResponse(`${suffix}:0`, suffix), false);
});

test('does not flag a different suffix', () => {
  assert.equal(parseHibpRangeResponse('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:12', suffix), false);
});

test('treats malformed HIBP output as unavailable', () => {
  assert.equal(parseHibpRangeResponse('not-a-hash:many', suffix), null);
  assert.equal(parseHibpRangeResponse(`${suffix}:1:extra`, suffix), null);
});

test('rejects an invalid expected suffix', () => {
  assert.equal(parseHibpRangeResponse(`${suffix}:1`, 'invalid'), null);
});
