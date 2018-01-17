const alasql = require('alasql');
const assert = require('chai').assert;

describe('Inventory', () => {
  describe('#view()', () => {
    it('should return inventory items', (done) => {
      chai.request(server)
        .get('/inventory')
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

    it('should modify inventory quantities', (done) => {
      chai.request(server)
        .put('/inventory/admin')
        .send({
          'changes': {
            '1': 999,
            '2': 99,
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          const changed = alasql('SELECT * FROM Inventories');
          assert.strictEqual(changed[0]['num_packages'], 999, 'Inventory item 1 packages.');
          assert.strictEqual(changed[1]['num_packages'], 99, 'Inventory item 2 packages.');
          done();
        });
    });

    it('should delete from inventory when quantity is zero', (done) => {
      chai.request(server)
        .put('/inventory/admin')
        .send({
          'changes': {
            '1': 0,
            '2': 99,
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          const changed = alasql('SELECT * FROM Inventories');
          changed.length.should.be.eql(1);
          assert.strictEqual(changed[0]['num_packages'], 99, 'Inventory item 2 packages.');
          done();
        });
    });

    it('should decline invalid numbers', (done) => {
      chai.request(server)
        .put('/inventory/admin')
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

    it('should reduce inventory quantities', (done) => {
      chai.request(server)
        .put('/inventory')
        .send({
          'cart': {
            '1': 1,
            '2': 1,
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          const changed = alasql('SELECT * FROM Inventories');
          assert.strictEqual(changed[0]['num_packages'], 9, 'Inventory item 1 packages.');
          assert.strictEqual(changed[1]['num_packages'], 4, 'Inventory item 2 packages.');
          done();
        });
    });

    it('should delete from inventory when quantity is zero', (done) => {
      chai.request(server)
        .put('/inventory')
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
          assert.strictEqual(changed[0]['num_packages'], 3, 'Inventory item 2 packages.');
          done();
        });
    });

    it('should decline requests too large', (done) => {
      chai.request(server)
        .put('/inventory')
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

    it('should decline empty changes object', (done) => {
      chai.request(server)
        .put('/inventory')
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
