const testTokens = require('./testTokens');
const alasql = require('alasql');
const assert = require('chai').assert;

describe('Vendor', () => {
  describe('#view()', () => {
    it('should return all vendors', (done) => {
      chai.request(server)
        .get('/vendors')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(2);
          done();
        });
    });
  });

  describe('#addVendors()', () => {
    beforeEach(() => {
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
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

    it('should reject duplicate name', (done) => {
      chai.request(server)
        .post('/vendors')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'vendors': [
            {
              'name': 'Duke',
              'contact': 'mcd@mcd.com',
              'code': 'mcd',
            },
          ],
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject duplicate name within request', (done) => {
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
              'name': 'mcd',
              'contact': 'mcd',
              'code': 'mcd1',
            },
          ],
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject duplicate code', (done) => {
      chai.request(server)
        .post('/vendors')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'vendors': [
            {
              'name': 'mcd',
              'contact': 'mcd@mcd.com',
              'code': 'code_duke',
            },
          ],
        })
        .end((err, res) => {
          res.should.have.status(400);
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
          const changed = alasql('SELECT id FROM Vendors');
          assert.strictEqual(changed.length, 4, 'new number of vendors');
          done();
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
          const changed = alasql('SELECT * FROM Vendors');
          assert.strictEqual(changed.length, 4, 'Number of rows in Vendor table.');
          assert.strictEqual(changed[2]['name'], 'hi', 'Name for vendor 3.');
          assert.strictEqual(changed[2]['contact'], 'hi@duke.edu', 'Contact for vendor 3.');
          assert.strictEqual(changed[2]['code'], 'codehi', 'Code for vendor 3.');
          assert.strictEqual(changed[3]['name'], 'bleh', 'Name for vendor 4.');
          assert.strictEqual(changed[3]['contact'], 'bleh@unc.edu', 'Contact for vendor 4.');
          assert.strictEqual(changed[3]['code'], 'codebleh', 'Code for vendor 4.');
          done();
        });
    });
  });

  describe('#modifyVendors()', () => {
    beforeEach(() => {
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
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

    it('should reject duplicate name', (done) => {
      chai.request(server)
        .put('/vendors')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'vendors': {
            '2': {
              'name': 'Duke',
            },
          },
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject duplicate name within request', (done) => {
      chai.request(server)
        .put('/vendors')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'vendors': {
            '1': {
              'name': 'bill',
            },
            '2': {
              'name': 'bill',
            },
          },
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject duplicate code', (done) => {
      chai.request(server)
        .put('/vendors')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'vendors': {
            '2': {
              'code': 'code_duke',
            },
          },
        })
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
          const changed = alasql('SELECT * FROM Vendors WHERE id IN (1, 2)');
          assert.strictEqual(changed[0]['name'], 'duke1', 'duke new name');
          assert.strictEqual(changed[1]['contact', 'mcd@mcd.com', 'unc new contact']);
          assert.strictEqual(changed[1]['code'], 'mcd', 'unc new code');
          done();
        });
    });
  });

  describe('#deleteVendors()', () => {
    beforeEach(() => {
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
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
          const left = alasql('SELECT id FROM Vendors');
          assert.strictEqual(left.length, 0, 'no vendor left');
          done();
        });
    });
  });
});
