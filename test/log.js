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
});
