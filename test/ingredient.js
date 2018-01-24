const testTokens = require('./testTokens');

describe('Ingredient', () => {
  describe('#view()', () => {
    it('should return all ingredients', (done) => {
      chai.request(server)
        .get('/ingredients')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(3);
          done();
        });
    });
  });
});
