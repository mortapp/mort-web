export function parseHibpRangeResponse(body, expectedSuffix) {
  if (!/^[0-9A-F]{35}$/i.test(expectedSuffix)) return null;

  const lines = body.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (const line of lines) {
    const parts = line.split(':');
    if (parts.length !== 2) return null;
    const [candidateSuffix, rawCount] = parts;
    if (!/^[0-9A-F]{35}$/i.test(candidateSuffix) || !/^\d+$/.test(rawCount)) {
      return null;
    }
    const count = Number(rawCount);
    if (!Number.isSafeInteger(count)) return null;
    if (candidateSuffix.toUpperCase() === expectedSuffix.toUpperCase() && count > 0) {
      return true;
    }
  }
  return false;
}
