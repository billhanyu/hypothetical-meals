const dbSetup = require('./common/dbSetup');
const assert = require('chai').assert;
const testTokens = require('./common/testTokens');

describe('VendorIngredient', () => {
  describe('#pages()', () => {
    it('should return number of pages of data', (done) => {
      chai.request(server)
        .get('/vendoringredients/pages')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          assert.strictEqual(res.body['numPages'], 1, 'number of pages');
          done();
        });
    });
  });

  describe('#getVendorsForIngredient()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
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
      connection.query('UPDATE VendorsIngredients SET removed = 1 WHERE ingredient_id = 1')
        .then(result => {
          chai.request(server)
            .get('/vendoringredients/1')
            .set('Authorization', `Token ${testTokens.noobTestToken}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('array');
              assert.strictEqual(res.body.length, 0, 'Nothing should be selected');
              done();
            });
        })
        .catch(error => {
          console.log(error);
        });
    });
  });

  describe('#addVendorIngredients()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
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

    it('should reject vendoringredient already existing', (done) => {
      chai.request(server)
        .post('/vendoringredients')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'vendoringredients': [
            {
              'ingredient_id': 1,
              'vendor_id': 1,
              'price': 100,
            },
          ],
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject vendoringredient with invalid price', (done) => {
      chai.request(server)
        .post('/vendoringredients')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'vendoringredients': [
            {
              'ingredient_id': 1,
              'vendor_id': 1,
              'price': '',
            },
          ],
        })
        .end((err, res) => {
          res.should.have.status(400); // check error code
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
              'price': 100,
            },
            {
              'ingredient_id': 2,
              'vendor_id': 1,
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
              'ingredient_id': 4,
              'vendor_id': 1,
              'price': 100.1,
            },
            {
              'ingredient_id': 3,
              'vendor_id': 2,
              'price': 100,
            },
          ],
        })
        .end((err, res) => {
          res.should.have.status(200);
          connection.query('SELECT * FROM VendorsIngredients')
          .then((newItems) => {
            newItems.should.be.a('array');
            assert.strictEqual(newItems.length, 6, 'new number of vendoringredients');
            done();
          })
          .catch((error) => console.log(error));
        });
    });
  });

  describe('#modifyVendorIngredients()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
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
              'price': 999,
            },
            '100': {
              'price': 99,
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

    it('should fail negative price', (done) => {
      chai.request(server)
        .put('/vendoringredients')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'vendoringredients': {
            '1': {
              'price': -1,
            },
          },
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should fail invalid price', (done) => {
      chai.request(server)
        .put('/vendoringredients')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'vendoringredients': {
            '1': {
              'price': '',
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
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'vendoringredients': {
            '1': {
              'price': 999,
            },
            '2': {
              'price': 99,
            },
            '3': {
              'price': 30,
            },
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          connection.query('SELECT * FROM VendorsIngredients WHERE id IN (1, 2, 3)')
          .then((changed) => {
            assert.equal(changed[0]['price'], 999, 'price for id 1');
            assert.equal(changed[1]['price'], 99, 'price for id 2');
            done();
          })
          .catch((error) => console.log(error));
        });
    });
  });

  describe('#deleteVendorIngredients()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
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
          connection.query('SELECT removed FROM VendorsIngredients WHERE id IN (1, 2, 3)')
          .then((left) => {
            assert.strictEqual(left.length, 3, 'fake delete 3 stuff');
            assert.strictEqual(left[0].removed, 1, 'fake delete 1');
            assert.strictEqual(left[1].removed, 1, 'fake delete 2');
            assert.strictEqual(left[2].removed, 0, 'not fake delete 3');
            done();
          })
          .catch((error) => console.log(error));
        });
    });
  });
});
