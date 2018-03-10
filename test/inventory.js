const alasql = require('alasql');
const assert = require('chai').assert;
const testTokens = require('./testTokens');

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
        .query({ids: [1, 2, 4, 5]})
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
          assert.strictEqual(lots[1].lot, 'bb', 'lot bb name');
          assert.strictEqual(lots[2].lot, 'cc', 'lot cc name');
          assert.strictEqual(lots[0].quantity, 100, 'lot ff quantity');
          assert.strictEqual(lots[1].quantity, 200, 'lot bb quantity');
          assert.strictEqual(lots[2].quantity, 300, 'lot cc quantity');
          done();
        });
    });
  });

  describe('#modifyQuantities()', () => {
    beforeEach(() => {
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
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
          const changed = alasql('SELECT * FROM Inventories');
          assert.strictEqual(changed[0].id, 1, 'Inventory item 1 left.');
          assert.strictEqual(changed[0].num_packages, 7, 'Inventory item 1 new number of packages.');
          assert.strictEqual(changed[1].id, 2, 'Inventory item 2 left.');
          assert.strictEqual(changed[1].num_packages, 17, 'Inventory item 2 new number of packages.');
          done();
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
          const changed = alasql('SELECT * FROM Inventories');
          changed.length.should.be.eql(5);
          assert.strictEqual(changed[0].id, 2, 'Inventory item 2 left.');
          assert.strictEqual(changed[0].num_packages, 20, 'Inventory item 2 new number of packages.');
          assert.strictEqual(changed[1].id, 3, 'Inventory item 3 left.');
          assert.strictEqual(changed[1].num_packages, 30, 'Inventory item 3 new number of packages.');
          assert.strictEqual(changed[2].id, 4, 'Inventory item 4 left.');
          assert.strictEqual(changed[2].num_packages, 20, 'Inventory item 4 new number of packages.');
          done();
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
          const left = alasql('SELECT * FROM Inventories');
          assert.strictEqual(left[0].id, 1, 'Inventory item 1 left.');
          assert.strictEqual(left[0].num_packages, 10, 'Inventory item 1 number of packages.');
          assert.strictEqual(left[1].id, 2, 'Inventory item 2 left.');
          assert.strictEqual(left[1].num_packages, 20, 'Inventory item 2 number of packages.');
          assert.strictEqual(left[2].id, 3, 'Inventory item 3 left.');
          assert.strictEqual(left[2].num_packages, 30, 'Inventory item 3 number of packages.');
          done();
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
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
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
          const changed = alasql('SELECT * FROM Inventories');
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
          const spending = alasql('SELECT * FROM SpendingLogs WHERE id IN (3, 4)');
          assert.strictEqual(spending[0].id, 3, 'spendinglog for ingredient 3');
          assert.strictEqual(spending[0].consumed, 60, 'spendinglog 3 consumed cost');
          assert.strictEqual(spending[1].id, 4, 'spendinglog for ingredient 3');
          assert.strictEqual(spending[1].consumed, 70, 'spendinglog 4 consumed cost');
          done();
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
          const changed = alasql('SELECT * FROM Inventories');
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
      alasql('INSERT INTO Ingredients (id, name, package_type, storage_id, native_unit, num_native_units) VALUES (5, "eric\'s dick", "sack", 2, "g", 50)');
      alasql('INSERT INTO Formulas (id, name, description, num_product) VALUES (3, "eric\'s shit", "just shit", 10)');
      alasql('INSERT INTO FormulaEntries (id, ingredient_id, num_native_units, formula_id) VALUES (1, 5, 1, 3)');
      chai.request(server)
        .put('/inventory')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .send({
          'formula_id': 3,
          'num_products': 1,
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
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
