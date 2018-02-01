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
          res.body.length.should.be.eql(3);
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
          changed.length.should.be.eql(2);
          assert.strictEqual(changed[0].id, 2, 'Inventory item 2 left.');
          assert.strictEqual(changed[0].num_packages, 20, 'Inventory item 2 new number of packages.');
          assert.strictEqual(changed[1].id, 3, 'Inventory item 3 left.');
          assert.strictEqual(changed[1].num_packages, 2, 'Inventory item 3 new number of packages.');
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
          assert.strictEqual(changed[0].id, 1, 'Inventory item 1 left.');
          assert.strictEqual(changed[0].num_packages, 9, 'Inventory item 1 new number of packages.');
          assert.strictEqual(changed[1].id, 2, 'Inventory item 2 left.');
          assert.strictEqual(changed[1].num_packages, 19, 'Inventory item 2 new number of packages.');
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
          changed.length.should.be.eql(2);
          assert.strictEqual(changed[0].id, 2, 'Inventory item 2 left.');
          assert.strictEqual(changed[0].num_packages, 18, 'Inventory item 2 number packages left.');
          assert.strictEqual(changed[1].id, 3, 'Inventory item 3 left.');
          assert.strictEqual(changed[1].num_packages, 2, 'Inventory item 3 number packages left.');
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
            '100': 1,
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
