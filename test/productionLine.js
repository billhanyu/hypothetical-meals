import server from '../server/server';

const assert = require('chai').assert;
const testTokens = require('./common/testTokens');
const dbSetup = require('./common/dbSetup');

describe('ProductionLines', () => {
  beforeEach(() => {
    return dbSetup.setupTestDatabase();
  });
  describe('#view()', () => {
    it('should return all production lines', (done) => {
      chai.request(server)
        .get('/productionlines')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          const lines = res.body;
          assert.strictEqual(lines.length > 1, true, 'more than one line');
          assert.strictEqual(lines[0].name, 'line1', 'name of first line');
          assert.strictEqual(lines[0].description, 'first line', 'first line description');
          assert.strictEqual(Array.isArray(lines[0].occupancies) && lines[0].occupancies.length == 1, true, 'one occupancy');
          assert.strictEqual(Array.isArray(lines[0].formulas) && lines[0].formulas.length == 2, true, 'two formulas');
          done();
        });
    });
  });

  describe('#viewWithId()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });
    it('should return production line with id', (done) => {
      chai.request(server)
        .get('/productionlines/id/1')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          const lines = res.body;
          assert.strictEqual(lines.length, 1, 'first line');
          assert.strictEqual(lines[0].id, 1, 'id of first line');
          done();
        });
    });
  });

  describe('#add()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });
    it('should add a production line', (done) => {
      chai.request(server)
        .post('/productionlines')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'lines': [{
            'name': 'bleb',
            'description': 'something',
            'formulas': [
              1,
            ],
          }],
        })
        .end((err, res) => {
          res.should.have.status(200);
          Promise.all([
            connection.query(`SELECT * FROM Productionlines ORDER BY id ASC`),
            connection.query(`SELECT * FROM FormulaProductionLines ORDER BY id ASC`),
          ])
            .then(results => {
              const [lines, formulaLines] = results;
              const lineLast = lines.length-1;
              const formulaLineLast = formulaLines.length-1;
              assert.strictEqual(lines[lineLast].name, 'bleb', 'Name of added line');
              assert.strictEqual(lines[lineLast].description, 'something', 'Description of added line');
              assert.strictEqual(formulaLines[formulaLineLast].formula_id, 1, 'Formula id added to new line');
              assert.strictEqual(formulaLines[formulaLineLast].productionline_id, lineLast + 1, 'Correct production line association');
              done();
            })
            .catch(e => console.log(e));
        });
    });
  });
});
