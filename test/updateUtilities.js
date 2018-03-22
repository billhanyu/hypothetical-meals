import * as updateUtil from '../server/routes/common/updateUtilities';

const assert = require('chai').assert;

describe('Update Utilities', () => {
  describe('#getToUpdate()', () => {
    it('should return an object with keys to update and updates', function() {
      const oldData = [
        {
          'id': 1,
          'prop1': 'boo',
          'prop2': 'foo',
          'prop3': 'moo',
        },
        {
          'id': 2,
          'prop1': 'bye',
          'prop2': 'hi',
          'prop3': 'test',
        },
      ];
      const newData = [
        {
          'id': 1,
          'prop1': 'bill',
          'prop2': 'eric',
        },
        {
          'id': 2,
          'prop3': 'brian',
        },
      ];
      const newDataMap = updateUtil.createNewUpdateMap(newData);
      const updateCompare = updateUtil.getToUpdate(oldData, newDataMap);
      const updatedData = updateCompare.updates;
      assert.strictEqual(Object.keys(updatedData[0].updates).length, 4, 'Number of keys in first column');
      assert.strictEqual(Object.keys(updatedData[1].updates).length, 4, 'Number of keys in second column');
      assert.strictEqual(updatedData[0].updates.id, 1, 'ID for column 1');
      assert.strictEqual(updatedData[0].updates.prop1, 'bill', 'Updated prop');
      assert.strictEqual(updatedData[0].updates.prop2, 'eric', 'Updated prop');
      assert.strictEqual(updatedData[0].updates.prop3, 'moo', 'Updated prop same as old if new n/a');
      assert.strictEqual(updatedData[1].updates.id, 2, 'ID for column 2');
      assert.strictEqual(updatedData[1].updates.prop1, 'bye', 'Updated prop same as old if new n/a');
      assert.strictEqual(updatedData[1].updates.prop2, 'hi', 'Updated prop same as old if new n/a');
      assert.strictEqual(updatedData[1].updates.prop3, 'brian', 'Updated prop');
    });
  });
  describe('#createUpdateString()', () => {
    it('should create correct update string with string values', function() {
      const updates = [
        {
          'id': 1,
          'updates': {
            'key1': 'value1',
            'key2': 'value2',
          },
        },
        {
          'id': 3,
          'updates': {
            'key1': 'value3',
          },
        },
      ];
      const updateKeys = ['key1', 'key2'];
      const updateString = updateUtil.createUpdateString('table1', updateKeys, updates);
      const expected = `UPDATE table1 SET key1 = (case when id = 1 then 'value1' when id = 3 then 'value3' end), key2 = (case when id = 1 then 'value2' when id = 3 then 'NULL' end) WHERE id IN (1, 3)`;
      assert.strictEqual(updateString, expected, 'Expected string');
    });

    it('should create correct update string with numbers', function() {
      const updates = [
        {
          'id': 1,
          'updates': {
            'key1': 1,
            'key2': 2,
          },
        },
        {
          'id': 3,
          'updates': {
            'key1': 3,
            'key2': 4,
          },
        },
      ];
      const updateKeys = ['key1', 'key2'];
      const updateString = updateUtil.createUpdateString('table1', updateKeys, updates);
      const expected = `UPDATE table1 SET key1 = (case when id = 1 then 1 when id = 3 then 3 end), key2 = (case when id = 1 then 2 when id = 3 then 4 end) WHERE id IN (1, 3)`;
      assert.strictEqual(updateString, expected, 'Expected string');
    });
  });
});
