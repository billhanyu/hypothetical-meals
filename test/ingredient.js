import server from '../server/server';

const alasql = require('alasql');
const assert = require('chai').assert;

describe('Ingredient', () => {
  describe('#view()', () => {
    it('should return all ingredients', (done) => {
      chai.request(server)
        .get('/ingredients')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(3);
          done();
        });
    });
  });

  describe('#addIngredient()', () => {
    beforeEach(() => {
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
    });

    it('should add a new ingredient', (done) => {
      chai.request(server)
      .post('/ingredients')
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

    it('should modify the storage id of the ingredient', (done) => {
      chai.request(server)
      .put('/ingredients')
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

    it('should delete the the ingredients with the ids given', (done) => {
      chai.request(server)
      .delete('/ingredients')
      .send({
        'ingredients': [1, 2],
      })
      .end((err, res) => {
        res.should.have.status(200);
        const changed = alasql('SELECT * FROM Ingredients');
        assert.strictEqual(changed.length, 1, 'Rows in Ingredients table.');
        assert.strictEqual(changed[0]['name'], 'boop', 'Name for ingredient left in table.');
        assert.strictEqual(changed[0]['storage_id'], 1, 'Storage id for ingredient left in table.');
        done();
      });
    });

    it('should decline if ingredient not in table', (done) => {
      chai.request(server)
        .delete('/ingredients')
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
