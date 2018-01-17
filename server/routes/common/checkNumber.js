export function isNonNegativeInteger(s) {
  const num = Number(s);
  return !isNaN(num) && Number.isInteger(num) && num >= 0;
}

export function isPositiveInteger(s) {
  const num = Number(s);
  return !isNaN(num) && Number.isInteger(num) && num > 0;
}
