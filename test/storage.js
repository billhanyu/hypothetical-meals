const dbSetup = require('./common/dbSetup');
const assert = require('chai').assert;
const testTokens = require('./common/testTokens');

describe('Storage', () => {
  describe('#view()', () => {
    it('should return all storages with used capacity', (done) => {
      chai.request(server)
        .get('/storages')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(3);
          const storages = res.body;
          assert.strictEqual(storages[0].used, 50, 'storage 1 used');
          assert.strictEqual(storages[1].used, 10, 'storage 2 used');
          assert.strictEqual(storages[2].used, 0, 'storage 3 used');
          done();
        });
    });
  });

  describe('#changeStorage()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });

    it('should fail change storage as noob', (done) => {
      chai.request(server)
        .put('/storages')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({
          '1': 100000,
        })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should change storage capacity', (done) => {
      chai.request(server)
        .put('/storages')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          '1': 1800,
        })
        .end((err, res) => {
          res.should.have.status(200);
          connection.query('SELECT capacity FROM Storages WHERE id = 1')
          .then((newCapacity) => {
            assert.strictEqual(newCapacity[0].capacity, 1800, 'New storage capacity');
            done();
          })
          .catch((error) => console.log(error));
        });
    });

    it('should ignore truckload or railcar', (done) => {
      connection.query(`INSERT INTO Ingredients (id, name, package_type, storage_id, native_unit, num_native_units)
        VALUES (7, 'truckload', 'truckload', 1, 'kg', 10),
        (8, 'railcar', 'railcar', 1, 'kg', 10)`)
        .then(() => {
          return connection.query('INSERT INTO Inventories (ingredient_id, num_packages, lot, vendor_id) VALUES (7, 999999, \'ff\', 1), (8, 999999, \'ff\', 1)');
        })
        .then(() => {
          chai.request(server)
          .put('/storages')
          .set('Authorization', `Token ${testTokens.adminTestToken}`)
          .send({
            '1': 10000,
          })
          .end((err, res) => {
            res.should.have.status(200);
            connection.query('SELECT capacity FROM Storages WHERE id = 1')
            .then((newCapacity) => {
              assert.strictEqual(newCapacity[0].capacity, 10000, 'New storage capacity');
              done();
            })
            .catch((error) => console.log(error));
          });
        })
        .catch((error) => console.log(error));
    });

    it('should not change storage capacity if new capacity too small', (done) => {
      chai.request(server)
        .put('/storages')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          '1': 1,
        })
        .end((err, res) => {
          res.should.have.status(400);
          connection.query('SELECT capacity FROM Storages WHERE id = 1')
          .then((newCapacity) => {
            assert.strictEqual(newCapacity[0].capacity, 2000, 'old storage capacity');
            done();
          })
          .catch((error) => console.log(error));
        });
    });

    it('should reject invalid storage id', (done) => {
      chai.request(server)
        .put('/storages')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          '1a': 19,
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject storage id not in storages table', (done) => {
      chai.request(server)
        .put('/storages')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          '4': 100000,
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject invalid storage capacity', (done) => {
      chai.request(server)
        .put('/storages')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          '1': 'woefjweo',
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject multiple inputs', (done) => {
      chai.request(server)
        .put('/storages')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          '1': 100000,
          '2': 900000,
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });
});
