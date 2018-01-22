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

  describe('#addVendorIngredient()', () => {
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
});
