import server from '../server/server';

const alasql = require('alasql');
const assert = require('chai').assert;
const testTokens = require('./testTokens');

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
    it('should return all ingredients', (done) => {
      chai.request(server)
        .get('/ingredients/page/1')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(3);
          done();
        });
    });
  });

  describe('#viewAvailable()', () => {
    it('should return all ingredients available', (done) => {
      alasql('UPDATE Ingredients SET removed = 1 WHERE id = 1');
      chai.request(server)
        .get('/ingredients-available/page/1')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(2);
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
            'name': 'flour',
            'storage_id': 1,
          },
          {
            'name': 'rice',
            'storage_id': 1,
          },
        ],
      })
      .end((err, res) => {
        res.should.have.status(200);
        const changed = alasql('SELECT * FROM Ingredients');
        assert.strictEqual(changed[3]['name'], 'flour', 'Name for ingredient 4.');
        assert.strictEqual(changed[3]['storage_id'], 1, 'Storage id for ingredient 4.');
        assert.strictEqual(changed[4]['name'], 'rice', 'Name for ingredient 5.');
        assert.strictEqual(changed[4]['storage_id'], 1, 'Storage id for ingredient 5.');
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
      chai.request(server)
      .put('/ingredients')
      .set('Authorization', `Token ${testTokens.adminTestToken}`)
      .send({
        'ingredients': {
          '1': '2',
          '3': '2',
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

    it('should decline if invalid storage id', (done) => {
      chai.request(server)
        .put('/ingredients')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'ingredients': {
            '3': '2',
            '1': '928',
          },
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should decline if ingredient not in table', (done) => {
      chai.request(server)
        .put('/ingredients')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'ingredients': {
            '3': '2',
            '10': '1',
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
        assert.strictEqual(left.length, 3, 'Rows in Ingredients table still the same.');
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
          assert.strictEqual(left.length, 3, 'Rows in Ingredients table still the same.');
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
});
