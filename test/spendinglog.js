const assert = require('chai').assert;

describe('SpendingLog', () => {
  describe('#view()', () => {
    it('should return all spending logs', (done) => {
      chai.request(server)
        .get('/spendinglogs')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(1);
          assert.strictEqual(res.body[0]['consumed'], 50, 'consumed cost');
          done();
        });
    });
  });
});
