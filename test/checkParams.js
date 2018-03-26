import * as checkParams from '../server/routes/common/checkParams';

const assert = require('chai').assert;

describe('checkParams', () => {
  describe('#checkSuperset()', () => {
    it('should return true if all elements in subset are in set', () => {
      const set = [1, 2, 3, 4, 5];
      const subset = [1, 3];
      let result = checkParams.checkSuperset(set, subset);
      assert.strictEqual(result, true, 'Result when all in subset are in set');
    });

    it('should return false if element in subset are are not in set', () => {
      const set = [1, 2, 3, 4, 5];
      const subset = [1, 10];
      let result = checkParams.checkSuperset(set, subset);
      assert.strictEqual(result, false, 'Result when any element in subset is not in set');
    });
  });
});
