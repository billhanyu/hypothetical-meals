import { updateLogForIngredient } from '../server/routes/spendinglog';

const assert = require('chai').assert;
const alasql = require('alasql');
const testTokens = require('./testTokens');

describe('SpendingLog', () => {
  describe('#view()', () => {
    it('should return all spending logs', (done) => {
      chai.request(server)
        .get('/spendinglogs')
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

  describe('#updateLogForIngredient()', () => {
    it('should update the spending log for ingredients', function() {
      const request = {
        '1': {
          'total_weight': 100,
          'cost': 10,
          },
        '2': {
          'total_weight': 50,
          'cost': 30,
          },
      };
      Promise.resolve(updateLogForIngredient(request))
      .then(() => {
        const spendingLogs = alasql('SELECT * FROM SpendingLogs');
        assert.strictEqual(spendingLogs.length, 2, 'New length of spending logs');
        assert.strictEqual(spendingLogs[0]['total'], 110, 'Total spent on ingredient with id 1.');
        assert.strictEqual(spendingLogs[0]['total_weight'], 200, 'Total weight for ingredient 1.');
        assert.strictEqual(spendingLogs[1]['total'], 30, 'Total spent on ingredient with id 2.');
        assert.strictEqual(spendingLogs[1]['total_weight'], 50, 'Total weight for ingredient 2.');
      })
      .catch((err) => {
        console.log(err);
      });
    });
  });
});
