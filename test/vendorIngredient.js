const alasql = require('alasql');
const assert = require('chai').assert;
const testTokens = require('./testTokens');

describe('VendorIngredient', () => {
  describe('#view()', () => {
    it('should return all vendorsingredients', (done) => {
      chai.request(server)
        .get('/vendoringredients')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          assert.strictEqual(res.body.length, 3, '3 vendorsingredients in total');
          done();
        });
    });
  });

  describe('#viewAvailable()', () => {
    it('should return all available vendorsingredients', (done) => {
      alasql('UPDATE VendorsIngredients SET removed = 1 WHERE id = 1');
      chai.request(server)
        .get('/vendoringredients-available')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          assert.strictEqual(res.body.length, 2, '2 vendorsingredients available in total');
          done();
        });
    });
  });

  describe('#getVendorsForIngredient()', () => {
    beforeEach(() => {
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
    });

    it('should return all vendors for an ingredient', (done) => {
      chai.request(server)
        .get('/vendoringredients/1')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          assert.strictEqual(res.body[0]['vendor_id'], 1, 'vendor_id');
          done();
        });
    });

    it('should return only available vendors for an ingredient', (done) => {
      alasql('UPDATE VendorsIngredients SET removed = 1 WHERE ingredient_id = 1');
      chai.request(server)
        .get('/vendoringredients/1')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          assert.strictEqual(res.body.length, 0, 'Nothing should be selected');
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
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({})
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject request with incomplete fields', (done) => {
      chai.request(server)
        .post('/vendoringredients')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
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
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
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

    it('should reject noobs', (done) => {
      chai.request(server)
        .post('/vendoringredients')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
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
          res.should.have.status(401);
          done();
        });
    });

    it('should add vendoringredients for valid requests', (done) => {
      chai.request(server)
        .post('/vendoringredients')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
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
          assert.strictEqual(newItems.length, 5, 'new number of vendoringredients');
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
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({})
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject request with invalid id', (done) => {
      chai.request(server)
        .put('/vendoringredients')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
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

    it('should reject request with id not in table', (done) => {
      chai.request(server)
        .put('/vendoringredients')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'vendoringredients': {
            '1': {
              'price': 100,
            },
            '100': {
              'price': 100,
            },
          },
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject noobs', (done) => {
      chai.request(server)
        .put('/vendoringredients')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
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
          res.should.have.status(401);
          done();
        });
    });

    it('should modify vendoringredients with valid requests', (done) => {
      chai.request(server)
        .put('/vendoringredients')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
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
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({})
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject invalid ids', (done) => {
      chai.request(server)
        .delete('/vendoringredients')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'ids': ['aaa', 2],
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject noobs', (done) => {
      chai.request(server)
        .delete('/vendoringredients')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({
          'ids': [1, 2, 3],
        })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should delete multiple vendorsingredients', (done) => {
      chai.request(server)
        .delete('/vendoringredients')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'ids': [1, 2],
        })
        .end((err, res) => {
          res.should.have.status(200);
          const left = alasql('SELECT removed FROM VendorsIngredients WHERE id IN (1, 2, 3)');
          assert.strictEqual(left.length, 3, 'fake delete 3 stuff');
          assert.strictEqual(left[0].removed, 1, 'fake delete 1');
          assert.strictEqual(left[1].removed, 1, 'fake delete 2');
          assert.strictEqual(left[2].removed, 0, 'not fake delete 3');
          done();
        });
    });
  });
});
