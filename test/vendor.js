const testTokens = require('./common/testTokens');
const dbSetup = require('./common/dbSetup');
const assert = require('chai').assert;

beforeEach(() => {
  return dbSetup.setupTestDatabase();
});

describe('Vendor', () => {
  describe('#pages()', () => {
    it('should return number of pages of data', (done) => {
      chai.request(server)
        .get('/vendors/pages')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          assert.strictEqual(res.body['numPages'], 1, 'number of pages');
          done();
        });
    });
  });

  describe('#view()', () => {
    it('should return all vendors', (done) => {
      chai.request(server)
        .get('/vendors/page/1')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(3);
          done();
        });
    });
  });

  describe('#viewAvailable()', () => {
    it('should return all vendors', (done) => {
      chai.request(server)
        .get('/vendors-available')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(3);
          done();
        });
    });
  });

  describe('#viewWithId()', () => {
    it('should return vendor with id', (done) => {
      chai.request(server)
        .get('/vendors/id/1')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          assert.strictEqual(res.body.name, 'Duke', 'vendor 1 name');
          done();
        });
    });
  });

  describe('#getVendorWithCode()', () => {
    it('should return vendor with code', (done) => {
      chai.request(server)
        .get('/vendors/code')
        .query({ code: 'code_duke' })
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          assert.strictEqual(res.body.name, 'Duke', 'name of vendor should be Duke');
          done();
        });
    });

    it('should return 404 for nonexistent code', (done) => {
      chai.request(server)
        .get('/vendors/code')
        .query({ code: 'fuck' })
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe('#addVendors()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });

    it('should fail add vendor as noob', (done) => {
      chai.request(server)
        .post('/vendors')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({})
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should reject empty object request', (done) => {
      chai.request(server)
        .post('/vendors')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({})
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject request lack of properties', (done) => {
      chai.request(server)
        .post('/vendors')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'vendors': [
            {
              'name': 'mcd',
              'contact': 'mcd@mcd.com',
              'code': 'mcd',
            },
            {
              'name': 'kfc',
              'contact': 'kfc@kfc.com',
            },
          ],
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should add vendor if inactive vendor has same name', (done) => {
      connection.query(`INSERT INTO Vendors (name, contact, code, isactive) VALUES
        ('mcd', 'abc', 'mcd', NULL)`)
        .then(() => {
          chai.request(server)
            .post('/vendors')
            .set('Authorization', `Token ${testTokens.adminTestToken}`)
            .send({
              'vendors': [
                {
                  'name': 'bleblebleb',
                  'contact': 'mcd@mcd.com',
                  'code': 'mcd',
                },
              ],
            })
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        })
        .catch(err => console.log(err));
    });

    it('should add vendor if inactive vendor has same name', (done) => {
      connection.query(`INSERT INTO Vendors (name, contact, code, isactive) VALUES
        ('mcd', 'abc', 'mcd', NULL)`)
        .then(() => {
          chai.request(server)
            .post('/vendors')
            .set('Authorization', `Token ${testTokens.adminTestToken}`)
            .send({
              'vendors': [
                {
                  'name': 'mcd',
                  'contact': 'mcd@mcd.com',
                  'code': 'mcd',
                },
              ],
            })
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        })
        .catch(err => console.log(err));
    });

    it('should reject if active vendor has same name', (done) => {
        chai.request(server)
          .post('/vendors')
          .set('Authorization', `Token ${testTokens.adminTestToken}`)
          .send({
            'vendors': [
              {
                'name': 'Duke',
                'contact': 'abc',
                'code': 'abc',
              },
            ],
          })
          .end((err, res) => {
            res.should.have.status(400);
            assert.strictEqual(res.text, 'Duplicate name or code with other vendor', 'Catches duplicate entry');
            done();
          });
    });

    it('should reject if active vendor has same code', (done) => {
      chai.request(server)
        .post('/vendors')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'vendors': [
            {
              'name': 'test_code',
              'contact': 'abc',
              'code': 'code_admin',
            },
          ],
        })
        .end((err, res) => {
          res.should.have.status(400);
          assert.strictEqual(res.text, 'Duplicate name or code with other vendor', 'Catches duplicate entry');
          done();
        });
  });

    it('should add vendors for valid requests', (done) => {
      chai.request(server)
        .post('/vendors')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'vendors': [
            {
              'name': 'mcd',
              'contact': 'mcd@mcd.com',
              'code': 'mcd',
            },
            {
              'name': 'kfc',
              'contact': 'kfc@kfc.com',
              'code': 'kfc',
            },
          ],
        })
        .end((err, res) => {
          res.should.have.status(200);
          connection.query('SELECT id FROM Vendors')
          .then((changed) => {
            assert.strictEqual(changed.length, 5, 'new number of vendors');
            done();
          })
          .catch((error) => console.log(error));
        });
    });

    it('should add new vendors', (done) => {
      chai.request(server)
        .post('/vendors')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'vendors': [
            {
              'name': 'hi',
              'contact': 'hi@duke.edu',
              'code': 'codehi',
            },
            {
              'name': 'bleh',
              'contact': 'bleh@unc.edu',
              'code': 'codebleh',
            },
          ],
        })
        .end((err, res) => {
          res.should.have.status(200);
          connection.query('SELECT * FROM Vendors')
          .then((changed) => {
            assert.strictEqual(changed.length, 5, 'Number of rows in Vendor table.');
            assert.strictEqual(changed[3]['name'], 'hi', 'Name for vendor 3.');
            assert.strictEqual(changed[3]['contact'], 'hi@duke.edu', 'Contact for vendor 3.');
            assert.strictEqual(changed[3]['code'], 'codehi', 'Code for vendor 3.');
            assert.strictEqual(changed[4]['name'], 'bleh', 'Name for vendor 4.');
            assert.strictEqual(changed[4]['contact'], 'bleh@unc.edu', 'Contact for vendor 4.');
            assert.strictEqual(changed[4]['code'], 'codebleh', 'Code for vendor 4.');
            done();
          })
          .catch((error) => console.log(error));
        });
    });
  });

  describe('#modifyVendors()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });

    it('should fail modify vendor as noob', (done) => {
      chai.request(server)
        .put('/vendors')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({})
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should reject empty object request', (done) => {
      chai.request(server)
        .put('/vendors')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({})
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject invalid id', (done) => {
      chai.request(server)
        .put('/vendors')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'vendors': {
            '2a': {
              'code': 'code_random',
            },
          },
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should modify vendors for valid requests', (done) => {
      chai.request(server)
        .put('/vendors')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'vendors': {
            '1': {
              'name': 'duke1',
            },
            '2': {
              'contact': 'mcd@mcd.com',
              'code': 'mcd',
            },
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          connection.query('SELECT * FROM Vendors WHERE id IN (1, 2)')
          .then((changed) => {
            assert.strictEqual(changed[0]['name'], 'duke1', 'duke new name');
            assert.strictEqual(changed[1]['contact', 'mcd@mcd.com', 'unc new contact']);
            assert.strictEqual(changed[1]['code'], 'mcd', 'unc new code');
            done();
          })
          .catch((error) => console.log(error));
        });
    });
  });

  describe('#deleteVendors()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });

    it('should fail delete vendor as noob', (done) => {
      chai.request(server)
        .delete('/vendors')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({})
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should reject invalid input object', (done) => {
      chai.request(server)
        .delete('/vendors')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({})
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject invalid id', (done) => {
      chai.request(server)
        .delete('/vendors')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'ids': [
            1, 2, 'fw',
          ],
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should delete multiple vendors for valid request', (done) => {
      chai.request(server)
        .delete('/vendors')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'ids': [
            1, 2,
          ],
        })
        .end((err, res) => {
          res.should.have.status(200);
          connection.query('SELECT removed FROM Vendors')
          .then((left) => {
            assert.strictEqual(left[0].removed, 1, 'vendor 1 deleted');
            assert.strictEqual(left[1].removed, 1, 'vendor 2 deleted');
            done();
          })
          .catch((error) => console.log(error));
        });
    });

    it('should delete corresponding vendoringredient', (done) => {
      chai.request(server)
        .delete('/vendors')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'ids': [
            1,
          ],
        })
        .end((err, res) => {
          res.should.have.status(200);
          connection.query('SELECT removed FROM VendorsIngredients')
          .then((left) => {
            assert.strictEqual(left[0].removed, 1, 'vendoringredient 1 deleted');
            assert.strictEqual(left[1].removed, 1, 'vendoringredient 2 deleted');
            assert.strictEqual(left[2].removed, 1, 'vendoringredient 3 deleted');
            done();
          })
          .catch((error) => console.log(error));
        });
    });

    it('should work for vendors without vendoringredients', (done) => {
      chai.request(server)
        .delete('/vendors')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'ids': [
            2,
          ],
        })
        .end((err, res) => {
          res.should.have.status(200);
          connection.query('SELECT removed FROM VendorsIngredients')
          .then((left) => {
            assert.strictEqual(left[0].removed, 0, 'vendoringredient 1 still there');
            assert.strictEqual(left[1].removed, 0, 'vendoringredient 2 still there');
            assert.strictEqual(left[2].removed, 0, 'vendoringredient 2 still there');
            done();
          })
          .catch((error) => console.log(error));
        });
    });
  });
});
