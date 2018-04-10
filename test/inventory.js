const dbSetup = require('./common/dbSetup');
const assert = require('chai').assert;
const testTokens = require('./common/testTokens');

describe('Inventory', () => {
  describe('#all()', () => {
    it('should return inventory items with total quantities', (done) => {
      chai.request(server)
        .get('/inventory')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(6);
          done();
        });
    });
  });

  describe('#getStock()', () => {
    it('should reject noobs', (done) => {
      chai.request(server)
        .get('/inventory/stock')
        .send({
          ids: [1],
        })
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should reject invalid ids', (done) => {
      chai.request(server)
        .get('/inventory/stock')
        .send({
          ids: [''],
        })
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject invalid input object', (done) => {
      chai.request(server)
        .get('/inventory/stock')
        .send({
          id: [1],
        })
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return inventory stock for valid input', (done) => {
      chai.request(server)
        .get('/inventory/stock')
        .query({ ids: [1, 2, 4, 5] })
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          Object.keys(res.body).length.should.be.eql(3);
          const stock = res.body;
          assert.strictEqual(stock['1'].num_packages, 60, 'ingredient 1 stock');
          assert.strictEqual(stock['2'].num_packages, 20, 'ingredient 2 stock');
          assert.strictEqual(stock['4'].num_packages, 20, 'ingredient 4 stock');
          done();
        });
    });
  });

  describe('#getLotQuantities()', () => {
    it('should return lot quantities for ingredient 1', (done) => {
      chai.request(server)
        .get('/inventory/lot/1')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(3);
          const lots = res.body;
          assert.strictEqual(lots[0].lot, 'ff', 'lot ff name');
          assert.strictEqual(lots[0].vendor, 'Duke', 'item 1 vendor name');
          assert.strictEqual(lots[1].lot, 'bb', 'lot bb name');
          assert.strictEqual(lots[2].lot, 'cc', 'lot cc name');
          assert.strictEqual(lots[0].quantity, 100, 'lot ff quantity');
          assert.strictEqual(lots[1].quantity, 200, 'lot bb quantity');
          assert.strictEqual(lots[2].quantity, 300, 'lot cc quantity');
          assert.strictEqual(lots[0].inventory_id, 1, 'lot ff inventory id');
          assert.strictEqual(lots[1].inventory_id, 2, 'lot bb inventory id');
          assert.strictEqual(lots[2].inventory_id, 3, 'lot cc inventory id');
          done();
        });
    });
  });

  describe('#modifyQuantities()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });

    it('should fail modify inventory quantity as noob', (done) => {
      chai.request(server)
        .put('/inventory/admin')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({
          'changes': {
            '1': 7,
            '2': 17,
          },
        })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should modify inventory quantities with valid request', (done) => {
      chai.request(server)
        .put('/inventory/admin')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'changes': {
            '1': 7,
            '2': 17,
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          connection.query('SELECT * FROM Inventories')
            .then((changed) => {
              assert.strictEqual(changed[0].id, 1, 'Inventory item 1 left.');
              assert.strictEqual(changed[0].num_packages, 7, 'Inventory item 1 new number of packages.');
              assert.strictEqual(changed[1].id, 2, 'Inventory item 2 left.');
              assert.strictEqual(changed[1].num_packages, 17, 'Inventory item 2 new number of packages.');
              done();
            })
            .catch((error) => console.log(error));
        });
    });

    it('should fail invalid quantities', (done) => {
      chai.request(server)
        .put('/inventory/admin')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'changes': {
            '1': -1,
            '2': 17,
          },
        })
        .end((err, res) => {
          res.should.have.status(400);
          connection.query('SELECT * FROM Inventories')
            .then((changed) => {
              assert.strictEqual(changed[0].id, 1, 'Inventory item 1 left.');
              assert.strictEqual(changed[0].num_packages, 10, 'Inventory item 1 number of packages unchanged.');
              assert.strictEqual(changed[1].id, 2, 'Inventory item 2 left.');
              assert.strictEqual(changed[1].num_packages, 20, 'Inventory item 2 number of packages unchanged.');
              done();
            })
            .catch((error) => console.log(error));
        });
    });

    it('should delete from inventory when quantity is zero', (done) => {
      chai.request(server)
        .put('/inventory/admin')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'changes': {
            '1': 0,
            '2': 20,
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          connection.query('SELECT * FROM Inventories')
            .then((changed) => {
              changed.length.should.be.eql(5);
              assert.strictEqual(changed[0].id, 2, 'Inventory item 2 left.');
              assert.strictEqual(changed[0].num_packages, 20, 'Inventory item 2 new number of packages.');
              assert.strictEqual(changed[1].id, 3, 'Inventory item 3 left.');
              assert.strictEqual(changed[1].num_packages, 30, 'Inventory item 3 new number of packages.');
              assert.strictEqual(changed[2].id, 4, 'Inventory item 4 left.');
              assert.strictEqual(changed[2].num_packages, 20, 'Inventory item 4 new number of packages.');
              done();
            })
            .catch((error) => console.log(error));
        });
    });

    it('should decline when exceed storage capacity', (done) => {
      chai.request(server)
        .put('/inventory/admin')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'changes': {
            '1': 100000,
            '2': 99,
          },
        })
        .end((err, res) => {
          res.should.have.status(400);
          connection.query('SELECT * FROM Inventories')
            .then((left) => {
              assert.strictEqual(left[0].id, 1, 'Inventory item 1 left.');
              assert.strictEqual(left[0].num_packages, 10, 'Inventory item 1 number of packages.');
              assert.strictEqual(left[1].id, 2, 'Inventory item 2 left.');
              assert.strictEqual(left[1].num_packages, 20, 'Inventory item 2 number of packages.');
              assert.strictEqual(left[2].id, 3, 'Inventory item 3 left.');
              assert.strictEqual(left[2].num_packages, 30, 'Inventory item 3 number of packages.');
              done();
            })
            .catch((error) => console.log(error));
        });
    });

    it('should decline ingredients not in inventory', (done) => {
      chai.request(server)
        .put('/inventory/admin')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'changes': {
            '100': 999,
            '2': 99,
          },
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should decline invalid numbers', (done) => {
      chai.request(server)
        .put('/inventory/admin')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'changes': {
            '1a': 999,
            '2': 99,
          },
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should decline empty changes object', (done) => {
      chai.request(server)
        .put('/inventory/admin')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'changes': {
          },
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });

  describe('#commitCart()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });

    it('should reduce inventory quantities with valid request', (done) => {
      chai.request(server)
        .put('/inventory')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .send({
          'formula_id': 1,
          'num_products': 1,
        })
        .end((err, res) => {
          res.should.have.status(200);
          connection.query('SELECT * FROM Inventories')
            .then((changed) => {
              assert.strictEqual(changed[0].id, 1, 'Inventory item 1 left.');
              assert.strictEqual(changed[0].num_packages, 10, 'Inventory item 1 new number of packages.');
              assert.strictEqual(changed[1].id, 2, 'Inventory item 2 left.');
              assert.strictEqual(changed[1].num_packages, 20, 'Inventory item 2 new number of packages.');
              assert.strictEqual(changed[2].id, 3, 'Inventory item 3 left.');
              assert.strictEqual(changed[2].num_packages, 30, 'Inventory item 3 new number of packages.');
              assert.strictEqual(changed[3].id, 4, 'Inventory item 4 left.');
              assert.strictEqual(changed[3].num_packages, 20, 'Inventory item 4 new number of packages.');
              assert.strictEqual(changed[4].id, 5, 'Inventory item 5 left.');
              assert.strictEqual(changed[4].num_packages, 19.95, 'Inventory item 5 new number of packages.');
              assert.strictEqual(changed[5].id, 6, 'Inventory item 6 left.');
              assert.strictEqual(changed[5].num_packages, 19.96, 'Inventory item 6 new number of packages.');
              done();
            })
            .catch((error) => console.log(error));
        });
    });

    it('should check if there is storage for creating intermediate product', (done) => {
      connection.query('UPDATE Inventories SET num_packages = 1000000 WHERE ingredient_id IN (3, 4)')
      .then(() => connection.query(`UPDATE Ingredients SET package_type = 'railcar' WHERE id IN (3, 4)`))
      .then(() => {
        chai.request(server)
          .put('/inventory')
          .set('Authorization', `Token ${testTokens.managerTestToken}`)
          .send({
            'formula_id': 3,
            'num_products': 100000,
          })
          .end((err, res) => {
            res.should.have.status(400);
            connection.query('SELECT * FROM Inventories WHERE ingredient_id = 6')
              .then((results) => {
                assert.strictEqual(results.length, 0, 'Intermediate product not added to Inventories table');
                done();
              })
              .catch((error) => console.log(error));
          });
        })
        .catch((error) => console.log(error));
    });

    it('should add creation of intermediate product into inventory', (done) => {
      chai.request(server)
        .put('/inventory')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .send({
          'formula_id': 3,
          'num_products': 30,
        })
        .end((err, res) => {
          res.should.have.status(200);
          connection.query('SELECT * FROM Inventories WHERE ingredient_id = 6')
            .then((results) => {
              assert.strictEqual(results.length, 1, 'Intermediate product added to inventory');
              const product = results[0];
              assert.isOk(Math.abs(product.per_package_cost-0.438 < 0.0001), 'Correct per package cost for intermediate product');
              assert.strictEqual(product.num_packages, 1, 'One package of intermediate product added to inventory');
              assert.strictEqual(product.vendor_id, 1, 'Intermediate product vendor ID is us');
              done();
            })
            .catch((error) => console.log(error));
        });
    });

    it('should not add product into inventory if not intermediate product', (done) => {
      connection.query('SELECT * FROM Inventories')
        .then((results) => {
          const numInventoryItems = results.length;
          chai.request(server)
            .put('/inventory')
            .set('Authorization', `Token ${testTokens.managerTestToken}`)
            .send({
              'formula_id': 2,
              'num_products': 30,
            })
            .end((err, res) => {
              res.should.have.status(200);
              connection.query('SELECT * FROM Inventories')
                .then((results) => {
                  assert.strictEqual(results.length, numInventoryItems, 'No changes in inventory');
                  done();
                })
                .catch((error) => console.log(error));
            });
        })
        .catch((error) => console.log(error));
    });

    it('should write production info to ProductRuns and ProductRunsEntries tables', (done) => {
      chai.request(server)
        .put('/inventory')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .send({
          'formula_id': 2,
          'num_products': 30,
        })
        .end((err, res) => {
          res.should.have.status(200);
          Promise.all([
            connection.query('SELECT * FROM ProductRuns ORDER BY id DESC LIMIT 1'),
            connection.query('SELECT * FROM ProductRunsEntries'),
          ])
            .then((results) => {
              const [productRuns, productRunsEntries] = results;
              assert.strictEqual(productRuns.length, 1, 'ProductRuns entry exists');
              const productRun = productRuns[0];
              assert.strictEqual(productRun.formula_id, 2, 'Product run formula id is correct');
              assert.strictEqual(productRun.num_product, 30, 'Product run num products is correct');
              assert.strictEqual(productRun.user_id, 6, 'Product run user id is correct');

              assert.strictEqual(productRunsEntries.length, 6 + 2, 'Two entries added to product runs entries');
              assert.strictEqual(productRunsEntries[6].productrun_id, productRun.id, 'First product run entry correct product run id');
              assert.strictEqual(productRunsEntries[6].ingredient_id, 1, 'First product run entry correct ingredient id');
              assert.strictEqual(productRunsEntries[6].vendor_id, 1, 'First product run entry correct vendor id');
              assert.strictEqual(productRunsEntries[6].num_native_units, 9, 'First product run entry correct num native units');
              assert.strictEqual(productRunsEntries[6].lot, 'ff', 'First product run entry correct lot');
              assert.strictEqual(productRunsEntries[7].productrun_id, productRun.id, 'First product run entry correct product run id');
              assert.strictEqual(productRunsEntries[7].ingredient_id, 2, 'First product run entry correct ingredient id');
              assert.strictEqual(productRunsEntries[7].vendor_id, 1, 'First product run entry correct vendor id');
              assert.strictEqual(productRunsEntries[7].num_native_units, 12, 'First product run entry correct num native units');
              assert.strictEqual(productRunsEntries[7].lot, 'ff', 'First product run entry correct lot');
              done();
            })
            .catch((error) => console.log(error));
        });
    });

    it('should update spendinglog valid request', (done) => {
      chai.request(server)
        .put('/inventory')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .send({
          'formula_id': 1,
          'num_products': 1,
        })
        .end((err, res) => {
          res.should.have.status(200);
          connection.query('SELECT * FROM SpendingLogs WHERE id IN (3, 4)')
            .then((spending) => {
              assert.strictEqual(spending[0].id, 3, 'spendinglog for ingredient 3');
              assert.strictEqual(spending[0].consumed, 60, 'spendinglog 3 consumed cost');
              assert.strictEqual(spending[1].id, 4, 'spendinglog for ingredient 3');
              assert.strictEqual(spending[1].consumed, 70, 'spendinglog 4 consumed cost');
              done();
            })
            .catch((error) => console.log(error));
        });
    });

    it('should delete from inventory when quantity is zero', (done) => {
      chai.request(server)
        .put('/inventory')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .send({
          'formula_id': 1,
          'num_products': 400,
        })
        .end((err, res) => {
          res.should.have.status(200);
          connection.query('SELECT * FROM Inventories')
            .then((changed) => {
              changed.length.should.be.eql(5);
              assert.strictEqual(changed[0].id, 1, 'Inventory item 1 left.');
              assert.strictEqual(changed[0].num_packages, 10, 'Inventory item 1 number packages left.');
              assert.strictEqual(changed[1].id, 2, 'Inventory item 2 left.');
              assert.strictEqual(changed[1].num_packages, 20, 'Inventory item 2 number packages left.');
              assert.strictEqual(changed[2].id, 3, 'Inventory item 3 left.');
              assert.strictEqual(changed[2].num_packages, 30, 'Inventory item 3 number packages left.');
              assert.strictEqual(changed[3].id, 4, 'Inventory item 4 left.');
              assert.strictEqual(changed[3].num_packages, 20, 'Inventory item 4 number packages left.');
              assert.strictEqual(changed[4].id, 6, 'Inventory item 6 left.');
              assert.strictEqual(changed[4].num_packages, 4, 'Inventory item 6 number packages left.');
              done();
            })
            .catch((error) => console.log(error));
        });
    });

    it('should decline requests too large', (done) => {
      chai.request(server)
        .put('/inventory')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .send({
          'formula_id': 1,
          'num_products': 10000000,
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should decline item not in inventory', (done) => {
      connection.query('INSERT INTO Ingredients (id, name, package_type, storage_id, native_unit, num_native_units) VALUES (7, "eric\'s dick", "sack", 2, "g", 50)')
        .then(() => connection.query('INSERT INTO Formulas (id, name, description, num_product) VALUES (5, "eric\'s shit", "just shit", 10)'))
        .then(() => connection.query('INSERT INTO FormulaEntries (id, ingredient_id, num_native_units, formula_id) VALUES (9, 7, 1, 4)'))
        .then(() => {
          chai.request(server)
            .put('/inventory')
            .set('Authorization', `Token ${testTokens.managerTestToken}`)
            .send({
              'formula_id': 10,
              'num_products': 1,
            })
            .end((err, res) => {
              res.should.have.status(400);
              done();
            });
        })
        .catch((error) => console.log(error));
    });

    it('should decline invalid numbers', (done) => {
      chai.request(server)
        .put('/inventory')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .send({
          'formula_id': '3a;',
          'num_products': 1,
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should decline empty formula id', (done) => {
      chai.request(server)
        .put('/inventory')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .send({
          'num_products': 1,
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should decline empty num products', (done) => {
      chai.request(server)
        .put('/inventory')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .send({
          'formula_id': 1,
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });
});
