import server from '../server/server';

const alasql = require('alasql');
const assert = require('chai').assert;
const testTokens = require('./testTokens');

describe('Formulas', () => {
    describe('#view()', () => {
      it('should return all formulas', (done) => {
        chai.request(server)
          .get('/formulas')
          .set('Authorization', `Token ${testTokens.adminTestToken}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(2);
            done();
          });
      });

      it('should reject noobs to view', (done) => {
        chai.request(server)
          .get('/formulas')
          .set('Authorization', `Token ${testTokens.noobTestToken}`)
          .end((err, res) => {
            res.should.have.status(401);
            done();
          });
      });
    });
});
