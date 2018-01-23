const alasql = require('alasql');
const assert = require('chai').assert;

describe('User', () => {
  describe('#modifyUsers()', () => {
    it('should add admin user', (done) => {
      chai.request(server)
        .post('/users/admin')
        .send({
          'user': {
            'username': 'username123',
            'name': 'mike wazowski',
            'password': 'mike mike mike',
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          const users = alasql(`SELECT * FROM Users WHERE username = 'username123'`);
          console.log(users);
          assert.strictEqual(users.length, 1, 'Number of rows with username.');
          const newAdmin = users[0];
          assert.strictEqual(newAdmin.id, 3, 'New admin ID.');
          assert.strictEqual(newAdmin.username, 'username123', 'New admin username.');
          assert.strictEqual(newAdmin.name, 'mike wazowski', 'New admin name.');
          assert.strictEqual(newAdmin.user_group, 'admin', 'New admin user group.');
          done();
        });
    });
  });

  describe('#login()', () => {
    it('should retrieve user info with login credentials', (done) => {
      chai.request(server)
        .post('/users/login')
        .send({
          'user': {
            'username': 'username123',
            'name': 'mike wazowski',
            'password': 'mike mike mike',
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          const users = alasql(`SELECT * FROM Users WHERE username = 'username123'`);
          assert.strictEqual(users.length, 1, 'Number of rows with username.');
          const newAdmin = users[0];
          assert.strictEqual(newAdmin.id, 3, 'New admin ID.');
          assert.strictEqual(newAdmin.username, 'username123', 'New admin username.');
          assert.strictEqual(newAdmin.name, 'mike wazowski', 'New admin name.');
          assert.strictEqual(newAdmin.user_group, 'admin', 'New admin user group.');
          done();
        });
    });
  });
});

// app.post('/users/admin', user.signupAdmin);
// app.post('/users/noob', auth.required, user.signupNoob);
// app.post('/users/login', user.login);
// app.get('/users', auth.required, user.getInfo);