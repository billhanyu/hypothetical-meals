const assert = require('chai').assert;
const testTokens = require('./common/testTokens');

describe('RecallReport', () => {
  describe('#getRecallForIngredient()', () => {
    it('should return all products related to that recall', (done) => {
      chai.request(server)
        .get('/recall')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'recall': {
            'ingredient_id': 3,
            'lot': 'sb',
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
});
