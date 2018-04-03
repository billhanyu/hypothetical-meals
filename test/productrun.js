const assert = require('chai').assert;
const testTokens = require('./common/testTokens');
require('./test');

describe('ProductRuns', () => {
  describe('#view()', () => {
    it('should return all production runs', (done) => {
      chai.request(server)
        .get('/productruns')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          const runs = res.body;
          assert.strictEqual(runs.length, 3, 'number of runs');
          assert.strictEqual(runs[0].ingredients.length, 2, 'number of ingredients for run 1');
          assert.strictEqual(runs[0].user_name, 'Bill', 'User that did the run');
          done();
        });
    });
  });
});
