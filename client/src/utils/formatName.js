export function shortName(first, last) {
  const f = (first || '').trim();
  const l = (last || '').trim();
  if (!f && !l) return '';
  if (!l) return f;
  return `${f} ${l[0].toUpperCase()}.`;
}

export function shortNameFromString(fullName) {
  const parts = (fullName || '').trim().split(/\s+/);
  if (parts.length < 2 || !parts[1]) return parts[0] || '';
  return `${parts[0]} ${parts[1][0].toUpperCase()}.`;
}
