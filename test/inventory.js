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
          assert(changed[0]['num_packages'] === 999, 'Inventory item 1 should be 999 packages.');
          assert(changed[1]['num_packages'] === 99, 'Inventory item 2 should be 99 packages.');
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
});
