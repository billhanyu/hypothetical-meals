const alasql = require('alasql');
const assert = require('chai').assert;

describe('VendorIngredient', () => {
  describe('#getVendorsForIngredient()', () => {
    it('should return all vendors for an ingredient', (done) => {
      chai.request(server)
        .get('/vendoringredients/1')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          assert.strictEqual(res.body[0]['vendor_id'], 1, 'vendor_id');
          done();
        });
    });
  });

  describe('#addVendorIngredients()', () => {
    beforeEach(() => {
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
    });

    it('should reject request body without a vendoringredients object', (done) => {
      chai.request(server)
        .post('/vendoringredients')
        .send({})
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject request with incomplete fields', (done) => {
      chai.request(server)
        .post('/vendoringredients')
        .send({
          'vendoringredients': [
            {
              'ingredient_id': 1,
              'vendor_id': 2,
              'price': 100,
            },
          ],
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject vendoringredient already existing', (done) => {
      chai.request(server)
        .post('/vendoringredients')
        .send({
          'vendoringredients': [
            {
              'ingredient_id': 1,
              'vendor_id': 1,
              'package_type': 'sack',
              'price': 100,
            },
          ],
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should add vendoringredients for valid requests', (done) => {
      chai.request(server)
        .post('/vendoringredients')
        .send({
          'vendoringredients': [
            {
              'ingredient_id': 1,
              'vendor_id': 2,
              'package_type': 'sack',
              'price': 100,
            },
            {
              'ingredient_id': 2,
              'vendor_id': 1,
              'package_type': 'sack',
              'price': 100,
            },
          ],
        })
        .end((err, res) => {
          res.should.have.status(200);
          const newItems = alasql('SELECT * FROM VendorsIngredients');
          newItems.should.be.a('array');
          assert.strictEqual(newItems.length, 4, 'new number of vendoringredients');
          done();
        });
    });
  });

  describe('#modifyVendorIngredients()', () => {
    beforeEach(() => {
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
    });

    it('should reject request body without a vendoringredients object', (done) => {
      chai.request(server)
        .put('/vendoringredients')
        .send({})
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject request with invalid id', (done) => {
      chai.request(server)
        .put('/vendoringredients')
        .send({
          'vendoringredients': {
            '1a': {
              'price': 100,
            },
          },
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should modify vendoringredients with valid requests', (done) => {
      chai.request(server)
        .put('/vendoringredients')
        .send({
          'vendoringredients': {
            '1': {
              'price': 999,
              'package_type': 'truckload',
            },
            '2': {
              'price': 99,
            },
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          const changed = alasql('SELECT * FROM VendorsIngredients WHERE id IN (1, 2)');
          assert.equal(changed[0]['price'], 999, 'price for id 1');
          assert.strictEqual(changed[0]['package_type'], 'truckload', 'package_type for id 1');
          assert.equal(changed[1]['price'], 99, 'price for id 2');
          done();
        });
    });
  });

  describe('#deleteVendorIngredients()', () => {
    beforeEach(() => {
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
    });

    it('should reject request body without an ids object', (done) => {
      chai.request(server)
        .delete('/vendoringredients')
        .send({})
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject invalid ids', (done) => {
      chai.request(server)
        .delete('/vendoringredients')
        .send({
          'ids': ['aaa', 2],
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should delete multiple vendorsingredients', (done) => {
      chai.request(server)
        .delete('/vendoringredients')
        .send({
          'ids': [1, 2],
        })
        .end((err, res) => {
          res.should.have.status(200);
          const left = alasql('SELECT id FROM VendorsIngredients');
          assert.strictEqual(left.length, 0, 'there should be nothing left');
          done();
        });
    });
  });
});
