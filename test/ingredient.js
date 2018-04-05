import server from '../server/server';

const assert = require('chai').assert;
const testTokens = require('./common/testTokens');
const supertest = require('supertest');
const dbSetup = require('./common/dbSetup');

describe('Ingredient', () => {
  describe('#pages()', () => {
    it('should return number of pages of data', (done) => {
      chai.request(server)
        .get('/ingredients/pages')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          assert.strictEqual(res.body['numPages'], 1, 'number of pages');
          done();
        });
    });
  });

  describe('#viewWithId()', () => {
    it('should return ingredient with id', (done) => {
      chai.request(server)
        .get('/ingredients/id/1')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          assert.strictEqual(res.body.name, 'poop', 'ingredient 1 name');
          done();
        });
    });
  });

  describe('#viewAll()', () => {
    it('should return all ingredients', (done) => {
      connection.query(`SELECT COUNT(1) FROM Ingredients`)
      .then((IngredientResult) => {
        const numIngredients = IngredientResult[0]['COUNT(1)'];
        chai.request(server)
          .get('/ingredients')
          .set('Authorization', `Token ${testTokens.noobTestToken}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            assert.strictEqual(res.body.length, numIngredients, 'total number of ingredients');
            done();
          });
      })
      .catch((error) => console.log(error));
    });
  });

  describe('#view()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });

    it('should return all ingredients', (done) => {
      connection.query(`SELECT COUNT(1) FROM Ingredients`)
      .then((IngredientResult) => {
        const numIngredients = IngredientResult[0]['COUNT(1)'];
        chai.request(server)
        .get('/ingredients/page/1')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(numIngredients);
          done();
        });
      })
      .catch((error) => console.log(error));
    });

    it('should only return one page of ingredients', (done) => {
      const ingredientsToAdd = [];
      for (let i = 0; i < 52; i++) {
        ingredientsToAdd.push([`${i}`, 'sack', 'pounds', 1.1, 1]);
      }
      connection.query(`INSERT INTO Ingredients (name, package_type, native_unit, num_native_units, storage_id) VALUES ?`, [ingredientsToAdd])
      .then(() => {
        chai.request(server)
        .get('/ingredients/page/1')
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

  describe('#addIngredient()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });

    it('should fail add ingredient as noob', (done) => {
      chai.request(server)
        .post('/ingredients')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({})
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should add new ingredients', (done) => {
      connection.query(`SELECT COUNT(1) FROM Ingredients`)
      .then((IngredientResult) => {
        const numIngredients = IngredientResult[0]['COUNT(1)'];
        chai.request(server)
        .post('/ingredients')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'ingredients': [
            {
              'name': 'turkey',
              'package_type': 'pail',
              'native_unit': 'kg',
              'storage_id': 1,
              'num_native_units': 10,
            },
            {
              'name': 'rice',
              'package_type': 'truckload',
              'native_unit': 'g',
              'storage_id': 1,
              'num_native_units': 15,
            },
          ],
        })
        .end((err, res) => {
          res.should.have.status(200);
          assert.strictEqual(res.body.length, 2, 'return added ids');
          connection.query('SELECT * FROM Ingredients')
            .then((changed) => {
              assert.strictEqual(changed[numIngredients]['name'], 'turkey', 'Name for ingredient 4.');
              assert.strictEqual(changed[numIngredients]['package_type'], 'pail', 'Package type ingredient 4.');
              assert.strictEqual(changed[numIngredients]['native_unit'], 'kg', 'Native Unit for ingredient 4.');
              assert.strictEqual(changed[numIngredients]['storage_id'], 1, 'Storage id for ingredient 4.');
              assert.strictEqual(changed[numIngredients]['num_native_units'], 10, 'Size for ingredient 4.');
              assert.strictEqual(changed[numIngredients+1]['name'], 'rice', 'Name for ingredient 5.');
              assert.strictEqual(changed[numIngredients+1]['package_type'], 'truckload', 'Package type ingredient 5.');
              assert.strictEqual(changed[numIngredients+1]['native_unit'], 'g', 'Native Unit for ingredient 5.');
              assert.strictEqual(changed[numIngredients+1]['storage_id'], 1, 'Storage id for ingredient 5.');
              assert.strictEqual(changed[numIngredients+1]['num_native_units'], 15, 'Size for ingredient 5.');
              done();
            })
            .catch((error) => console.log(error));
        });
      })
      .catch((error) => console.log(error));
    });

    it('should decline if request body empty', (done) => {
      chai.request(server)
        .post('/ingredients')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'ingredients': [],
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });

  describe('#modifyIngredient()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });

    it('should fail modify ingredient as noob', (done) => {
      chai.request(server)
        .put('/ingredients')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({})
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should modify the storage id of the ingredient', (done) => {
      connection.query('SELECT * FROM Ingredients')
      .then((ingredients) => {
        ingredients[0].storage_id = 2;
        ingredients[2].storage_id = 2;
        chai.request(server)
        .put('/ingredients')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'ingredients': {
            '1': ingredients[0],
            '3': ingredients[2],
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          connection.query('SELECT * FROM Ingredients')
            .then((changed) => {
              assert.strictEqual(changed[0]['name'], 'poop', 'Name for ingredient 1.');
              assert.strictEqual(changed[0]['storage_id'], 2, 'Storage id for ingredient 1.');
              assert.strictEqual(changed[2]['name'], 'boop', 'Name for ingredient 3.');
              assert.strictEqual(changed[2]['storage_id'], 2, 'Storage id for ingredient 3.');
              done();
            })
            .catch((error) => console.log(error));
        });
      })
      .catch((error) => console.log(error));
    });

    it('should modify the name or package type of the ingredient', (done) => {
      connection.query('SELECT * FROM Ingredients')
      .then((ingredients) => {
        ingredients[0].name = 'meow';
        ingredients[2].package_type = 'railcar';
        chai.request(server)
        .put('/ingredients')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'ingredients': {
            '1': ingredients[0],
            '3': ingredients[2],
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          connection.query('SELECT * FROM Ingredients')
          .then((changed) => {
            assert.strictEqual(changed[0]['name'], 'meow', 'Name for ingredient 1.');
            assert.strictEqual(changed[0]['storage_id'], 1, 'Storage id for ingredient 1.');
            assert.strictEqual(changed[2]['name'], 'boop', 'Name for ingredient 3.');
            assert.strictEqual(changed[2]['package_type'], 'railcar', 'Package type for ingredient 3.');
            done();
          })
          .catch((error) => console.log(error));
        });
      })
      .catch((error) => console.log(error));
    });

    it('should modify the storage id, name, package_type, native unit and num_native_units of the ingredient', (done) => {
      connection.query('SELECT * FROM Ingredients')
      .then((ingredients) => {
        ingredients[0].name = 'meow';
        ingredients[0].storage_id = '2';
        ingredients[1].package_type = 'supersack';
        ingredients[1].native_unit = 'handful';
        ingredients[2].name = 'pleb';
        ingredients[2].storage_id = '2';
        ingredients[2].num_native_units = 100;
        chai.request(server)
        .put('/ingredients')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'ingredients': {
            '1': ingredients[0],
            '2': ingredients[1],
            '3': ingredients[2],
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          connection.query('SELECT * FROM Ingredients')
          .then((changed) => {
            assert.strictEqual(changed[0]['name'], 'meow', 'Name for ingredient 1.');
            assert.strictEqual(changed[0]['storage_id'], 2, 'Storage id for ingredient 1.');
            assert.strictEqual(changed[1]['id'], 2, 'id for ingredient 2.');
            assert.strictEqual(changed[1]['package_type'], 'supersack', 'package_type for ingredient 2.');
            assert.strictEqual(changed[1]['native_unit'], 'handful', 'Native unit for ingredient 2.');
            assert.strictEqual(changed[2]['name'], 'pleb', 'Name for ingredient 3.');
            assert.strictEqual(changed[2]['storage_id'], 2, 'Storage id for ingredient 3.');
            assert.strictEqual(changed[2]['num_native_units'], 100, 'Size for ingredient 3.');
            done();
          })
          .catch((error) => console.log(error));
        });
      })
      .catch((error) => console.log(error));
    });

    it('should decline if invalid storage id', (done) => {
      connection.query('SELECT * FROM Ingredients')
        .then((ingredients) => {
          ingredients[2].storage_id = 2;
          ingredients[0].storage_id = 928;
          chai.request(server)
            .put('/ingredients')
            .set('Authorization', `Token ${testTokens.adminTestToken}`)
            .send({
              'ingredients': {
                '3': ingredients[2],
                '1': ingredients[0],
              },
            })
            .end((err, res) => {
              res.should.have.status(400);
              done();
            });
        })
        .catch((error) => console.log(error));
    });

    it('should decline if ingredient not in table', (done) => {
      connection.query('SELECT * FROM Ingredients')
      .then((ingredients) => {
        chai.request(server)
        .put('/ingredients')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'ingredients': {
            '3': ingredients[2],
            '10': ingredients[2],
          },
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
      })
      .catch((error) => console.log(error));
    });
  });

  describe('#deleteIngredient()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });

    it('should fail delete ingredient as noob', (done) => {
      chai.request(server)
        .delete('/ingredients')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({})
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should delete the ingredients when no formula uses ingredient', (done) => {
      connection.query('UPDATE Formulas SET removed = 1 WHERE id = 2')
      .then(() => connection.query(`SELECT COUNT(1) FROM Ingredients`))
      .then((IngredientResult) => {
        const numIngredients = IngredientResult[0]['COUNT(1)'];
        chai.request(server)
        .delete('/ingredients')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'ingredients': [2, 5],
        })
        .end((err, res) => {
          res.should.have.status(200);
          connection.query('SELECT * FROM Ingredients')
          .then((left) => {
          assert.strictEqual(left.length, numIngredients, 'Rows in Ingredients table still the same.');
          assert.strictEqual(left[1]['removed'], 1, 'ingredient 2 fake deleted');
          assert.strictEqual(left[4]['removed'], 1, 'ingredient 5 fake deleted');
          assert.strictEqual(left[2]['removed'], 0, 'ingredient 3 not fake deleted');
          done();
          })
          .catch((error) => console.log(error));
        });
      })
      .catch((error) => console.log(error));
    });

    it('should fail to delete the ingredients when formula uses ingedient', (done) => {
      chai.request(server)
      .delete('/ingredients')
      .set('Authorization', `Token ${testTokens.adminTestToken}`)
      .send({
        'ingredients': [1, 3],
      })
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
    });

    it('should delete corresponding vendorsingredients', (done) => {
      connection.query('UPDATE Formulas SET removed = 1 WHERE id = 2')
      .then(() => connection.query(`SELECT COUNT(1) FROM Ingredients`))
      .then((IngredientResult) => {
        const numIngredients = IngredientResult[0]['COUNT(1)'];
        chai.request(server)
          .delete('/ingredients')
          .set('Authorization', `Token ${testTokens.adminTestToken}`)
          .send({
            'ingredients': [2],
          })
          .end((err, res) => {
            res.should.have.status(200);
            connection.query('SELECT * FROM Ingredients')
            .then((left) => {
              assert.strictEqual(left.length, numIngredients, 'Rows in Ingredients table still the same.');
              assert.strictEqual(left[0]['removed'], 0, 'ingredient 1 not fake deleted');
              assert.strictEqual(left[1]['removed'], 1, 'ingredient 2 fake deleted');
              assert.strictEqual(left[2]['removed'], 0, 'ingredient 3 not fake deleted');
              done();
            })
            .catch((error) => console.log(error));
          });
      })
      .catch((error) => console.log(error));
    });

    it('should decline if ingredient not in table', (done) => {
      chai.request(server)
        .delete('/ingredients')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'ingredients': [1, 10],
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });

  describe('#bulkImport()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });

    it('should fail bulk import as noob', (done) => {
      supertest(server).post('/ingredients/import')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .attach('bulk', './test/bulk_import/ingredients/validData.csv')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should fail data with bad amount (in lbs)', (done) => {
      supertest(server).post('/ingredients/import')
      .set('Authorization', `Token ${testTokens.adminTestToken}`)
      .attach('bulk', './test/bulk_import/ingredients/badAmountData.csv')
      .end(function(err, res) {
        res.should.have.status(400);
        done();
      });
    });

    it('should fail data with bad price for ingredient', (done) => {
      supertest(server).post('/ingredients/import')
      .set('Authorization', `Token ${testTokens.adminTestToken}`)
      .attach('bulk', './test/bulk_import/ingredients/badPriceArgumentData.csv')
      .end(function(err, res) {
        res.should.have.status(400);
        done();
      });
    });

    it('should fail data with extra argument for ingredient', (done) => {
      supertest(server).post('/ingredients/import')
      .set('Authorization', `Token ${testTokens.adminTestToken}`)
      .attach('bulk', './test/bulk_import/ingredients/extraArgumentData.csv')
      .end(function(err, res) {
        res.should.have.status(400);
        done();
      });
    });

    it('should fail data with incorrect package type for ingredient', (done) => {
      supertest(server).post('/ingredients/import')
      .set('Authorization', `Token ${testTokens.adminTestToken}`)
      .attach('bulk', './test/bulk_import/ingredients/incorrectPackageTypeData.csv')
      .end(function(err, res) {
        res.should.have.status(400);
        done();
      });
    });

    it('should fail data with incorrect storage type for ingredient', (done) => {
      supertest(server).post('/ingredients/import')
      .set('Authorization', `Token ${testTokens.adminTestToken}`)
      .attach('bulk', './test/bulk_import/ingredients/incorrectStorageTypeData.csv')
      .end(function(err, res) {
        res.should.have.status(400);
        done();
      });
    });

    it('should fail data with invalid header data', (done) => {
      supertest(server).post('/ingredients/import')
      .set('Authorization', `Token ${testTokens.adminTestToken}`)
      .attach('bulk', './test/bulk_import/ingredients/invalidHeaderData.csv')
      .end(function(err, res) {
        res.should.have.status(400);
        done();
      });
    });

    it('should fail data with missing argument for ingredient', (done) => {
      supertest(server).post('/ingredients/import')
      .set('Authorization', `Token ${testTokens.adminTestToken}`)
      .attach('bulk', './test/bulk_import/ingredients/missingArgumentData.csv')
      .end(function(err, res) {
        res.should.have.status(400);
        done();
      });
    });

    it('should pass valid data', (done) => {
      // const IngredientResult = alasql(`SELECT COUNT(1) FROM Ingredients`);
      // const numIngredients = IngredientResult[0]['COUNT(1)'];
      // const vendorsIngredientResult = alasql(`SELECT COUNT(1) FROM VendorsIngredients`);
      // const numVendorIngredients = vendorsIngredientResult[0]['COUNT(1)'];
      // alasql('UPDATE Storages SET capacity = 1000000');
      supertest(server).post('/ingredients/import')
      .set('Authorization', `Token ${testTokens.adminTestToken}`)
      .attach('bulk', './test/bulk_import/ingredients/validData.csv')
      .end(function(err, res) {
        res.should.have.status(200);

        // const ingredients = alasql(`SELECT * FROM Ingredients`);
        // assert.strictEqual(ingredients.length, numIngredients + 6, 'Six of six ingredients added to ingredients table.');

        // // const vendorsIngredients = alasql(`SELECT * FROM VendorsIngredients`);
        // assert.strictEqual(vendorsIngredients.length, numVendorIngredients + 6, 'Six of six vendor ingredients added to vendor ingredients table.');

        // const newVendorIngredient = vendorsIngredients.find(vendorsIngredient => vendorsIngredient.ingredient_id == 9 && vendorsIngredient.price == 32.1 && vendorsIngredient.vendor_id == 1);
        // assert.notEqual(newVendorIngredient, null, 'Potatoes-drum ingredient added exactly once with correct price, vendor, and package type');
        // newVendorIngredient.should.not.be.a('array');

        // res.should.have.status(200);
        done();
      });
    });
  });

  describe('#freshness()', () => {
    it('should successfully return freshness', (done) => {
      chai.request(server)
        .get('/ingredients/freshness')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          const response = res.body;

          assert.containsAllKeys(response, ['freshnessData', 'ingredients']);

          assert.strictEqual(response.freshnessData.worstDuration, '1 days, 10 hours, 17 minutes, 36 seconds', 'Correct worst duration');
          assert.strictEqual(response.freshnessData.averageDuration, '0 days, 16 hours, 20 minutes, 41 seconds', 'Correct average duration');
          assert.strictEqual(response.ingredients[0].worstDuration, '1 days, 10 hours, 17 minutes, 36 seconds', 'Correct worst duration for ingredient id 1');
          assert.strictEqual(response.ingredients[0].averageDuration, '1 days, 3 hours, 46 minutes, 40 seconds', 'Correct average duration for ingredient id 1');
          assert.isNull(response.ingredients[1].worstDuration, 'Ingredient id 2 worst duration is null');
          assert.isNull(response.ingredients[1].averageDuration, 'Ingredient id 2 average duration is null');
          assert.strictEqual(response.ingredients[2].worstDuration, '0 days, 0 hours, 2 minutes, 3 seconds', 'Correct worst duration for ingredient id 3');
          assert.strictEqual(response.ingredients[2].averageDuration, '0 days, 0 hours, 0 minutes, 42 seconds', 'Correct average duration for ingredient id 3');
          done();
        });
    });
  });
});
