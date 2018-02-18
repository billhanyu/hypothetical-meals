export function checkBlankParams(obj, params) {
  let blankParams = [];
  for (let param of params) {
    console.log(param);
    if (!obj || !obj[param]) {
      blankParams.push(param.charAt(0).toUpperCase() + param.slice(1));
    }
  }
  return blankParams.length > 0 ? (blankParams.join(', ') + ' cannot be blank.') : null;
}

/**
 * Should return true when every element in subset is in set
 * @param {Array} set
 * @param {Array} subset
 * @return {Boolean}
 */
export function checkSuperset(set, subset) {
  let superSet = subset.every(x => {
    return set.indexOf(x) >= 0;
  });
  return superSet;
}
