const dbSetup = require('./common/dbSetup');
const assert = require('chai').assert;
const testTokens = require('./common/testTokens');

describe('User', () => {
  describe('#loginOauth()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
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
      connection.query('SELECT id FROM Users')
      .then((oldLength) => {
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
          Promise.all([
            connection.query('SELECT id FROM Users'),
            connection.query('SELECT * FROM Users WHERE username = "hy103"'),
          ])
          .then((results) => {
            const [newLength, addedUser] = results;
            assert.strictEqual(oldLength.length + 1, newLength.length, 'Add new user to table');

            assert.strictEqual(addedUser[0].name, 'Bill Yu', 'Bill Yu registered to database');
            assert.strictEqual(addedUser[0].oauth, 1, 'User is oauth');
            assert.strictEqual(addedUser[0].user_group, 'noob', 'Default to noob user');
            done();
          })
          .catch((error) => console.log(error));
        });
      })
      .catch((error) => console.log(error));
    });

    it('should add back removed netid users to table', (done) => {
      Promise.all([
        connection.query('INSERT INTO Users (username, name, oauth, removed) VALUES ("hy103", "Bill Yu", 0, 1)'),
        connection.query('INSERT INTO Users (username, name, oauth, user_group, removed) VALUES ("hy103", "Bill Yu", 1, "admin", 1)'),
      ])
      .then(() => {
        connection.query('SELECT id FROM Users')
          .then((oldLength) => {
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
                Promise.all([
                  connection.query('SELECT id FROM Users'),
                  connection.query('SELECT * FROM Users WHERE username = "hy103" and oauth = 0'),
                  connection.query('SELECT * FROM Users WHERE username = "hy103" and oauth = 1'),
                ])
                  .then((results) => {
                    const [newLength, regularUser, oauthUser] = results;
                    assert.strictEqual(oldLength.length, newLength.length, 'No new user to table');
                    assert.strictEqual(regularUser[0].name, 'Bill Yu', 'Bill Yu registered to database');
                    assert.strictEqual(regularUser[0].oauth, 0, 'User is not oauth');
                    assert.strictEqual(regularUser[0].user_group, 'noob', 'Default to noob user');
                    assert.strictEqual(regularUser[0].removed, 1, 'Regular user is not added back');

                    assert.strictEqual(oauthUser[0].name, 'Bill Yu', 'Bill Yu registered to database');
                    assert.strictEqual(oauthUser[0].oauth, 1, 'User is oauth');
                    assert.strictEqual(oauthUser[0].user_group, 'noob', 'Default to noob user');
                    assert.strictEqual(oauthUser[0].removed, 0, 'User is added back');
                    done();
                  })
                  .catch((error) => console.log(error));
              });
          })
          .catch((error) => console.log(error));
        })
        .catch((error) => console.log(error));
    });

    it('should not add existing netid user to table', (done) => {
      connection.query('SELECT id FROM Users')
      .then((oldLength) => {
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
          connection.query('SELECT id FROM Users')
          .then((newLength) => {
            assert.strictEqual(oldLength.length, newLength.length, 'Eric existing, so no new user');
            done();
          })
          .catch((error) => console.log(error));
        });
      })
      .catch((error) => console.log(error));
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
      return dbSetup.setupTestDatabase();
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
          connection.query(`SELECT * FROM Users WHERE username = 'admin1'`)
          .then((users) => {
            assert.strictEqual(users.length, 1, 'Number of rows with username.');
            const newAdmin = users[0];
            assert.strictEqual(newAdmin.id, 8, 'New admin ID.');
            assert.strictEqual(newAdmin.username, 'admin1', 'New admin username.');
            assert.strictEqual(newAdmin.oauth, 0, 'Not OAuth user');
            assert.strictEqual(newAdmin.name, 'mike wazowski', 'New admin name.');
            assert.strictEqual(newAdmin.user_group, 'admin', 'New admin user group.');
            done();
          })
          .catch((error) => console.log(error));
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
          connection.query(`SELECT * FROM Users WHERE username = 'noob1'`)
          .then((users) => {
            assert.strictEqual(users.length, 1, 'Number of rows with username.');
            const newNoob = users[0];
            assert.strictEqual(newNoob.id, 8, 'New noob ID.');
            assert.strictEqual(newNoob.username, 'noob1', 'New noob username.');
            assert.strictEqual(newNoob.oauth, 0, 'Not OAuth user');
            assert.strictEqual(newNoob.name, 'mike wazowski', 'New noob name.');
            assert.strictEqual(newNoob.user_group, 'noob', 'New noob user group.');
            done();
          })
          .catch((error) => console.log(error));
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
          connection.query('SELECT * FROM Users WHERE username = "eri101" and oauth = 1')
          .then((results) => {
            assert.strictEqual(results[0].user_group, 'manager', 'Eric should become a manager now.');
            done();
          })
          .catch((error) => console.log(error));
        });
    });
  });

  describe('#delete()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });

    it('User 4 is successfully deleted', (done) => {
      chai.request(server)
        .post('/users/delete')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'user': {
            'username': 'noob',
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          connection.query(`SELECT * FROM Users WHERE username = 'noob'`)
          .then((results) => {
            assert.strictEqual(results[0].removed, 1, 'Is fake removed');
            done();
          })
          .catch((error) => console.log(error));
        });
    });

    it('Nonexistent user is unsuccessfully deleted', (done) => {
      chai.request(server)
        .post('/users/delete')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .send({
          'user': {
            'username': 'foobar',
          },
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('Reject noob trying to user delete', (done) => {
      chai.request(server)
        .post('/users/delete')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({
          'user': {
            'username': 'noob',
          },
        })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('Reject manager trying to user delete', (done) => {
      chai.request(server)
        .post('/users/delete')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .send({
          'user': {
            'username': 'noob',
          },
        })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('#viewAll()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });

    it('should get all users that are not deleted', (done) => {
      chai.request(server)
        .get('/users')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(6);
          done();
        });
    });

    it('Reject noob trying to view users', (done) => {
      chai.request(server)
        .get('/users')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('Reject manager trying to view users', (done) => {
      chai.request(server)
        .get('/users')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});
