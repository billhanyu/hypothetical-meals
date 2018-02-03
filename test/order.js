const alasql = require('alasql');
const assert = require('chai').assert;
const testTokens = require('./testTokens');

describe('Order', () => {
  describe('#placeOrder()', () => {
        it('should place an order a valid ingredient', (done) => {
            chai.request(server)
            .post('/order')
            .set('Authorization', `Token ${testTokens.noobTestToken}`)
            .send({
                'orders': {
                    '1': 100,
                    '2': 300,
                },
            })
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
        });
    });
});
