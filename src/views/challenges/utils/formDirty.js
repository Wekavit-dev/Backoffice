export function isFormDirty(current, baseline) {
  if (!current || !baseline) return false;
  return JSON.stringify(current) !== JSON.stringify(baseline);
}
