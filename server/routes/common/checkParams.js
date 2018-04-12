import * as checkNumber from './checkNumber';

export function checkBlankParams(obj, params) {
  let blankParams = [];
  for (let param of params) {
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

/**
 * Checks that req.params.id is given and is a positive integer
 * @param {*} req
 * @param {*} res
 * @param {*} message Error message
 * @return {Boolean} True if valid, false if invalid
 */
export function checkParamId(req, res, message) {
  if (!req.params.id || !checkNumber.isPositiveInteger(req.params.id)) {
    res.status(400).send(message);
    return false;
  }
  return true;
}
