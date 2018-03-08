const alasql = require('alasql');
const assert = require('chai').assert;
const testTokens = require('./testTokens');

describe('User', () => {
  describe('#loginOauth()', () => {
    beforeEach(() => {
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
    });

    it('should deny invalid input object', (done) => {
      chai.request(server)
        .post('/users/login/oauth')
        .send({
          'content': {
            'netid': 'hy103',
            'name': 'Bill Yu',
          },
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should deny invalid input object info', (done) => {
      chai.request(server)
        .post('/users/login/oauth')
        .send({
          'info': {
            'name': 'Bill Yu', // no netid
          },
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should add new netid users to table', (done) => {
      const oldLength = alasql('SELECT id FROM Users').length;
      chai.request(server)
        .post('/users/login/oauth')
        .send({
          'info': {
            'netid': 'hy103',
            'name': 'Bill Yu',
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          const newLength = alasql('SELECT id FROM Users').length;
          assert.strictEqual(oldLength + 1, newLength, 'Add new user to table');
          const addedUser = alasql('SELECT * FROM Users WHERE username = "hy103"');
          assert.strictEqual(addedUser[0].name, 'Bill Yu', 'Bill Yu registered to database');
          assert.strictEqual(addedUser[0].oauth, 1, 'User is oauth');
          assert.strictEqual(addedUser[0].user_group, 'noob', 'Default to noob user');
          done();
        });
    });

    it('should not add existing netid user to table', (done) => {
      const oldLength = alasql('SELECT id FROM Users').length;
      chai.request(server)
        .post('/users/login/oauth')
        .send({
          'info': {
            'netid': 'eri101',
            'name': 'Eric Song',
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          const newLength = alasql('SELECT id FROM Users').length;
          assert.strictEqual(oldLength, newLength, 'Eric existing, so no new user');
          done();
        });
    });

    it('should return info and token for oauth new user log in', (done) => {
      chai.request(server)
        .post('/users/login/oauth')
        .send({
          'info': {
            'netid': 'hy103',
            'name': 'Bill Yu',
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          const user = res.body.user;
          assert.strictEqual(user.name, 'Bill Yu', 'Return info name');
          assert.strictEqual(user.username, 'hy103', 'Return info username');
          assert.strictEqual(user.user_group, 'noob', 'Return info user_group');
          assert.strictEqual(user.oauth, 1, 'Return info oauth');
          assert(user.token && user.token.length > 0, 'Token generated for oauth new user');
          done();
        });
    });

    it('should return info and token for oauth old user log in', (done) => {
      chai.request(server)
        .post('/users/login/oauth')
        .send({
          'info': {
            'netid': 'eri101',
            'name': 'Eric Song',
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          const user = res.body.user;
          assert.strictEqual(user.name, 'Eric Song', 'Return info name');
          assert.strictEqual(user.username, 'eri101', 'Return info username');
          assert.strictEqual(user.user_group, 'noob', 'Return info user_group');
          assert.strictEqual(user.oauth, 1, 'Return info oauth');
          assert(user.token && user.token.length > 0, 'Token generated for oauth new user');
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
          assert.strictEqual(newAdmin.id, 7, 'New admin ID.');
          assert.strictEqual(newAdmin.username, 'admin1', 'New admin username.');
          assert.strictEqual(newAdmin.oauth, 0, 'Not OAuth user');
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
          assert.strictEqual(newNoob.id, 7, 'New noob ID.');
          assert.strictEqual(newNoob.username, 'noob1', 'New noob username.');
          assert.strictEqual(newNoob.oauth, 0, 'Not OAuth user');
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
            'password': 'a',
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
            'password': 'a',
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

  describe('#changePermission()', () => {
    it('should reject noob requests', (done) => {
      chai.request(server)
        .post('/users/permission')
        .send({
          'user': {
            'username': 'eri101',
            'oauth': 1,
            'permission': 'manager',
          },
        })
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should reject manager requests', (done) => {
      chai.request(server)
        .post('/users/permission')
        .send({
          'user': {
            'username': 'eri101',
            'oauth': 1,
            'permission': 'manager',
          },
        })
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should reject invalid request object', (done) => {
      chai.request(server)
        .post('/users/permission')
        .send({
          'info': {
            'username': 'eri101',
            'oauth': 1,
            'permission': 'manager',
          },
        })
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject incomplete properties', (done) => {
      chai.request(server)
        .post('/users/permission')
        .send({
          'user': {
            'username': 'eri101',
            'permission': 'manager',
          },
        })
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject nonexisting user', (done) => {
      chai.request(server)
        .post('/users/permission')
        .send({
          'user': {
            'username': 'clz4',
            'oauth': 0,
            'permission': 'manager',
          },
        })
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject invalid oauth value', (done) => {
      chai.request(server)
        .post('/users/permission')
        .send({
          'user': {
            'username': 'eri101',
            'oauth': 'true',
            'permission': 'manager',
          },
        })
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should reject invalid new permission', (done) => {
      chai.request(server)
        .post('/users/permission')
        .send({
          'user': {
            'username': 'eri101',
            'oauth': 1,
            'permission': 'fuck',
          },
        })
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should change permission for the user described', (done) => {
      chai.request(server)
        .post('/users/permission')
        .send({
          'user': {
            'username': 'eri101',
            'oauth': 1,
            'permission': 'manager',
          },
        })
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          const eric = alasql('SELECT * FROM Users WHERE username = "eri101" and oauth = 1')[0];
          assert.strictEqual(eric.user_group, 'manager', 'Eric should become a manager now.');
          done();
        });
    });
  });

  describe('#delete()', () => {
    beforeEach(() => {
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
    });

    it('User 4 is successfully deleted', () => {
      chai.request(server)
        .post('/users/delete')
        .send({
          'user': {
            'username': 'noob',
          },
        })
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          const user = alasql(`SELECT * FROM Users WHERE username = 'noob'`);
          assert.strictEqual(user.removed, 1, 'Is fake removed');
          done();
        });
    });

    it('Nonexistent user is unsuccessfully deleted', () => {
      chai.request(server)
        .post('/users/delete')
        .send({
          'user': {
            'username': 'foobar',
          },
        })
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });
});
