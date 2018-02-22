import server from '../server/server';

const alasql = require('alasql');
const assert = require('chai').assert;
const testTokens = require('./testTokens');
const supertest = require('supertest');

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

  describe('#view()', () => {
    beforeEach(() => {
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
    });

    it('should return all ingredients', (done) => {
      chai.request(server)
        .get('/ingredients/page/1')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(4);
          done();
        });
    });

    it('should only return one page of ingredients', (done) => {
      for (let i = 0; i < 52; i++) {
        alasql(`INSERT INTO Ingredients (name, package_type, native_unit, num_native_units, storage_id) VALUES ('${i}', 'sack', 'pounds', 1.1, 1)`);
      }

      chai.request(server)
        .get('/ingredients/page/1')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(50);
          done();
        });
    });
  });

  describe('#addIngredient()', () => {
    beforeEach(() => {
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
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

    it('should add a new ingredient', (done) => {
      chai.request(server)
      .post('/ingredients')
      .set('Authorization', `Token ${testTokens.adminTestToken}`)
      .send({
        'ingredients': [
          {
            'name': 'turkey',
            'package_type': 'sail',
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
        const changed = alasql('SELECT * FROM Ingredients');
        assert.strictEqual(changed[4]['name'], 'turkey', 'Name for ingredient 4.');
        assert.strictEqual(changed[4]['package_type'], 'sail', 'Package type ingredient 4.');
        assert.strictEqual(changed[4]['native_unit'], 'kg', 'Native Unit for ingredient 4.');
        assert.strictEqual(changed[4]['storage_id'], 1, 'Storage id for ingredient 4.');
        assert.strictEqual(changed[4]['num_native_units'], 10, 'Size for ingredient 4.');
        assert.strictEqual(changed[5]['name'], 'rice', 'Name for ingredient 5.');
        assert.strictEqual(changed[5]['package_type'], 'truckload', 'Package type ingredient 5.');
        assert.strictEqual(changed[5]['native_unit'], 'g', 'Native Unit for ingredient 5.');
        assert.strictEqual(changed[5]['storage_id'], 1, 'Storage id for ingredient 5.');
        assert.strictEqual(changed[5]['num_native_units'], 15, 'Size for ingredient 5.');
        done();
      });
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
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
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
      const ingredients = alasql('SELECT * FROM Ingredients');
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
        const changed = alasql('SELECT * FROM Ingredients');
        assert.strictEqual(changed[0]['name'], 'poop', 'Name for ingredient 1.');
        assert.strictEqual(changed[0]['storage_id'], 2, 'Storage id for ingredient 1.');
        assert.strictEqual(changed[2]['name'], 'boop', 'Name for ingredient 3.');
        assert.strictEqual(changed[2]['storage_id'], 2, 'Storage id for ingredient 3.');
        done();
      });
    });

    it('should modify the name or package type of the ingredient', (done) => {
      const ingredients = alasql('SELECT * FROM Ingredients');
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
        const changed = alasql('SELECT * FROM Ingredients');
        assert.strictEqual(changed[0]['name'], 'meow', 'Name for ingredient 1.');
        assert.strictEqual(changed[0]['storage_id'], 1, 'Storage id for ingredient 1.');
        assert.strictEqual(changed[2]['name'], 'boop', 'Name for ingredient 3.');
        assert.strictEqual(changed[2]['package_type'], 'railcar', 'Package type for ingredient 3.');
        done();
      });
    });

    it('should modify the storage id, name, package_type, native unit and num_native_units of the ingredient', (done) => {
      const ingredients = alasql('SELECT * FROM Ingredients');
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
        const changed = alasql('SELECT * FROM Ingredients');
        assert.strictEqual(changed[0]['name'], 'meow', 'Name for ingredient 1.');
        assert.strictEqual(changed[0]['storage_id'], 2, 'Storage id for ingredient 1.');
        assert.strictEqual(changed[1]['id'], 2, 'id for ingredient 2.');
        assert.strictEqual(changed[1]['package_type'], 'supersack', 'package_type for ingredient 2.');
        assert.strictEqual(changed[1]['native_unit'], 'handful', 'Native unit for ingredient 2.');
        assert.strictEqual(changed[2]['name'], 'pleb', 'Name for ingredient 3.');
        assert.strictEqual(changed[2]['storage_id'], 2, 'Storage id for ingredient 3.');
        assert.strictEqual(changed[2]['num_native_units'], 100, 'Size for ingredient 3.');
        done();
      });
    });

    it('should decline if invalid storage id', (done) => {
      const ingredients = alasql('SELECT * FROM Ingredients');
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
    });

    it('should decline if ingredient not in table', (done) => {
      const ingredients = alasql('SELECT * FROM Ingredients');
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
    });
  });

  describe('#deleteIngredient()', () => {
    beforeEach(() => {
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
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

    it('should delete the ingredients with the ids given', (done) => {
      chai.request(server)
      .delete('/ingredients')
      .set('Authorization', `Token ${testTokens.adminTestToken}`)
      .send({
        'ingredients': [1, 2],
      })
      .end((err, res) => {
        res.should.have.status(200);
        const left = alasql('SELECT * FROM Ingredients');
        assert.strictEqual(left.length, 4, 'Rows in Ingredients table still the same.');
        assert.strictEqual(left[0]['removed'], 1, 'ingredient 1 fake deleted');
        assert.strictEqual(left[1]['removed'], 1, 'ingredient 2 fake deleted');
        assert.strictEqual(left[2]['removed'], 0, 'ingredient 3 not fake deleted');
        done();
      });
    });

    it('should delete corresponding vendorsingredients', (done) => {
      chai.request(server)
        .delete('/ingredients')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'ingredients': [1],
        })
        .end((err, res) => {
          res.should.have.status(200);
          const left = alasql('SELECT * FROM Ingredients');
          assert.strictEqual(left.length, 4, 'Rows in Ingredients table still the same.');
          assert.strictEqual(left[0]['removed'], 1, 'ingredient 1 fake deleted');
          assert.strictEqual(left[1]['removed'], 0, 'ingredient 2 not fake deleted');
          assert.strictEqual(left[2]['removed'], 0, 'ingredient 3 not fake deleted');
          done();
        });
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
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
    });

    it('should fail bulk import as noob', (done) => {
      chai.request(server)
        .post('/ingredients/import')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({})
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should fail data with bad amount (in lbs)', (done) => {
      supertest(server).post('/ingredients/import')
      .set('Authorization', `Token ${testTokens.adminTestToken}`)
      .attach('bulk', './test/bulk_import/badAmountData.csv')
      .end(function(err, res) {
        res.should.have.status(400);
        done();
      });
    });

    it('should fail data with bad price for ingredient', (done) => {
      supertest(server).post('/ingredients/import')
      .set('Authorization', `Token ${testTokens.adminTestToken}`)
      .attach('bulk', './test/bulk_import/badPriceArgumentData.csv')
      .end(function(err, res) {
        res.should.have.status(400);
        done();
      });
    });

    it('should fail data with extra argument for ingredient', (done) => {
      supertest(server).post('/ingredients/import')
      .set('Authorization', `Token ${testTokens.adminTestToken}`)
      .attach('bulk', './test/bulk_import/extraArgumentData.csv')
      .end(function(err, res) {
        res.should.have.status(400);
        done();
      });
    });

    it('should fail data with incorrect package type for ingredient', (done) => {
      supertest(server).post('/ingredients/import')
      .set('Authorization', `Token ${testTokens.adminTestToken}`)
      .attach('bulk', './test/bulk_import/incorrectPackageTypeData.csv')
      .end(function(err, res) {
        res.should.have.status(400);
        done();
      });
    });

    it('should fail data with incorrect storage type for ingredient', (done) => {
      supertest(server).post('/ingredients/import')
      .set('Authorization', `Token ${testTokens.adminTestToken}`)
      .attach('bulk', './test/bulk_import/incorrectStorageTypeData.csv')
      .end(function(err, res) {
        res.should.have.status(400);
        done();
      });
    });

    it('should fail data with invalid header data', (done) => {
      supertest(server).post('/ingredients/import')
      .set('Authorization', `Token ${testTokens.adminTestToken}`)
      .attach('bulk', './test/bulk_import/invalidHeaderData.csv')
      .end(function(err, res) {
        res.should.have.status(400);
        done();
      });
    });

    it('should fail data with missing argument for ingredient', (done) => {
      supertest(server).post('/ingredients/import')
      .set('Authorization', `Token ${testTokens.adminTestToken}`)
      .attach('bulk', './test/bulk_import/missingArgumentData.csv')
      .end(function(err, res) {
        res.should.have.status(400);
        done();
      });
    });

    it('should pass valid data', (done) => {
      alasql('UPDATE Storages SET capacity = 1000000');
      supertest(server).post('/ingredients/import')
      .set('Authorization', `Token ${testTokens.adminTestToken}`)
      .attach('bulk', './test/bulk_import/validData.csv')
      .end(function(err, res) {
        // console.log(res.text);
        res.should.have.status(200);


        const ingredients = alasql(`SELECT * FROM Ingredients`);
        console.log(ingredients);
        assert.strictEqual(ingredients.length, 4 + 5, 'Five of six ingredients added to ingredients table.');

        const vendorsIngredients = alasql(`SELECT * FROM VendorsIngredients`);
        assert.strictEqual(vendorsIngredients.length, 4 + 5, 'Five of six vendor ingredients added to vendor ingredients table.');

        const newVendorIngredient = vendorsIngredients.find(vendorsIngredient => vendorsIngredient.ingredient_id == 8 && vendorsIngredient.price == 32.1 && vendorsIngredient.vendor_id == 1);
        assert.notEqual(newVendorIngredient, null, 'Potatoes-drum ingredient added exactly once with correct price, vendor, and package type');
        newVendorIngredient.should.not.be.a('array');

        res.should.have.status(200);
        done();
      });
    });
  });
});
