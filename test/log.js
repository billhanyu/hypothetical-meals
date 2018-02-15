import { addEntry } from '../server/routes/log';

const alasql = require('alasql');
const assert = require('chai').assert;
const testTokens = require('./testTokens');


describe('Log', () => {
  describe('#pages()', () => {
    it('should return number of pages of data', (done) => {
      chai.request(server)
        .get('/logs/pages')
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
    it('should return all logs', (done) => {
      chai.request(server)
        .get('/logs/page/1')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(2);
          done();
        });
    });
  });

  describe('#viewLogForIngredient()', () => {
    beforeEach(() => {
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
    });

    it('should return all logs for a vendor ingredient', (done) => {
      chai.request(server)
      .get('/logs/ingredients/page/1')
      .set('Authorization', `Token ${testTokens.noobTestToken}`)
      .send({
        'vendor_ingredient_ids': [3],
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(1);
        done();
      });
    });

    it('should return no logs for a vendor ingredient not in table', (done) => {
      chai.request(server)
      .get('/logs/ingredients/page/1')
      .set('Authorization', `Token ${testTokens.noobTestToken}`)
      .send({
        'vendor_ingredient_ids': [10],
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(0);
        done();
      });
    });
  });

  describe('#addEntry()', () => {
    beforeEach(() => {
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
    });

    const req = [
      {
        'vendor_ingredient_id': 1,
        'quantity': 10,
      },
    ];

    it('should throw error for nonexistent ingredient because of package type', function() {
      addEntry(req, 4)
      .catch((err) => {
        assert.strictEqual(err.custom, 'Placing order for nonexistent vendor ingredient for package type.', 'Error message.');
      });
    });

    it('should throw error for nonexistent ingredient with a package type', function() {
      addEntry(req, 4)
      .catch((err) => {
        assert.strictEqual(err.custom, 'Placing order for nonexistent vendor ingredient for package type.', 'Error message.');
      });
    });

    const validReq = [
      {
        'vendor_ingredient_id': 2,
        'quantity': 10,
      },
      {
        'vendor_ingredient_id': 1,
        'quantity': 10,
      },
    ];

    it('should add two entries for a vendor ingredient', function() {
      addEntry(validReq, 4)
      .then(() => {
        const newLogs = alasql('SELECT * FROM Logs');
        assert.strictEqual(newLogs[2]['user_id'], 4, 'User id for log 3.');
        assert.strictEqual(newLogs[2]['vendor_ingredient_id'], 1, 'Vendor id for log 3.');
        assert.strictEqual(newLogs[2]['quantity'], 500, 'Quantity for log 3.');
        assert.strictEqual(newLogs[3]['user_id'], 4, 'User id for log 4.');
        assert.strictEqual(newLogs[3]['vendor_ingredient_id'], 2, 'Vendor id for log 4.');
        assert.strictEqual(newLogs[3]['quantity'], 500, 'Quantity for log 4.');
        assert.strictEqual(newLogs.length, 4, 'Length of logs.');

        const newSpendingLogs = alasql('SELECT * FROM SpendingLogs');
        assert.strictEqual(newSpendingLogs[0]['total'], 5100, 'Total spent for ingredient 1.');
        assert.strictEqual(newSpendingLogs[0]['total_weight'], 1000, 'Total weight for ingredient 1.');
        assert.strictEqual(newSpendingLogs[0]['ingredient_id'], 1, 'Ingredient id for spending log 1.');
        assert.strictEqual(newSpendingLogs[0]['consumed'], 50, 'Quantity consumed for ingredient 1.');
        assert.strictEqual(newSpendingLogs[1]['total'], 200, 'Total spent for ingredient 2.');
        assert.strictEqual(newSpendingLogs[1]['total_weight'], 500, 'Total weight for ingredient 2.');
        assert.strictEqual(newSpendingLogs[1]['ingredient_id'], 2, 'Vendor id for log 4.');
        assert.strictEqual(newSpendingLogs[1]['consumed'], 0, 'Quantity consumed for ingredient 2.');
        assert.strictEqual(newSpendingLogs.length, 2, 'Length of spending logs.');
      });
    });
  });
});
