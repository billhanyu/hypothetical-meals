const assert = require('chai').assert;
const alasql = require('alasql');
const testTokens = require('./testTokens');

describe('RecallReport', () => {
  describe('#getRecallForIngredient()', () => {
    xit('should return all products related to that recall', (done) => {
      chai.request(server)
        .get('/recall')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'recall': {
            'ingredient_id': 3,
            'lot': '123abc',
            'vendor_id': 1,
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
});
