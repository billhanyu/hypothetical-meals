const alasql = require('alasql');
const assert = require('chai').assert;
const testTokens = require('./testTokens');

describe('User', () => {

  describe('#getInfo()', () => {
    it('should get info for admin user', (done) => {
      chai.request(server)
        .get('/users/info')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          assert.strictEqual(res.body.name, 'mike wazowski', 'Name of user');
          assert.strictEqual(res.body.username, 'noob', 'Username of user');
          assert.strictEqual(res.body.userGroup, 'noob', 'User priviledge group');
          done();
        });
    });

    it('should get info for admin user', (done) => {
      chai.request(server)
        .get('/users/info')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          assert.strictEqual(res.body.name, 'mike krzyzewski', 'Name of user');
          assert.strictEqual(res.body.username, 'admin', 'Username of user');
          assert.strictEqual(res.body.userGroup, 'admin', 'User priviledge group');
          done();
        });
    });
  });

  describe('#modifyUsers()', () => {
    beforeEach(() => {
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
    });

    it('should add admin user', (done) => {
      chai.request(server)
        .post('/users/admin')
        .send({
          'user': {
            'username': 'admin1',
            'name': 'mike wazowski',
            'password': 'mike mike mike',
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          const users = alasql(`SELECT * FROM Users WHERE username = 'admin1'`);
          assert.strictEqual(users.length, 1, 'Number of rows with username.');
          const newAdmin = users[0];
          assert.strictEqual(newAdmin.id, 5, 'New admin ID.');
          assert.strictEqual(newAdmin.username, 'admin1', 'New admin username.');
          assert.strictEqual(newAdmin.name, 'mike wazowski', 'New admin name.');
          assert.strictEqual(newAdmin.user_group, 'admin', 'New admin user group.');
          done();
        });
    });

    it('should fail noob user creation as noob', (done) => {
      chai.request(server)
        .post('/users/noob')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({
          'user': {
            'username': 'noob1',
            'name': 'mike wazowski',
            'password': 'mike mike mike',
          },
        })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should add noob user as admin', (done) => {
      chai.request(server)
        .post('/users/noob')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'user': {
            'username': 'noob1',
            'name': 'mike wazowski',
            'password': 'mike mike mike',
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          const users = alasql(`SELECT * FROM Users WHERE username = 'noob1'`);
          assert.strictEqual(users.length, 1, 'Number of rows with username.');
          const newNoob = users[0];
          assert.strictEqual(newNoob.id, 5, 'New noob ID.');
          assert.strictEqual(newNoob.username, 'noob1', 'New noob username.');
          assert.strictEqual(newNoob.name, 'mike wazowski', 'New noob name.');
          assert.strictEqual(newNoob.user_group, 'noob', 'New noob user group.');
          done();
        });
    });
  });

  describe('#login()', () => {
    it('should retrieve admin user info with login credentials', (done) => {
      chai.request(server)
        .post('/users/login')
        .send({
          'user': {
            'username': 'admin',
            'password': 'mike mike mike',
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          assert.strictEqual(res.body.user.name, 'mike krzyzewski', 'Returned user ID.');
          assert.strictEqual(res.body.user.username, 'admin', 'Returned user ID.');
          assert(res.body.user.token != null && res.body.user.token.length != 0, 'New admin JSON web token.');
          done();
        });
    });

    it('should retrieve noob user info with login credentials', (done) => {
      chai.request(server)
        .post('/users/login')
        .send({
          'user': {
            'username': 'noob',
            'password': 'mike mike mike',
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          assert.strictEqual(res.body.user.name, 'mike wazowski', 'Returned user ID.');
          assert.strictEqual(res.body.user.username, 'noob', 'Returned user ID.');
          assert(res.body.user.token != null && res.body.user.token.length != 0, 'New admin JSON web token.');
          done();
        });
    });
  });
});
