describe('Log', () => {
  describe('#view()', () => {
    it('should return all logs', (done) => {
      chai.request(server)
        .get('/logs')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(1);
          done();
        });
    });
  });
  
  describe('#viewLogForIngredient()', () => {
    beforeEach(() => {
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
    });

    it('should return all logs for a vendor ingredient', (done) => {
      chai.request(server)
      .get('/logs')
      .send({
        'vendor_ingredient_ids': [1],
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(1);
        done();
      });
    });
  });

  describe('#addEntry()', () => {
    beforeEach(() => {
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
    });

    it('should add an entry for a vendor ingredient', (done) => {
      chai.request(server)
      .put('/logs')
      .send({
        logs = {
          'user_id': 2,
          'vendor_ingredient_id': 2,
          'quantity': 10,
        },
      })
      .end((err, res) => {
        res.should.have.status(200);
        const changed = alasql('SELECT * FROM Inventories');
        assert.strictEqual(changed[0]['user_id'], 1, 'User id for log 1.');
        assert.strictEqual(changed[0]['vendor_ingredient_id'], 1, 'Vendor id for log 1.');
        assert.strictEqual(changed[0]['quantity'], 18, 'Quantity for log 1.')
        assert.strictEqual(changed[1]['user_id'], 2, 'User id for log 2.');
        assert.strictEqual(changed[1]['vendor_ingredient_id'], 2, 'Vendor id for log 2.');
        assert.strictEqual(changed[1]['quantity'], 10, 'Quantity for log 2.')
        done();
      });
    });
  });
});
