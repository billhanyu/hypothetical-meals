const assert = require('chai').assert;
const testTokens = require('./common/testTokens');
const dbSetup = require('./common/dbSetup');

describe('Sales', () => {
  beforeEach(() => {
    return dbSetup.setupTestDatabase();
  });
  describe('#view()', () => {
    it('should get all completed sales', (done) => {
      chai.request(server)
        .get('/sales/all')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          assert.isArray(res.body);
          assert.strictEqual(res.body.length, 2);
          done();
        });
    });
  });

  describe('#submitSaleRequest()', () => {
    it('should submit sale for valid request', (done) => {
      chai.request(server)
        .post('/sales')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .send({
          'products': [{
            'formula_id': 1,
            'num_packages': 5,
            'sell_price_per_product': 100,
          },
          {
            'formula_id': 3,
            'num_packages': 20,
            'sell_price_per_product': 95,
          }],
        })
        .end((err, res) => {
          res.should.have.status(200);
          Promise.all([
            connection.query('SELECT * FROM FinalProductInventories'),
            connection.query('SELECT * FROM Formulas'),
            connection.query('SELECT * FROM Sales'),
          ])
          .then(results => {
            const [finalProductInventories, formulas, sales] = results;

            assert.strictEqual(finalProductInventories.length, 3);

            assert.strictEqual(finalProductInventories[0].id, 1);
            assert.strictEqual(finalProductInventories[0].formula_id, 1);
            assert.strictEqual(finalProductInventories[0].num_packages, 5);
            assert.strictEqual(finalProductInventories[1].id, 3);
            assert.strictEqual(finalProductInventories[1].formula_id, 4);
            assert.strictEqual(finalProductInventories[1].num_packages, 12);
            assert.strictEqual(finalProductInventories[2].id, 4);
            assert.strictEqual(finalProductInventories[2].formula_id, 3);
            assert.strictEqual(finalProductInventories[2].num_packages, 4);

            assert.strictEqual(formulas[0].id, 1);
            assert.isOk(formulas[0].worst_duration > 0);
            assert.isOk(formulas[0].total_weighted_duration > 0);
            assert.strictEqual(formulas[0].total_num_products, 15);
            assert.strictEqual(formulas[1].id, 2);
            assert.isOk(formulas[1].worst_duration > 0);
            assert.isOk(formulas[1].total_weighted_duration > 0);
            assert.strictEqual(formulas[1].total_num_products, 7);
            assert.strictEqual(formulas[2].id, 3);
            assert.isOk(formulas[2].worst_duration > 0);
            assert.isOk(formulas[2].total_weighted_duration > 0);
            assert.strictEqual(formulas[2].total_num_products, 40);

            assert.strictEqual(sales.length, 3);
            assert.strictEqual(sales[0].formula_id, 1);
            assert.strictEqual(sales[0].num_packages, 11);
            assert.strictEqual(sales[0].total_cost, 52.45);
            assert.strictEqual(sales[0].total_revenue, 502);
            assert.strictEqual(sales[1].formula_id, 4);
            assert.strictEqual(sales[1].num_packages, 7);
            assert.strictEqual(sales[1].total_cost, 3);
            assert.strictEqual(sales[1].total_revenue, 3);
            assert.strictEqual(sales[2].formula_id, 3);
            assert.strictEqual(sales[2].num_packages, 40);
            assert.strictEqual(sales[2].total_cost, 158.2);
            assert.strictEqual(sales[2].total_revenue, 20 * 95 * 2);
            done();
          })
          .catch((error) => console.log(error));
        });
    });

    it('should fail to submit sale for insuffient packages in the final product inventory', (done) => {
      chai.request(server)
        .post('/sales')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .send({
          'products': [{
            'formula_id': 1,
            'num_packages': 15,
            'sell_price_per_package': 100,
          }],
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should fail to submit sale for missing formula product in final product inventory', (done) => {
      chai.request(server)
        .post('/sales')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .send({
          'products': [{
            'formula_id': 2,
            'num_packages': 1,
            'sell_price_per_package': 100,
          }],
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });
});
