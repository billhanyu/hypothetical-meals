import server from '../server/server';

const assert = require('chai').assert;
const testTokens = require('./common/testTokens');
const dbSetup = require('./common/dbSetup');

describe('Profitability Report', () => {
  beforeEach(() => {
    return dbSetup.setupTestDatabase();
  });
  describe('#view()', () => {
    it('should show all final products and their profitability attributes', (done) => {
      chai.request(server)
        .get('/profitability')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          const product = res.body[0];
          assert.strictEqual(product.formula_id, 1, 'Formula id for product');
          assert.strictEqual(product.formula_name, 'cake', 'Formula name for product');
          assert.strictEqual(product.total_ingredient_cost, 100.9, 'Cost from product run sums');
          assert.strictEqual(product.units_sold, 6, 'Units sold of cake, from num packages in sales');
          assert.strictEqual(product.wholesale_revenue, 2, 'Total revenue for all sales of cake');
          assert.strictEqual(product.average_wholesale_price, 2 / 6, 'Total revenue over units sold');
          assert.strictEqual(product.total_profit, product.wholesale_revenue - product.total_ingredient_cost, 'Profit for product');
          assert.strictEqual(product.unit_profit, product.total_profit / product.units_sold, 'Unit profit for product');
          assert.strictEqual(product.profit_margin, product.wholesale_revenue / product.total_ingredient_cost, 'Profit margin for product');
          done();
        });
    });
  });
});
