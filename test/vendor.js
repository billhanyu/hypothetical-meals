const alasql = require('alasql');
const assert = require('chai').assert;

describe('Vendor', () => {
  describe('#view()', () => {
    it('should return all vendors', (done) => {
      chai.request(server)
        .get('/vendors')
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

    it('should reject empty object request', (done) => {
      chai.request(server)
        .post('/vendors')
        .send({})
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject request lack of properties', (done) => {
      chai.request(server)
        .post('/vendors')
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
  });

  describe('#modifyVendors()', () => {
    beforeEach(() => {
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
    });

    it('should reject empty object request', (done) => {
      chai.request(server)
        .put('/vendors')
        .send({})
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject duplicate name', (done) => {
      chai.request(server)
        .put('/vendors')
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

    it('should reject invalid input object', (done) => {
      chai.request(server)
        .delete('/vendors')
        .send({        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject invalid id', (done) => {
      chai.request(server)
        .delete('/vendors')
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
        .send({
          'ids': [
            1, 2
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
