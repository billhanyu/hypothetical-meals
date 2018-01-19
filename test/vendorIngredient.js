const assert = require('chai').assert;

describe('VendorIngredient', () => {
  describe('#getVendorsForIngredientf()', () => {
    it('should return all vendors for an ingredient', (done) => {
      chai.request(server)
        .get('/vendoringredients/1')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          assert.strictEqual(res.body[0]['vendor_id'], 1, 'vendor_id');
          done();
        });
    });
  });
});
