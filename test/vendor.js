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
});
