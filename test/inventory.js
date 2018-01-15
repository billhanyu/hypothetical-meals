describe('Inventory', () => {
  describe('#view()', () => {
    it('should return inventory items', (done) => {
      chai.request(server)
        .get('/inventory')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(2);
          done();
        });
    });
  });
});
