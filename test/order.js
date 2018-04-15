const dbSetup = require('./common/dbSetup');
const assert = require('chai').assert;
const testTokens = require('./common/testTokens');

describe('Order', () => {
  describe('#viewPendingOrders()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });

    it('Should show all pending orders and linked inventory information', (done) => {
      Promise.all([
        connection.query(`INSERT INTO Inventories
          (ingredient_id, num_packages, lot, vendor_id, per_package_cost, order_id, arrived) VALUES
          (1, 2, 'PENDING', 1, 10, 1, 0)`),
      ])
        .then(() => {
          chai.request(server)
            .get('/order/pending')
            .set('Authorization', `Token ${testTokens.managerTestToken}`)
            .end((err, res) => {
              res.should.have.status(200);
              const orders = res.body;
              const inventoryIngredient = orders['1'];
              assert.strictEqual(orders['1'].length, 1, 'Total number of ingredients pending in order 1');
              assert.strictEqual(inventoryIngredient[0].id, 7, 'Inventory id of pending order 1 ingredient');
              assert.strictEqual(inventoryIngredient[0].ingredient_id, 1, 'Ingredient pending order 1');
              assert.strictEqual(inventoryIngredient[0].ingredient_name, 'poop', 'Ingredient name');
              assert.strictEqual(inventoryIngredient[0].num_packages, 2, 'Number of packages of pending ingredient');
              assert.strictEqual(inventoryIngredient[0].vendor_id, 1, 'Vendor for pending ingredient');
              assert.strictEqual(inventoryIngredient[0].vendor_name, 'Duke', 'Vendor name');
              assert.strictEqual(inventoryIngredient[0].per_package_cost, 10, 'Package cost of pending ingredient');
              assert.strictEqual(inventoryIngredient[0].order_id, 1, 'Order number of ingredient');
              assert.strictEqual(inventoryIngredient[0].arrived, 0, 'Status of ingredient');
              done();
            });
        })
        .catch((err) => console.log(err));
    });
  });

  describe('#viewAllOrders()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });

    it('Should show all orders and linked inventory information', (done) => {
      chai.request(server)
        .get('/order')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          const orders = res.body;
          const inventoryIngredient = orders['1'];
          assert.strictEqual(orders['1'].length, 1, 'Total number of ingredients in order 1');
          assert.strictEqual(inventoryIngredient[0].id, 5, 'Inventory id of order 1 ingredient');
          assert.strictEqual(inventoryIngredient[0].ingredient_id, 3, 'Ingredient order 1');
          assert.strictEqual(inventoryIngredient[0].num_packages, 20, 'Number of packages of ingredient');
          assert.strictEqual(inventoryIngredient[0].vendor_id, 1, 'Vendor for ingredient');
          assert.strictEqual(inventoryIngredient[0].per_package_cost, 5.1, 'Package cost of ingredient');
          assert.strictEqual(inventoryIngredient[0].order_id, 1, 'Order number of ingredient');
          assert.strictEqual(inventoryIngredient[0].arrived, 1, 'Status of ingredient');
          done();
        });
    });
  });

  describe('#placeOrder()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });

    it('should place an order for valid ingredients', (done) => {
      Promise.all([
        connection.query(`SELECT COUNT(1) FROM Inventories`),
        connection.query(`SELECT COUNT(1) FROM Orders`),
      ])
        .then((allResults) => {
          const [inventoryResult, orderResult] = allResults;
          const numInventoryEntries = inventoryResult[0]['COUNT(1)'];
          const numOrders = orderResult[0]['COUNT(1)'];
          chai.request(server)
            .post('/order')
            .set('Authorization', `Token ${testTokens.managerTestToken}`)
            .send({
              'orders': {
                '1': {
                  'num_packages': 2,
                },
                '3': {
                  'num_packages': 1,
                },
              },
            })
            .end((err, res) => {
              res.should.have.status(200);
              connection.query('SELECT * FROM Inventories')
                .then((inventory) => {
                  assert.strictEqual(inventory.length, numInventoryEntries + 2, 'Number of things in inventory');
                  assert.strictEqual(inventory[numInventoryEntries].id, numInventoryEntries + 1, 'Id for order with lot number abc123');
                  assert.strictEqual(inventory[numInventoryEntries].ingredient_id, 1, 'Ingredient id for order with lot number abc123');
                  assert.strictEqual(inventory[numInventoryEntries].num_packages, 2, 'Number of packages for order with lot number abc123');
                  assert.strictEqual(inventory[numInventoryEntries].lot, 'PENDING', 'Lot number in order');
                  assert.strictEqual(inventory[numInventoryEntries].order_id, numOrders + 1, 'Order id for inventory entry');
                  assert.strictEqual(inventory[numInventoryEntries].per_package_cost, 10, 'Package cost of ingredient');
                  assert.strictEqual(inventory[numInventoryEntries + 1].id, numInventoryEntries + 2, 'Id for order with lot number 03859');
                  assert.strictEqual(inventory[numInventoryEntries + 1].ingredient_id, 3, 'Ingredient id for order with lot number 03859');
                  assert.strictEqual(inventory[numInventoryEntries + 1].num_packages, 1, 'Number of packages for order with lot number 03859');
                  assert.strictEqual(inventory[numInventoryEntries + 1].lot, 'PENDING', 'Lot number in order');
                  assert.strictEqual(inventory[numInventoryEntries].order_id, numOrders + 1, 'Order id for inventory entry');
                  assert.strictEqual(inventory[numInventoryEntries + 1].per_package_cost, 30, 'Package cost of ingredient');
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

                  return connection.query(`SELECT * FROM Orders`);
                })
                .then(orders => {
                  assert.strictEqual(orders.length, numOrders + 1, 'Total number of orders');
                  done();
                })
                .catch((err) => console.error(err));
            });
        })
        .catch((err) => {
          console.error(err);
        });
    });

    it('should place reject an order with invalid ingredients', (done) => {
      chai.request(server)
        .post('/order')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .send({
          'orders': {
            '10': {
              'num_packages': 2,
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
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .send({
          'orders': {
            '4': {
              'num_packages': 100,
            },
          },
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });

  describe('#markIngredientArrived()', () => {
    it('Should mark an ingredient as arrived', (done) => {
      Promise.all([
        connection.query(`INSERT INTO Inventories
        (ingredient_id, num_packages, lot, vendor_id, per_package_cost, order_id, arrived) VALUES
        (1, 2, 'PENDING', 1, 10, 1, 0)`),
      ])
        .then((results) => {
          const inventorySize = 7;
          chai.request(server)
            .put('/order')
            .set('Authorization', `Token ${testTokens.managerTestToken}`)
            .send({
              'ingredients': [
                {
                  'inventory_id': inventorySize,
                  'lots': {
                    '1849abc': 1,
                    '18a82b': 1,
                  },
                },
              ],
            })
            .end((err, res) => {
              res.should.have.status(200);
              connection.query(`SELECT * FROM Inventories`)
                .then((inventories) => {
                  const lastIndex = inventories.length-1;
                  assert.strictEqual(inventories.every(x => x.id != 7), true, 'Deleted old placehold entry');
                  assert.strictEqual(inventories[lastIndex-1].ingredient_id, 1, 'Ingredient id of inventory');
                  assert.strictEqual(inventories[lastIndex-1].num_packages, 1, 'Number of packages in inventory for ingredient');
                  assert.strictEqual(inventories[lastIndex-1].lot, '1849abc', 1, 'Correct lot number assigned');
                  assert.strictEqual(inventories[lastIndex-1].vendor_id, 1, 'Vendor for ingredient in inventory');
                  assert.strictEqual(inventories[lastIndex-1].per_package_cost, 10, 'Cost per package for ingredient');
                  assert.strictEqual(inventories[lastIndex-1].order_id, 1, 'Order number of inventory ingredient');
                  assert.strictEqual(inventories[lastIndex-1].arrived, 1, 'Status of ingredient in inventory'); 
                  assert.strictEqual(inventories[lastIndex].ingredient_id, 1, 'Ingredient id of inventory');
                  assert.strictEqual(inventories[lastIndex].num_packages, 1, 'Number of packages in inventory for ingredient');
                  assert.strictEqual(inventories[lastIndex].lot, '18a82b', 1, 'Correct lot number assigned');
                  assert.strictEqual(inventories[lastIndex].vendor_id, 1, 'Vendor for ingredient in inventory');
                  assert.strictEqual(inventories[lastIndex].per_package_cost, 10, 'Cost per package for ingredient');
                  assert.strictEqual(inventories[lastIndex].order_id, 1, 'Order number of inventory ingredient');
                  assert.strictEqual(inventories[lastIndex].arrived, 1, 'Status of ingredient in inventory');
                  done();
                })
                .catch((e) => console.log(e));
            });
        })
        .catch((err) => console.log(err));
    });
  });
});
