describe('Storage', () => {
  describe('#view()', () => {
    it('should return all storages', (done) => {
      chai.request(server)
        .get('/storages')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(2);
          done();
        });
    });
  });
});
