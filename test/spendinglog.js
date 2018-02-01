const assert = require('chai').assert;
const testTokens = require('./testTokens');

describe('SpendingLog', () => {
  describe('#pages()', () => {
    it('should return number of pages of data', (done) => {
      chai.request(server)
        .get('/spendinglogs/pages')
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
    it('should return all spending logs', (done) => {
      chai.request(server)
        .get('/spendinglogs/page/1')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(1);
          assert.strictEqual(res.body[0]['consumed'], 50, 'consumed cost');
          done();
        });
    });
  });

  describe('#logsForIngredient()', () => {
    it('should return the logs for ingredient 1', (done) => {
      chai.request(server)
      .get('/spendinglogs/1')
      .set('Authorization', `Token ${testTokens.noobTestToken}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(1);
        assert.strictEqual(res.body[0]['total'], 100, 'total cost');
        done();
      });
    });
  });
});
