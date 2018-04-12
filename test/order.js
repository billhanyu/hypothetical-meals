const dbSetup = require('./common/dbSetup');
const assert = require('chai').assert;
const testTokens = require('./common/testTokens');

describe('Order', () => {
  describe('#placeOrder()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });

    // add back when lot assignment is complete
    it('should place an order for valid ingredients', (done) => {
      connection.query(`SELECT COUNT(1) FROM Inventories`)
        .then((inventoryResult) => {
          const numInventoryEntries = inventoryResult[0]['COUNT(1)'];
          chai.request(server)
            .post('/order')
            .set('Authorization', `Token ${testTokens.noobTestToken}`)
            .send({
              'orders': {
                '1': {
                  'num_packages': 2,
                  'lots': {
                    'abc123': 1,
                    '03859': 1,
                  },
                },
                '3': {
                  'num_packages': 1,
                  'lots': {
                    'qbd910': 1,
                  },
                },
              },
            })
            .end((err, res) => {
              res.should.have.status(200);
              connection.query('SELECT * FROM Inventories')
                .then((inventory) => {
                  assert.strictEqual(inventory.length, numInventoryEntries + 3, 'Number of things in inventory');
                  assert.strictEqual(inventory[numInventoryEntries].id, numInventoryEntries + 1, 'Id for order with lot number abc123');
                  assert.strictEqual(inventory[numInventoryEntries].ingredient_id, 1, 'Ingredient id for order with lot number abc123');
                  assert.strictEqual(inventory[numInventoryEntries].num_packages, 1, 'Number of packages for order with lot number abc123');
                  assert.strictEqual(inventory[numInventoryEntries].lot, 'abc123', 'Lot number in order');
                  assert.strictEqual(inventory[numInventoryEntries].per_package_cost, 10, 'Package cost of ingredient');
                  assert.strictEqual(inventory[numInventoryEntries + 1].id, numInventoryEntries + 2, 'Id for order with lot number 03859');
                  assert.strictEqual(inventory[numInventoryEntries + 1].ingredient_id, 1, 'Ingredient id for order with lot number 03859');
                  assert.strictEqual(inventory[numInventoryEntries + 1].num_packages, 1, 'Number of packages for order with lot number 03859');
                  assert.strictEqual(inventory[numInventoryEntries + 1].lot, '03859', 'Lot number in order');
                  assert.strictEqual(inventory[numInventoryEntries + 1].per_package_cost, 10, 'Package cost of ingredient');
                  assert.strictEqual(inventory[numInventoryEntries + 2].id, numInventoryEntries + 3, 'Id for order with lot number 03859');
                  assert.strictEqual(inventory[numInventoryEntries + 2].ingredient_id, 3, 'Ingredient id for order with lot number 03859');
                  assert.strictEqual(inventory[numInventoryEntries + 2].num_packages, 1, 'Number of packages for order with lot number 03859');
                  assert.strictEqual(inventory[numInventoryEntries + 2].lot, 'qbd910', 'Lot number in order');
                  assert.strictEqual(inventory[numInventoryEntries + 2].per_package_cost, 30, 'Package cost of ingredient');
                  return connection.query('SELECT * FROM SpendingLogs');
                })
                .then(spendingLogs => {
                  assert.strictEqual(spendingLogs.length, 4, 'Length of spending logs');
                  assert.strictEqual(spendingLogs[0].ingredient_id, 1, 'Ingredient id for spending log 1');
                  assert.strictEqual(spendingLogs[0].total_weight, 520, 'Ingredient weight for spending log 1');
                  assert.strictEqual(spendingLogs[0].total, 5020, 'Total amount spent for ingredient 1');
                  assert.strictEqual(spendingLogs[0].consumed, 50, 'Total amount consumed in weight for ingredient 1');
                  assert.strictEqual(spendingLogs[1].ingredient_id, 2, 'Ingredient id for spending log 2');
                  assert.strictEqual(spendingLogs[1].total_weight, 500, 'Ingredient weight for spending log 2');
                  assert.strictEqual(spendingLogs[1].total, 5000, 'Total amount spent for ingredient 2');
                  assert.strictEqual(spendingLogs[1].consumed, 50, 'Total amount consumed in weight for ingredient 2');
                  assert.strictEqual(spendingLogs[2].ingredient_id, 3, 'Ingredient id for spending log 3');
                  assert.strictEqual(spendingLogs[2].total_weight, 520, 'Ingredient weight for spending log 3');
                  assert.strictEqual(spendingLogs[2].total, 5030, 'Total amount spent for ingredient 3');
                  assert.strictEqual(spendingLogs[2].consumed, 50, 'Total amount consumed in weight for ingredient 3');
                  done();
                })
                .catch((err) => console.error(err));
            });
        })
        .catch((err) => {
          console.error(err);
        });
    });

    it('should reject for empty lot number', (done) => {
      connection.query(`SELECT COUNT(1) FROM Inventories`)
        .then((inventoryResult) => {
          chai.request(server)
            .post('/order')
            .set('Authorization', `Token ${testTokens.noobTestToken}`)
            .send({
              'orders': {
                '1': {
                  'num_packages': 2,
                  'lots': {
                    '': 1,
                    '03859': 1,
                  },
                },
              },
            })
            .end((err, res) => {
              res.should.have.status(400);
              done();
            });
        })
        .catch((err) => {
          console.error(err);
        });
    });

    it('should place reject an order with invalid ingredients', (done) => {
      chai.request(server)
        .post('/order')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({
          'orders': {
            '10': {
              'num_packages': 2,
              'lots': {
                'abc123': 2,
              },
            },
          },
        })
        .end((err, res) => {
          res.should.have.status(400);
          assert.strictEqual(res.text, 'Some id not in Vendor Ingredients');
          done();
        });
    });

    it('should reject an order with ingredient over capacity', (done) => {
      chai.request(server)
        .post('/order')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({
          'orders': {
            '4': {
              'num_packages': 100,
              'lots': {
                'abc123': 100,
              },
            },
          },
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });
});
