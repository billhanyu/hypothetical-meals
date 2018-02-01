const alasql = require('alasql');
const assert = require('chai').assert;
const testTokens = require('./testTokens');

describe('Storage', () => {
  describe('#view()', () => {
    it('should return all storages', (done) => {
      chai.request(server)
        .get('/storages')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(2);
          done();
        });
    });
  });

  describe('#changeStorage()', () => {
    beforeEach(() => {
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
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
          const newCapacity = alasql('SELECT capacity FROM Storages WHERE id = 1')[0].capacity;
          assert.strictEqual(newCapacity, 1800, 'New storage capacity');
          done();
        });
    });

    it('should ignore truckload or railcar', (done) => {
      alasql('INSERT INTO Inventories (ingredient_id, package_type, num_packages) VALUES (3, 2, \'truckload\', 2)');
      alasql('INSERT INTO Inventories (ingredient_id, package_type, num_packages) VALUES (3, 2, \'railcar\', 2)');
      chai.request(server)
        .put('/storages')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          '1': 1800,
        })
        .end((err, res) => {
          res.should.have.status(200);
          const newCapacity = alasql('SELECT capacity FROM Storages WHERE id = 1')[0].capacity;
          assert.strictEqual(newCapacity, 1800, 'New storage capacity');
          done();
        });
    });

    it('should not change storage capacity if new capacity too small', (done) => {
      chai.request(server)
        .put('/storages')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          '1': 1400,
        })
        .end((err, res) => {
          res.should.have.status(400);
          const newCapacity = alasql('SELECT capacity FROM Storages WHERE id = 1')[0].capacity;
          assert.strictEqual(newCapacity, 2000, 'old storage capacity');
          done();
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
          '3': 100000,
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
