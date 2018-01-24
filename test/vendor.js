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

    describe('#addVendors()', () => {
      beforeEach(() => {
        alasql('SOURCE "./server/create_database.sql"');
        alasql('SOURCE "./server/sample_data.sql"');
      });

      it('should add new vendors', (done) => {
        chai.request(server)
        .post('/vendors')
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
  });
});
