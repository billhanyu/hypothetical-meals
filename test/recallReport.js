const assert = require('chai').assert;
const testTokens = require('./common/testTokens');
const dbSetup = require('./common/dbSetup');

describe('RecallReport', () => {
  beforeEach(() => {
    return dbSetup.setupTestDatabase();
  });
  describe('#getRecallForIngredient()', () => {
    it('should return all products related to that recall (goes through intermediates)', (done) => {
      chai.request(server)
        .get('/recall')
        .query({
          'recall': {
            'ingredient_id': 3,
            'lot': 'sb',
          },
        })
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          const results = res.body;
          assert.strictEqual(results.length, 3, 'Number of products that have recall params');
          assert.strictEqual(results[0].id, 1, 'Id of product run with recall params');
          assert.strictEqual(results[0].formula_id, 1, 'Id for formula with recall params');
          assert.strictEqual(results[0].name, 'cake', 'Formula name for recall report');
          assert.strictEqual(results[0].lot, 'aa', 'Lot number given to product run 1');
          assert.strictEqual(results[0].num_product, 100, 'Number of products produced in production run 1');
          assert.strictEqual(results[0].ingredients.length, 2, 'Number of ingredients in product run 1');
          assert.strictEqual(results[0].ingredients[0].ingredient_id, 3, 'Has ingredient in recall param');
          assert.strictEqual(results[0].ingredients[0].lot, 'sb', 'Has proper lot number in recall param');

          assert.strictEqual(results[1].id, 2, 'Id of product run with recall params');
          assert.strictEqual(results[1].formula_id, 3, 'Id for formula with recall params');
          assert.strictEqual(results[1].name, 'booploop', 'Formula name for recall report');
          assert.strictEqual(results[1].lot, 'abc123', 'Lot number given to product run 2');
          assert.strictEqual(results[1].num_product, 6, 'Number of products produced in production run 2');
          assert.strictEqual(results[1].ingredients.length, 2, 'Number of ingredients in product run 2');

          assert.strictEqual(results[2].id, 3, 'Id of product run with recall params');
          assert.strictEqual(results[2].formula_id, 4, 'Id for formula with recall params');
          assert.strictEqual(results[2].name, 'booploop final shit', 'Cake formula part of recall report');
          assert.strictEqual(results[2].lot, 'def123', 'Lot number given to product run 3');
          assert.strictEqual(results[2].num_product, 6, 'Number of products produced in production run 3');
          assert.strictEqual(results[2].ingredients.length, 2, 'Number of ingredients in product run 3');
          done();
        });
    });

    it('should return all products related to that recall final only', (done) => {
      chai.request(server)
        .get('/recall')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .query({
          'recall': {
            'ingredient_id': 1,
            'lot': 'aaa',
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          const results = res.body;
          assert.strictEqual(results.length, 1, 'Number of products that have recall params');
          assert.strictEqual(results[0].id, 3, 'Id of product run with recall params');
          assert.strictEqual(results[0].formula_id, 4, 'Id for formula with recall params');
          assert.strictEqual(results[0].name, 'booploop final shit', 'Formula name for recall report');
          assert.strictEqual(results[0].lot, 'def123', 'Lot number given to product run 3');
          assert.strictEqual(results[0].num_product, 6, 'Number of products produced in production run 3');
          assert.strictEqual(results[0].ingredients.length, 2, 'Number of ingredients in product run 3');
          done();
        });
    });
  });
});
