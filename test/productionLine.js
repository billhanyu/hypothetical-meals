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

    it('should decline add for manager', (done) => {
      chai.request(server)
        .post('/productionlines')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should decline add for noob', (done) => {
      chai.request(server)
        .post('/productionlines')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('#addFormulaToLine()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });

    it('should add a formula to a line', (done) => {
      chai.request(server)
        .post('/formulaproductionlines')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'lineid': 1,
          'formulaid': 4,
        })
        .end((err, res) => {
          res.should.have.status(200);
          connection.query(`SELECT * FROM FormulaProductionLines WHERE formula_id = 4 AND productionline_id = 1`)
            .then((result) => {
              assert.strictEqual(result.length, 1, 'Added formula production line mapping');
              done();
            })
            .catch((e) => console.log(e));
        });
    });

    it('should reject for noob add a formula to a line', (done) => {
      chai.request(server)
        .post('/formulaproductionlines')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should reject for manager add a formula to a line', (done) => {
      chai.request(server)
        .post('/formulaproductionlines')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('#deleteFormulaFromLine', () => {
    it('should delete a formula production line mapping', (done) => {
      chai.request(server)
      .delete('/formulaproductionlines')
      .set('Authorization', `Token ${testTokens.adminTestToken}`)
      .send({
        'lineid': 1,
        'formulaid': 2,
      })
      .end((err, res) => {
        res.should.have.status(200);
        connection.query(`SELECT * FROM FormulaProductionLines WHERE formula_id = 2 AND productionline_id = 1`)
          .then((result) => {
            assert.strictEqual(result.length, 0, 'Removed formula production line mapping');
            done();
          })
          .catch((e) => console.log(e));
      });
    });

    it('should reject for noob delete a formula production line mapping', (done) => {
      chai.request(server)
      .delete('/formulaproductionlines')
      .set('Authorization', `Token ${testTokens.noobTestToken}`)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
    });

    it('should reject for manager delete a formula production line mapping', (done) => {
      chai.request(server)
      .delete('/formulaproductionlines')
      .set('Authorization', `Token ${testTokens.managerTestToken}`)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
    });
  });

  describe('#modify()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });

    it('should modify the name and formulas of a production line', (done) => {
      chai.request(server)
      .put('/productionlines')
      .set('Authorization', `Token ${testTokens.adminTestToken}`)
      .send({
        'lines': [{
          'id': 1,
          'name': 'namechange',
          'formulas': [3],
        }],
      })
      .end((err, res) => {
        res.should.have.status(200);
        Promise.all([
          connection.query(`SELECT * FROM Productionlines WHERE id = 1`),
          connection.query(`SELECT * FROM FormulaProductionLines WHERE productionline_id = 1`),
        ])
          .then((results) => {
            const [line, formulaLine] = results;
            assert.strictEqual(line[0].name, 'namechange', 'Changed name of production line');
            assert.strictEqual(formulaLine.length, 1, 'Only one formula mapped to line');
            assert.strictEqual(formulaLine[0].formula_id, 3, 'Id of formula mapped to line');
            done();
          })
          .catch((e) => console.log(e));
      });
    });

    it('should reject modify for noob', (done) => {
      chai.request(server)
      .put('/productionlines')
      .set('Authorization', `Token ${testTokens.noobTestToken}`)
      .send({
        'lines': [{
          'id': 1,
          'name': 'namechange',
          'formulas': [3],
        }],
      })
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
    });

    it('should reject modify for manager', (done) => {
      chai.request(server)
      .put('/productionlines')
      .set('Authorization', `Token ${testTokens.managerTestToken}`)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
    });
  });

  describe('#deleteProductionLine', (done) => {
    it('should fake delete production line', (done) => {
      chai.request(server)
      .delete('/productionlines')
      .set('Authorization', `Token ${testTokens.adminTestToken}`)
      .send({
        'lines': [2],
      })
      .end((err, res) => {
        res.should.have.status(200);
        Promise.all([
          connection.query(`SELECT * FROM Productionlines WHERE id = 2`),
          connection.query(`SELECT * FROM FormulaProductionLines WHERE productionline_id = 2`),
        ])
          .then((results) => {
            const [line, formulaLine] = results;
            assert.strictEqual(line[0].isactive, null, 'Line no longer active');
            assert.strictEqual(formulaLine.length, 0, 'Only one formula mapped to line');
            done();
          })
          .catch((e) => console.log(e));
      });
    });

    it('should not delete busy production line', (done) => {
      chai.request(server)
      .delete('/productionlines')
      .set('Authorization', `Token ${testTokens.adminTestToken}`)
      .send({
        'lines': [1],
      })
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
    });

    it('should reject delete for manager', (done) => {
      chai.request(server)
      .delete('/productionlines')
      .set('Authorization', `Token ${testTokens.managerTestToken}`)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
    });

    it('should reject delete for noob', (done) => {
      chai.request(server)
      .delete('/productionlines')
      .set('Authorization', `Token ${testTokens.noobTestToken}`)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
    });
  });
});

describe('#completeProductionOnLine()', () => {
  beforeEach(() => {
    return dbSetup.setupTestDatabase();
  });

  it('should complete production on a busy line with final product', (done) => {
    chai.request(server)
      .post('/productionlines/complete')
      .set('Authorization', `Token ${testTokens.managerTestToken}`)
      .send({
        'productionline_id': 1,
      })
      .end((err, res) => {
        res.should.have.status(200);
        Promise.all([
          connection.query(`SELECT * FROM ProductionlinesOccupancies WHERE productionline_id = 1 and busy = 1`),
          connection.query('SELECT * FROM FinalProductInventories'),
        ])
          .then((results) => {
            const [productLinesOccupancies, finalProductInventories] = results;
            assert.strictEqual(productLinesOccupancies.length, 0, 'Production line id 1 is not busy');

            const newFinalProductInventory = finalProductInventories[finalProductInventories.length - 1];
            assert.strictEqual(newFinalProductInventory.productrun_id, 1, 'Product run ID is 1');
            assert.strictEqual(newFinalProductInventory.formula_id, 1, 'Product run ID is 1');
            assert.strictEqual(newFinalProductInventory.num_packages, 100, 'Number of packages is 100');
            
            done();
          })
          .catch((e) => console.log(e));
      });
  });

  it('should complete production on a busy line with intermediate product', (done) => {
    chai.request(server)
      .post('/productionlines/complete')
      .set('Authorization', `Token ${testTokens.managerTestToken}`)
      .send({
        'productionline_id': 3,
      })
      .end((err, res) => {
        res.should.have.status(200);
        Promise.all([
          connection.query(`SELECT * FROM ProductionlinesOccupancies WHERE productionline_id = 3 and busy = 1`),
          connection.query('SELECT * FROM Inventories WHERE id = 4 AND arrived = 1'),
        ])
          .then((results) => {
            const [productLinesOccupancies, finalProductInventories] = results;
            assert.strictEqual(productLinesOccupancies.length, 0, 'Production line id 2 is not busy');
            assert.strictEqual(finalProductInventories.length, 1, 'Intermediate inventory item has arrived');
            done();
          })
          .catch((e) => console.log(e));
      });
  });

  it('should fail production on a non-busy line', (done) => {
    chai.request(server)
      .post('/productionlines/complete')
      .set('Authorization', `Token ${testTokens.managerTestToken}`)
      .send({
        'productionline_id': 2,
      })
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });
});
