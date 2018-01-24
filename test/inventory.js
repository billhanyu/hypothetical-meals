const alasql = require('alasql');
const assert = require('chai').assert;
const testTokens = require('./testTokens');

describe('Inventory', () => {
  describe('#view()', () => {
    it('should return inventory items', (done) => {
      chai.request(server)
        .get('/inventory')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(2);
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

    it('should modify inventory quantities with storage_weight first', (done) => {
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
          assert.strictEqual(changed[0]['total_weight'], 7, 'Inventory item 1 total weight.');
          assert.strictEqual(changed[1]['total_weight'], 17, 'Inventory item 2 total weight.');
          assert.strictEqual(changed[0]['storage_weight'], 2, 'Inventory item 1 storage weight.');
          assert.strictEqual(changed[1]['storage_weight'], 12, 'Inventory item 2 storage weight.');
          done();
        });
    });

    it('should reduce total_weight when storage_weight is not enough', (done) => {
      chai.request(server)
        .put('/inventory/admin')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'changes': {
            '1': 2,
            '2': 12,
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          const changed = alasql('SELECT * FROM Inventories');
          assert.strictEqual(changed[0]['total_weight'], 2, 'Inventory item 1 total weight.');
          assert.strictEqual(changed[1]['total_weight'], 12, 'Inventory item 2 total weight.');
          assert.strictEqual(changed[0]['storage_weight'], 0, 'Inventory item 1 storage weight.');
          assert.strictEqual(changed[1]['storage_weight'], 7, 'Inventory item 2 storage weight.');
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
          changed.length.should.be.eql(1);
          assert.strictEqual(changed[0]['total_weight'], 20, 'Inventory item 2 total weight.');
          done();
        });
    });

    it('should add to total_weight first', (done) => {
      chai.request(server)
        .put('/inventory/admin')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'changes': {
            '1': 100,
            '2': 100,
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          const changed = alasql('SELECT * FROM Inventories');
          assert.strictEqual(changed[0]['total_weight'], 100, 'Inventory item 1 total weight.');
          assert.strictEqual(changed[1]['total_weight'], 100, 'Inventory item 2 total weight.');
          assert.strictEqual(changed[0]['storage_weight'], 5, 'Inventory item 1 storage weight.');
          assert.strictEqual(changed[1]['storage_weight'], 15, 'Inventory item 2 storage weight.');
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

    it('should reduce inventory quantities with storage_weight reduced first', (done) => {
      chai.request(server)
        .put('/inventory')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({
          'cart': {
            '1': 1,
            '2': 1,
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          const changed = alasql('SELECT * FROM Inventories');
          assert.strictEqual(changed[0]['total_weight'], 9, 'Inventory item 1 total weight.');
          assert.strictEqual(changed[1]['total_weight'], 19, 'Inventory item 2 total weight.');
          assert.strictEqual(changed[0]['storage_weight'], 4, 'Inventory item 1 storage weight.');
          assert.strictEqual(changed[1]['storage_weight'], 14, 'Inventory item 2 storage weight.');
          done();
        });
    });

    it('should reduce total_weight when storage_weight is not enough', (done) => {
      chai.request(server)
        .put('/inventory')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({
          'cart': {
            '1': 6,
            '2': 6,
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          const changed = alasql('SELECT * FROM Inventories');
          assert.strictEqual(changed[0]['total_weight'], 4, 'Inventory item 1 total weight.');
          assert.strictEqual(changed[1]['total_weight'], 14, 'Inventory item 2 total weight.');
          assert.strictEqual(changed[0]['storage_weight'], 0, 'Inventory item 1 storage weight.');
          assert.strictEqual(changed[1]['storage_weight'], 9, 'Inventory item 2 storage weight.');
          done();
        });
    });

    it('should delete from inventory when quantity is zero', (done) => {
      chai.request(server)
        .put('/inventory')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({
          'cart': {
            '1': 10,
            '2': 2,
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          const changed = alasql('SELECT * FROM Inventories');
          changed.length.should.be.eql(1);
          assert.strictEqual(changed[0]['total_weight'], 18, 'Inventory item 2 total weight.');
          done();
        });
    });

    it('should decline requests too large', (done) => {
      chai.request(server)
        .put('/inventory')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({
          'cart': {
            '1': 999,
            '2': 99,
          },
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should decline item not in inventory', (done) => {
      chai.request(server)
        .put('/inventory')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({
          'cart': {
            '3': 1,
            '2': 1,
          },
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should decline invalid numbers', (done) => {
      chai.request(server)
        .put('/inventory')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({
          'cart': {
            '1a': 999,
            '2': 99,
          },
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should decline nonpositive numbers', (done) => {
      chai.request(server)
        .put('/inventory')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({
          'cart': {
            '1': 0,
            '2': 1,
          },
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should decline empty cart object', (done) => {
      chai.request(server)
        .put('/inventory')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({
          'cart': {
          },
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });
});
