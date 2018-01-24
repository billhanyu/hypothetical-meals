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
          '1': 100,
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
          '1': 100,
        })
        .end((err, res) => {
          res.should.have.status(200);
          const newCapacity = alasql('SELECT capacity FROM Storages WHERE id = 1')[0].capacity;
          assert.strictEqual(newCapacity, 100, 'New storage capacity');
          done();
        });
    });

    it('should not change storage capacity if new capacity too small', (done) => {
      chai.request(server)
        .put('/storages')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          '1': 19,
        })
        .end((err, res) => {
          res.should.have.status(400);
          const newCapacity = alasql('SELECT capacity FROM Storages WHERE id = 1')[0].capacity;
          assert.strictEqual(newCapacity, 20, 'old storage capacity');
          done();
        });
    });

    it('should not reject invalid storage id', (done) => {
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

    it('should not reject storage id not in storages table', (done) => {
      chai.request(server)
        .put('/storages')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          '3': 100,
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should not reject invalid storage capacity', (done) => {
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

    it('should not reject multiple inputs', (done) => {
      chai.request(server)
        .put('/storages')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          '1': 100,
          '2': 900,
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });
});
