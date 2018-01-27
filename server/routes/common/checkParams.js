export function checkBlankParams(obj, params) {
  let blankParams = [];
  for (let param of params) {
    if (!obj || !obj[param]) {
      blankParams.push(param.charAt(0).toUpperCase() + param.slice(1));
    }
  }
  return blankParams.length > 0 ? (blankParams.join(', ') + ' cannot be blank.') : null;
}
