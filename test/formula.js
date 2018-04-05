import server from '../server/server';

const assert = require('chai').assert;
const testTokens = require('./common/testTokens');
const supertest = require('supertest');
const dbSetup = require('./common/dbSetup');

describe('Formulas', () => {
  describe('#pages()', () => {
    it('should return number of pages of data', (done) => {
      chai.request(server)
        .get('/formulas/pages')
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
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });

    it('should return all formulas', (done) => {
      chai.request(server)
        .get('/formulas/page/1')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(4);
          done();
        });
    });

    it('should only return one page of formulas', (done) => {
      const formulas = [];
      for (let i = 0; i < 52; i++) {
        formulas.push([`bleh${i}`, 'bleh', 15]);
      }
      connection.query(`INSERT INTO Formulas (name, description, num_product) VALUES ?`, [formulas])
      .then(() => {
        chai.request(server)
        .get('/formulas/page/1')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(50);
          done();
        });
      })
      .catch((error) => console.log(error));
    });
  });

  describe('#viewAll()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });

    it('should return all formulas', (done) => {
      connection.query(`SELECT COUNT(1) FROM Formulas`)
      .then((formulaResult) => {
        const numFormulas = formulaResult[0]['COUNT(1)'];
        chai.request(server)
          .get('/formulas')
          .set('Authorization', `Token ${testTokens.managerTestToken}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            const formulas = res.body;
            assert.strictEqual(formulas.length, numFormulas, 'Number of formulas in database');
            assert.strictEqual(formulas[0].id, 1, 'Id of formula 1');
            assert.strictEqual(formulas[0].name, 'cake', 'Name of formula 1');
            assert.strictEqual(formulas[0].intermediate, 0, 'Intermediate status');
            assert.strictEqual(formulas[0].description, 'A simple cake', 'Description for cake');
            assert.strictEqual(formulas[0].num_product, 1, 'Number of product produced by formula');
            const ingredient = formulas[0]['ingredients']['boop'];
            assert.strictEqual(Object.keys(ingredient).length, 11, 'Properties in ingredient');
            assert.strictEqual(ingredient['ingredient_id'], 3, 'Id of ingredient in formula');
            assert.strictEqual(ingredient['num_native_units'], 1, 'Number of native units of boop');
            assert.strictEqual(ingredient['native_unit'], 'kg', 'Native unit of boop');
            assert.strictEqual(ingredient['formula_id'], 1, 'Formula id boop is part of');
            assert.strictEqual(ingredient['storage_id'], 1, 'Storage id of boop');
            assert.strictEqual(ingredient['removed'], 0, 'Removal status of boop');
            done();
          });
      })
      .catch((error) => console.log(error));
    });

    it('should let noobs view', (done) => {
      chai.request(server)
        .get('/formulas')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('#add()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });

    it('should add two formulas to the database', (done) => {
      connection.query(`SELECT COUNT(1) FROM Formulas`)
      .then((formulaResult) => {
        const numFormulas = formulaResult[0]['COUNT(1)'];
        chai.request(server)
          .post('/formulas')
          .set('Authorization', `Token ${testTokens.adminTestToken}`)
          .send({
            'formulas': [
              {
                'name': 'blob',
                'description': 'A blob',
                'num_product': 1,
                'intermediate': 0,
                'ingredients': [
                  {
                    'ingredient_id': 1,
                    'num_native_units': 2,
                  },
                ],
              },
              {
                'name': 'Bill',
                'description': 'Fried up Bill',
                'num_product': 1,
                'intermediate': 0,
                'ingredients': [
                  {
                    'ingredient_id': 1,
                    'num_native_units': 0.5,
                  },
                  {
                    'ingredient_id': 2,
                    'num_native_units': 2,
                  },
                ],
              },
            ],
          })
          .end((err, res) => {
            res.should.have.status(200);
            connection.query(`SELECT * FROM Formulas WHERE removed = 0`)
            .then((formulas) => {
              assert.strictEqual(formulas.length, numFormulas+2, 'Number of formulas in database');
              const lastIndex = formulas.length-1;
              assert.strictEqual(formulas[lastIndex].name, 'Bill', 'Name for formula 3');
              assert.strictEqual(formulas[lastIndex].description, 'Fried up Bill', 'Description for formula 3');
              assert.strictEqual(formulas[lastIndex].num_product, 1, 'Number of products for formula 3');
              assert.strictEqual(formulas[lastIndex].intermediate, 0, 'Intermediate status of formula 3');
              return connection.query(`SELECT * FROM FormulaEntries WHERE formula_id = ?`, [formulas[lastIndex].id]);
            })
            .then((formulaIngredients) => {
              assert.strictEqual(formulaIngredients.length, 2, 'Number of ingredients in formula 3');
              assert.strictEqual(formulaIngredients[0].ingredient_id, 1, 'First ingredient id in formula 3');
              assert.strictEqual(formulaIngredients[0].num_native_units, 0.5, 'First ingredient native units formula 3');
              done();
            })
            .catch((error) => console.log(error));
          });
      })
      .catch((error) => console.log(error));
    });

    it('should add request for intermediate product formula', (done) => {
      chai.request(server)
        .post('/formulas')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'formulas': [
            {
              'name': 'blob',
              'description': 'A blob',
              'num_product': 1,
              'intermediate': 1,
              'ingredient_name': 'blob',
              'package_type': 'pail',
              'storage_id': 1,
              'native_unit': 'kg',
              'num_native_units': 10,
              'ingredients': [
                {
                  'ingredient_id': 1,
                  'num_native_units': 2,
                },
              ],
            },
          ],
        })
        .end((err, res) => {
          res.should.have.status(200);

          Promise.all([
            connection.query('SELECT * FROM Formulas WHERE removed = 0'),
            connection.query('SELECT * FROM Ingredients WHERE removed = 0'),
          ])
          .then((results) => {
            const [formulas, ingredients] = results;
            const lastFormulaIndex = formulas.length - 1;
            assert.strictEqual(formulas[lastFormulaIndex].name, 'blob', 'Name for formula');
            assert.strictEqual(formulas[lastFormulaIndex].description, 'A blob', 'Description for formula');
            assert.strictEqual(formulas[lastFormulaIndex].num_product, 1, 'Number of products for formula');
            assert.strictEqual(formulas[lastFormulaIndex].intermediate, 1, 'Intermediate status of formula');

            const lastIngredientIndex = ingredients.length - 1;
            assert.strictEqual(ingredients[lastIngredientIndex].name, 'blob', 'Name for intermediate');
            assert.strictEqual(ingredients[lastIngredientIndex].package_type, 'pail', 'Package type of intermediate');
            assert.strictEqual(ingredients[lastIngredientIndex].storage_id, 1, 'Intermediate storage id');
            assert.strictEqual(ingredients[lastIngredientIndex].native_unit, 'kg', 'Intermediate native unit');
            assert.strictEqual(ingredients[lastIngredientIndex].num_native_units, 10, 'Intermediate num_native_units');
            done();
          })
          .catch((error) => console.log(error));
        });
    });

    it('should add request for intermediate product formula and a normal formula', (done) => {
      chai.request(server)
      .post('/formulas')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'formulas': [
            {
              'name': 'Bill',
              'description': 'Fried up Bill',
              'num_product': 1,
              'intermediate': 0,
              'ingredients': [
                {
                  'ingredient_id': 1,
                  'num_native_units': 0.5,
                },
                {
                  'ingredient_id': 2,
                  'num_native_units': 2,
                },
              ],
            },
            {
              'name': 'blob',
              'description': 'A blob',
              'num_product': 1,
              'intermediate': 1,
              'ingredient_name': 'blob',
              'package_type': 'pail',
              'storage_id': 1,
              'native_unit': 'kg',
              'num_native_units': 10,
              'ingredients': [
                {
                  'ingredient_id': 1,
                  'num_native_units': 2,
                },
              ],
            },
          ],
        })
        .end((err, res) => {
          res.should.have.status(200);
          Promise.all([
            connection.query('SELECT * FROM Formulas WHERE removed = 0'),
            connection.query('SELECT * FROM Ingredients WHERE removed = 0'),
          ])
          .then((results) => {
            const [formulas, ingredients] = results;
            const lastFormulaIndex = formulas.length - 1;
            assert.strictEqual(formulas[lastFormulaIndex].name, 'blob', 'Name for formula');
            assert.strictEqual(formulas[lastFormulaIndex].description, 'A blob', 'Description for formula');
            assert.strictEqual(formulas[lastFormulaIndex].num_product, 1, 'Number of products for formula');
            assert.strictEqual(formulas[lastFormulaIndex].intermediate, 1, 'Intermediate status of formula');

            const lastIngredientIndex = ingredients.length - 1;
            assert.strictEqual(ingredients[lastIngredientIndex].name, 'blob', 'Name for intermediate');
            assert.strictEqual(ingredients[lastIngredientIndex].package_type, 'pail', 'Package type of intermediate');
            assert.strictEqual(ingredients[lastIngredientIndex].storage_id, 1, 'Intermediate storage id');
            assert.strictEqual(ingredients[lastIngredientIndex].native_unit, 'kg', 'Intermediate native unit');
            assert.strictEqual(ingredients[lastIngredientIndex].num_native_units, 10, 'Intermediate num_native_units');

            assert.strictEqual(formulas[lastFormulaIndex-1].name, 'Bill', 'Name for formula 3');
            assert.strictEqual(formulas[lastFormulaIndex-1].description, 'Fried up Bill', 'Description for formula 3');
            assert.strictEqual(formulas[lastFormulaIndex-1].num_product, 1, 'Number of products for formula 3');
            assert.strictEqual(formulas[lastFormulaIndex-1].intermediate, 0, 'Intermediate status of formula 3');
            return connection.query(`SELECT * FROM FormulaEntries WHERE formula_id = ?`, [formulas[lastFormulaIndex-1].id]);
          })
          .then((formulaIngredients) => {
            assert.strictEqual(formulaIngredients.length, 2, 'Number of ingredients in formula 3');
            assert.strictEqual(formulaIngredients[0].ingredient_id, 1, 'First ingredient id in formula 3');
            assert.strictEqual(formulaIngredients[0].num_native_units, 0.5, 'First ingredient native units formula 3');
            done();
          })
          .catch((error) => console.log(error));
        });
    });

    it('should reject an add request from a noob', (done) => {
      chai.request(server)
        .post('/formulas')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({
          'formulas': [
            {
              'name': 'blob',
              'description': 'A blob',
              'num_product': 1,
              'ingredients': [
                {
                  'ingredient_id': 1,
                  'num_native_units': 2,
                },
              ],
            },
          ],
        })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should reject an add request from a manager', (done) => {
      chai.request(server)
        .post('/formulas')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .send({
          'formulas': [
            {
              'name': 'blob',
              'description': 'A blob',
              'num_product': 1,
              'ingredients': [
                {
                  'ingredient_id': 1,
                  'num_native_units': 2,
                },
              ],
            },
          ],
        })
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

    it('should modify two of the formulas in the database', (done) => {
      chai.request(server)
        .put('/formulas')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'formulas': [
            {
              'id': 1,
              'name': 'cake',
              'description': 'A blob',
              'num_product': 1,
              'ingredients': [
                {
                  'ingredient_id': 1,
                  'num_native_units': 2,
                },
              ],
            },
            {
              'id': 2,
              'name': 'Bill',
              'description': 'Chinaman',
              'num_product': 1,
              'ingredients': [
                {
                  'ingredient_id': 1,
                  'num_native_units': 10,
                },
                {
                  'ingredient_id': 2,
                  'num_native_units': 2,
                },
              ],
            },
          ],
        })
        .end((err, res) => {
          res.should.have.status(200);
          connection.query(`SELECT * FROM Formulas WHERE removed = 0`)
          .then((formulas) => {
            assert.strictEqual(formulas.length, 4, 'Number of formulas in database');
            assert.strictEqual(formulas[0].name, 'cake', 'Name for formula 1');
            assert.strictEqual(formulas[0].description, 'A blob', 'Description for formula 3');
            assert.strictEqual(formulas[0].num_product, 1, 'Number of products for formula 3');
            assert.strictEqual(formulas[1].name, 'Bill', 'Name for formula 1');
            assert.strictEqual(formulas[1].description, 'Chinaman', 'Description for formula 3');
            assert.strictEqual(formulas[1].num_product, 1, 'Number of products for formula 3');
            return Promise.all([
              connection.query(`SELECT * FROM FormulaEntries WHERE formula_id = ?`, [formulas[0].id]),
              connection.query(`SELECT * FROM FormulaEntries WHERE formula_id = ?`, [formulas[1].id]),
            ]);
          })
          .then((results) => {
            const [formulaIngredients1, formulaIngredients2] = results;
            assert.strictEqual(formulaIngredients1.length, 1, 'Number of ingredients in formula 3');
            assert.strictEqual(formulaIngredients1[0].ingredient_id, 1, 'Ingredient id in formula 1');
            assert.strictEqual(formulaIngredients1[0].num_native_units, 2, 'Ingredient native units formula 1');

            assert.strictEqual(formulaIngredients2.length, 2, 'Number of ingredients in formula 2');
            assert.strictEqual(formulaIngredients2[0].ingredient_id, 1, 'Ingredient id in formula 2');
            assert.strictEqual(formulaIngredients2[0].num_native_units, 10, 'Ingredient native units formula 2');
            assert.strictEqual(formulaIngredients2[1].ingredient_id, 2, 'Ingredient id in formula 2');
            assert.strictEqual(formulaIngredients2[1].num_native_units, 2, 'Ingredient native units formula 2');
            done();
          })
          .catch((error) => console.log(error));
        });
    });

    it('should modify one normal formula and one intermediate formula', (done) => {
      chai.request(server)
        .put('/formulas')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'formulas': [
            {
              'id': 1,
              'name': 'cake',
              'description': 'A blob',
              'num_product': 1,
              'ingredients': [
                {
                  'ingredient_id': 1,
                  'num_native_units': 2,
                },
              ],
            },
            {
              'id': 2,
              'name': 'Bill',
              'description': 'Chinaman',
              'num_product': 1,
              'ingredients': [
                {
                  'ingredient_id': 1,
                  'num_native_units': 10,
                },
                {
                  'ingredient_id': 2,
                  'num_native_units': 2,
                },
              ],
            },
          ],
        })
        .end((err, res) => {
          res.should.have.status(200);

          connection.query(`SELECT * FROM Formulas WHERE removed = 0`)
          .then((formulas) => {
            assert.strictEqual(formulas.length, 4, 'Number of formulas in database');
            assert.strictEqual(formulas[0].name, 'cake', 'Name for formula 1');
            assert.strictEqual(formulas[0].description, 'A blob', 'Description for formula 3');
            assert.strictEqual(formulas[0].num_product, 1, 'Number of products for formula 3');
            assert.strictEqual(formulas[1].name, 'Bill', 'Name for formula 1');
            assert.strictEqual(formulas[1].description, 'Chinaman', 'Description for formula 3');
            assert.strictEqual(formulas[1].num_product, 1, 'Number of products for formula 3');
            return Promise.all([
              connection.query(`SELECT * FROM FormulaEntries WHERE formula_id = ?`, [formulas[0].id]),
              connection.query(`SELECT * FROM FormulaEntries WHERE formula_id = ?`, [formulas[1].id]),
            ]);
          })
          .then((results) => {
            const [formulaIngredients1, formulaIngredients2] = results;
            assert.strictEqual(formulaIngredients1.length, 1, 'Number of ingredients in formula 3');
            assert.strictEqual(formulaIngredients1[0].ingredient_id, 1, 'Ingredient id in formula 1');
            assert.strictEqual(formulaIngredients1[0].num_native_units, 2, 'Ingredient native units formula 1');

            assert.strictEqual(formulaIngredients2.length, 2, 'Number of ingredients in formula 2');
            assert.strictEqual(formulaIngredients2[0].ingredient_id, 1, 'Ingredient id in formula 2');
            assert.strictEqual(formulaIngredients2[0].num_native_units, 10, 'Ingredient native units formula 2');
            assert.strictEqual(formulaIngredients2[1].ingredient_id, 2, 'Ingredient id in formula 2');
            assert.strictEqual(formulaIngredients2[1].num_native_units, 2, 'Ingredient native units formula 2');
            done();
          })
          .catch((error) => console.log(error));
        });
    });

    it('should modify even if some formula parameters not present', (done) => {
      chai.request(server)
        .put('/formulas')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'formulas': [
            {
              'id': 1,
              'name': 'yellow cake',
              'num_product': 1,
              'ingredients': [
                {
                  'ingredient_id': 1,
                  'num_native_units': 2,
                },
              ],
            },
            {
              'id': 2,
              'description': 'same as the name',
              'ingredients': [
                {
                  'ingredient_id': 1,
                  'num_native_units': 10,
                },
                {
                  'ingredient_id': 2,
                  'num_native_units': 2,
                },
              ],
            },
          ],
        })
        .end((err, res) => {
          res.should.have.status(200);

          connection.query(`SELECT * FROM Formulas WHERE removed = 0`)
          .then((formulas) => {
            assert.strictEqual(formulas.length, 4, 'Number of formulas in database');
            assert.strictEqual(formulas[0].name, 'yellow cake', 'Name for formula 1');
            assert.strictEqual(formulas[0].description, 'A simple cake', 'Description for formula 3');
            assert.strictEqual(formulas[0].num_product, 1, 'Number of products for formula 3');
            assert.strictEqual(formulas[1].name, 'shit', 'Name for formula 1');
            assert.strictEqual(formulas[1].description, 'same as the name', 'Description for formula 3');
            assert.strictEqual(formulas[1].num_product, 10, 'Number of products for formula 3');
            return Promise.all([
              connection.query(`SELECT * FROM FormulaEntries WHERE formula_id = ?`, [formulas[0].id]),
              connection.query(`SELECT * FROM FormulaEntries WHERE formula_id = ?`, [formulas[1].id]),
            ]);
          })
          .then((results) => {
            const [formulaIngredients1, formulaIngredients2] = results;
            assert.strictEqual(formulaIngredients1.length, 1, 'Number of ingredients in formula 3');
            assert.strictEqual(formulaIngredients1[0].ingredient_id, 1, 'Ingredient id in formula 1');
            assert.strictEqual(formulaIngredients1[0].num_native_units, 2, 'Ingredient native units formula 1');
            assert.strictEqual(formulaIngredients2.length, 2, 'Number of ingredients in formula 2');
            assert.strictEqual(formulaIngredients2[0].ingredient_id, 1, 'Ingredient id in formula 2');
            assert.strictEqual(formulaIngredients2[0].num_native_units, 10, 'Ingredient native units formula 2');
            assert.strictEqual(formulaIngredients2[1].ingredient_id, 2, 'Ingredient id in formula 2');
            assert.strictEqual(formulaIngredients2[1].num_native_units, 2, 'Ingredient native units formula 2');
            done();
          })
          .catch((error) => console.log(error));
        });
    });

    it('should modify an intermediate formula correctly', (done) => {
      connection.query(`SELECT COUNT(1) FROM Formulas`)
      .then((formulaResult) => {
      const numFormulas = formulaResult[0]['COUNT(1)'];
      const intermediateId = 6;
      chai.request(server)
        .put('/formulas')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'formulas': [
            {
              'id': 3,
              'name': 'bleb',
              'num_product': 1,
              'intermediate': 1,
              'intermediate_properties': {
                'id': intermediateId,
                'package_type': 'railcar',
              },
              'ingredients': [
                {
                  'ingredient_id': 1,
                  'num_native_units': 2,
                },
              ],
            },
          ],
        })
        .end((err, res) => {
          res.should.have.status(200);

          connection.query(`SELECT * FROM Formulas WHERE removed = 0`)
          .then((formulas) => {
            assert.strictEqual(formulas.length, numFormulas, 'Number of formulas in database');
            assert.strictEqual(formulas[2].name, 'bleb', 'Name for formula 1');
            assert.strictEqual(formulas[2].description, 'hehe', 'Description for formula 3');
            assert.strictEqual(formulas[2].num_product, 1, 'Number of products for formula 3');
            return Promise.all([
              connection.query(`SELECT * FROM FormulaEntries WHERE formula_id = ?`, [formulas[2].id]),
              connection.query(`SELECT * FROM Ingredients WHERE id = ?`, [intermediateId]),
            ]);
          })
          .then((results) => {
            const [formulaIngredients1, intermediateIngredient] = results;
            assert.strictEqual(formulaIngredients1.length, 1, 'Number of ingredients in formula 3');
            assert.strictEqual(formulaIngredients1[0].ingredient_id, 1, 'Ingredient id in formula 1');
            assert.strictEqual(formulaIngredients1[0].num_native_units, 2, 'Ingredient native units formula 1');

            assert.strictEqual(intermediateIngredient[0].name, 'booploop meow', 'Name of intermediate ingredient');
            assert.strictEqual(intermediateIngredient[0].package_type, 'railcar', 'Modified package type for intermediate product');
            assert.strictEqual(intermediateIngredient[0].storage_id, 2, 'Storage id for intermediate product');
            assert.strictEqual(intermediateIngredient[0].native_unit, 'kg', 'Native unit for intermediate product');
            assert.strictEqual(intermediateIngredient[0].num_native_units, 30, 'Num native units for intermediate produt');
            done();
          })
          .catch((error) => console.log(error));
        });
      })
      .catch((error) => console.log(error));
    });

    it('should reject modify if trying to modify nonexistent formula', (done) => {
      chai.request(server)
        .put('/formulas')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'formulas': [
            {
              'id': 123,
              'name': 'cake',
              'description': 'A blob',
              'num_product': 1,
              'ingredients': [
                {
                  'ingredient_id': 1,
                  'num_native_units': 2,
                },
              ],
            },
          ],
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject modify if ids for formula not specified', (done) => {
      chai.request(server)
        .put('/formulas')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'formulas': [
            {
              'name': 'cake',
              'description': 'A blob',
              'num_product': 1,
              'ingredients': [
                {
                  'ingredient_id': 1,
                  'num_native_units': 2,
                },
              ],
            },
          ],
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject modify if not all ingredient parameters present', (done) => {
      chai.request(server)
        .put('/formulas')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'formulas': [
            {
              'name': 'cake',
              'description': 'A blob',
              'num_product': 1,
              'ingredients': [
                {
                  'num_native_units': 2,
                },
              ],
            },
          ],
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject modify if noob request', (done) => {
      chai.request(server)
        .put('/formulas')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({
          'formulas': [
            {
              'id': 1,
              'name': 'cake',
              'description': 'A blob',
              'num_product': 1,
              'ingredients': [
                {
                  'ingredient_id': 1,
                  'num_native_units': 2,
                },
              ],
            },
          ],
        })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should reject modify if manager request', (done) => {
      chai.request(server)
        .put('/formulas')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .send({
          'formulas': [
            {
              'id': 1,
              'name': 'cake',
              'description': 'A blob',
              'num_product': 1,
              'ingredients': [
                {
                  'ingredient_id': 1,
                  'num_native_units': 2,
                },
              ],
            },
          ],
        })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('#deleteFormulas()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });

    it('should fake delete two formulas', (done) => {
      chai.request(server)
        .delete('/formulas')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .set('formulaid', '1, 2')
        .end((err, res) => {
          res.should.have.status(200);

          Promise.all([
            connection.query(`SELECT * FROM Formulas`),
            connection.query(`SELECT * FROM Formulas WHERE removed = 1`),
            connection.query(`SELECT * FROM FormulaEntries`),
          ])
          .then((results) => {
            const [formulas, formulasRemoved, formulaEntries] = results;
            assert.strictEqual(formulasRemoved.length, 2, 'Should have marked as removed');
            assert.strictEqual(formulas.length, 4, 'Should have not actually removed all formulas');
            assert.strictEqual(formulas[0].removed, 1, 'Formula 1 marked at removed');
            assert.strictEqual(formulas[1].removed, 1, 'Formula 2 marked as removed');
            assert.strictEqual(formulaEntries.length, 4, 'Should have deleted all formula entries');
            done();
          })
          .catch((error) => console.log(error));
        });
    });

    it('should fake delete one formula', (done) => {
      chai.request(server)
        .delete('/formulas')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .set('formulaid', '1')
        .end((err, res) => {
          res.should.have.status(200);

          Promise.all([
            connection.query(`SELECT * FROM Formulas`),
            connection.query(`SELECT * FROM Formulas WHERE id = 1`),
            connection.query(`SELECT * FROM FormulaEntries`),
          ])
          .then((results) => {
            const [formulas, formula1, formulaEntries] = results;
            assert.strictEqual(formulas.length, 4, 'Should have fake deleted one formula');
            assert.strictEqual(formula1[0].removed, 1, 'Formula 1 marked as removed');
            assert.strictEqual(formulaEntries.length, 6, 'Should have deleted all formula entries');
            formulaEntries.forEach(element => {
              assert.notEqual(element.formula_id, 1, 'Should not be equal to deleted formula id');
            });
            done();
          })
          .catch((error) => console.log(error));
        });
    });

    it('should reject delete for invalid formula id', (done) => {
      chai.request(server)
        .delete('/formulas')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .set('formulaid', '112')
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject delete for manager', (done) => {
      chai.request(server)
        .delete('/formulas')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .set('formulaid', '2')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should reject delete for noob', (done) => {
      chai.request(server)
        .delete('/formulas')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .set('formulaid', '2')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('#bulkImport()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });

    it('should fail bulk import as noob', (done) => {
      supertest(server).post('/formulas/import/final')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .attach('bulk', './test/bulk_import/formulas/validData.csv')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should fail data with bad ingredient units', (done) => {
      supertest(server).post('/formulas/import/final')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .attach('bulk', './test/bulk_import/formulas/badIngredientUnitsData.csv')
        .end(function(err, res) {
          res.should.have.status(400);
          done();
        });
    });

    it('should fail data with bad product units', (done) => {
      supertest(server).post('/formulas/import/final')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .attach('bulk', './test/bulk_import/formulas/badProductUnitsData.csv')
        .end(function(err, res) {
          res.should.have.status(400);
          done();
        });
    });

    it('should fail data with extra argument for formula', (done) => {
      supertest(server).post('/formulas/import/final')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .attach('bulk', './test/bulk_import/formulas/extraArgumentData.csv')
        .end(function(err, res) {
          res.should.have.status(400);
          done();
        });
    });

    it('should fail data with invalid header data', (done) => {
      supertest(server).post('/formulas/import/final')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .attach('bulk', './test/bulk_import/formulas/invalidHeaderData.csv')
        .end(function(err, res) {
          res.should.have.status(400);
          done();
        });
    });

    it('should fail data with missing argument for formula', (done) => {
      supertest(server).post('/formulas/import/final')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .attach('bulk', './test/bulk_import/formulas/missingArgumentData.csv')
        .end(function(err, res) {
          res.should.have.status(400);
          done();
        });
    });

    it('should fail data with nonconsecutive formula entries', (done) => {
      supertest(server).post('/formulas/import/final')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .attach('bulk', './test/bulk_import/formulas/notConsecutiveFormulaEntriesData.csv')
        .end(function(err, res) {
          res.should.have.status(400);
          done();
        });
    });

    it('should fail data with duplicate formula entries as database', (done) => {
      supertest(server).post('/formulas/import/final')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .attach('bulk', './test/bulk_import/formulas/duplicateFormulaData.csv')
        .end(function(err, res) {
          res.should.have.status(400);
          done();
        });
    });

    it('should fail data with with missing ingredients in database', (done) => {
      supertest(server).post('/formulas/import/final')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .attach('bulk', './test/bulk_import/formulas/missingIngredientsData.csv')
        .end(function(err, res) {
          res.should.have.status(400);
          done();
        });
    });

    it('should pass valid data', (done) => {
      Promise.all([
        connection.query(`SELECT COUNT(1) FROM Formulas`),
        connection.query(`SELECT COUNT(1) FROM FormulaEntries`),
        connection.query('UPDATE Storages SET capacity = 1000000'),
      ])
      .then((results) => {
        const [formulaResult, formulaEntryResult] = results;
        const numFormulas = formulaResult[0]['COUNT(1)'];
        const numFormulaEntries = formulaEntryResult[0]['COUNT(1)'];
        supertest(server).post('/formulas/import/final/')
          .set('Authorization', `Token ${testTokens.adminTestToken}`)
          .attach('bulk', './test/bulk_import/formulas/validData.csv')
          .end(function(err, res) {
            res.should.have.status(200);

            Promise.all([
              connection.query(`SELECT * FROM Formulas`),
              connection.query(`SELECT * FROM FormulaEntries`),
            ])
            .then((results) => {
              const [formulas, formulaEntries] = results;
              assert.strictEqual(formulas.length, numFormulas + 2, 'Two formulas added to formulas table.');
              const chocolateCake = formulas[numFormulas];
              assert.strictEqual(chocolateCake.name, 'Chocolate Cake', 'Name of chocolate cake');
              assert.strictEqual(chocolateCake.description, 'This is a chocolate cake', 'Description of chocolate cake');
              assert.strictEqual(chocolateCake.num_product, 1, 'Amount of chocolate cake');
              assert.strictEqual(chocolateCake.removed, 0, 'Removed status of chocolate cake');
              const soup = formulas[numFormulas + 1];
              assert.strictEqual(soup.name, 'Soup', 'Name of soup');
              assert.strictEqual(soup.description, 'This is soup', 'Description of soup');
              assert.strictEqual(soup.num_product, 2, 'Amount of soup');
              assert.strictEqual(soup.removed, 0, 'Removed status of soup');

              assert.strictEqual(formulaEntries.length, numFormulaEntries + 5, 'Five formula entries added to formula entries table.');
              assert.strictEqual(formulaEntries[numFormulaEntries].ingredient_id, 1, 'Ingredient ID is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries].num_native_units, 2, 'Number of native units is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries].formula_id, numFormulas + 1, 'Formula ID is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries+1].ingredient_id, 2, 'Ingredient ID is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries+1].num_native_units, 1, 'Number of native units is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries+1].formula_id, numFormulas + 1, 'Formula ID is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries+2].ingredient_id, 3, 'Ingredient ID is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries+2].num_native_units, 400, 'Number of native units is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries+2].formula_id, numFormulas + 1, 'Formula ID is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries+3].ingredient_id, 4, 'Ingredient ID is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries+3].num_native_units, 4, 'Number of native units is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries+3].formula_id, numFormulas + 2, 'Formula ID is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries+4].ingredient_id, 1, 'Ingredient ID is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries+4].num_native_units, 1, 'Number of native units is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries+4].formula_id, numFormulas + 2, 'Formula ID is correct');
              done();
            })
            .catch((error) => console.log(error));
          });
      })
      .catch((error) => console.log(error));
    });

    it('should pass valid intermediate data', (done) => {
      Promise.all([
        connection.query(`SELECT COUNT(1) FROM Ingredients`),
        connection.query(`SELECT COUNT(1) FROM Formulas`),
        connection.query(`SELECT COUNT(1) FROM FormulaEntries`),
        connection.query('UPDATE Storages SET capacity = 1000000'),
      ])
      .then((results) => {
        const [ingredientResult, formulaResult, formulaEntryResult] = results;
        const numIngredients = ingredientResult[0]['COUNT(1)'];
        const numFormulas = formulaResult[0]['COUNT(1)'];
        const numFormulaEntries = formulaEntryResult[0]['COUNT(1)'];
        supertest(server).post('/formulas/import/intermediate/')
          .set('Authorization', `Token ${testTokens.adminTestToken}`)
          .attach('bulk', './test/bulk_import/formulas/validIntermediateData.csv')
          .end(function(err, res) {
            res.should.have.status(200);

            Promise.all([
              connection.query(`SELECT * FROM Ingredients`),
              connection.query(`SELECT * FROM Formulas`),
              connection.query(`SELECT * FROM FormulaEntries`),
            ])
            .then((results) => {
              const [ingredients, formulas, formulaEntries] = results;

              assert.strictEqual(formulas.length, numFormulas + 3, 'Three formulas added to formulas table.');
              let refinedOil = formulas[numFormulas];
              assert.strictEqual(refinedOil.name, 'Refined Oil', 'Name of refined oil');
              assert.strictEqual(refinedOil.description, 'better oil ', 'Description of refined oil');
              assert.strictEqual(refinedOil.num_product, 15, 'Amount of refined oil');
              assert.strictEqual(refinedOil.removed, 0, 'Removed status of refined oil');
              const seasoning = formulas[numFormulas + 1];
              assert.strictEqual(seasoning.name, 'Seasoning', 'Name of seasoning');
              assert.strictEqual(seasoning.description, 'extraordinary taste', 'Description of seasoning');
              assert.strictEqual(seasoning.num_product, 5, 'Amount of seasoning');
              assert.strictEqual(seasoning.removed, 0, 'Removed status of seasoning');
              const sugarCoating = formulas[numFormulas + 2];
              assert.strictEqual(sugarCoating.name, 'Sugar Coating', 'Name of sugar coating');
              assert.strictEqual(sugarCoating.description, 'improves taste and look', 'Description of sugar coating');
              assert.strictEqual(sugarCoating.num_product, 7, 'Amount of sugar coating');
              assert.strictEqual(sugarCoating.removed, 0, 'Removed status of sugar coating');

              assert.strictEqual(ingredients.length, numIngredients + 3, 'Three ingredients added to ingredients table.');
              refinedOil = ingredients[numIngredients];
              assert.strictEqual(refinedOil.name, 'Refined Oil', 'Name of refined oil');
              assert.strictEqual(refinedOil.package_type, 'drum', 'Package type of refined oil');
              assert.strictEqual(refinedOil.storage_id, 3, 'Storage type of refined oil is warehouse');
              assert.strictEqual(refinedOil.native_unit, 'gallons', 'Native units of refined oil');
              assert.strictEqual(refinedOil.num_native_units, 18, 'Number of native units of refined oil');
              assert.strictEqual(refinedOil.intermediate, 1, 'Intermediate status of refined oil');
              assert.strictEqual(refinedOil.removed, 0, 'Removed status of refined oil');

              assert.strictEqual(formulaEntries.length, numFormulaEntries + 5, 'Five formula entries added to formula entries table.');
              assert.strictEqual(formulaEntries[numFormulaEntries].ingredient_id, 1, 'Ingredient ID is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries].num_native_units, 20, 'Number of native units is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries].formula_id, numFormulas + 1, 'Formula ID is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries+1].ingredient_id, 2, 'Ingredient ID is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries+1].num_native_units, 16, 'Number of native units is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries+1].formula_id, numFormulas + 2, 'Formula ID is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries+2].ingredient_id, 3, 'Ingredient ID is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries+2].num_native_units, 11, 'Number of native units is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries+2].formula_id, numFormulas + 2, 'Formula ID is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries+3].ingredient_id, 4, 'Ingredient ID is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries+3].num_native_units, 5, 'Number of native units is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries+3].formula_id, numFormulas + 3, 'Formula ID is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries+4].ingredient_id, 1, 'Ingredient ID is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries+4].num_native_units, 28, 'Number of native units is correct');
              assert.strictEqual(formulaEntries[numFormulaEntries+4].formula_id, numFormulas + 3, 'Formula ID is correct');
              done();
            })
            .catch((error) => console.log(error));
          });
      })
      .catch((error) => console.log(error));
    });
  });
});
