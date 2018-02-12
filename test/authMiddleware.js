const assert = require('chai').assert;
const testTokens = require('./testTokens');
import { adminRequired, noobRequired } from '../server/authMiddleware';
import server from '../server/server';

class FakeRes {
  constructor() {
    this.code = 0;
  }

  status(_code) {
    this.code = _code;
    return this;
  }

  send(msg) {
    return this;
  }
}

function fakeReq(userId) {
  const req = {
    payload: {
      id: userId,
    },
  };
  return req;
}

describe('authMiddleware', () => {
  describe('#adminRequired', () => {
    let req;
    let res;
    beforeEach(() => {
      res = new FakeRes();
    });

    it('should accept admin', (done) => {
      req = fakeReq(1); // Bill - admin
      adminRequired(req, res, () => {
        assert.strictEqual(req.user.name, 'Bill', 'User 1 name');
        assert.strictEqual(req.user.username, 'bill', 'User 1 username');
        assert.strictEqual(req.user.user_group, 'admin', 'User 1 user group');
        assert.strictEqual(res.code, 0, 'Response status code');
        done();
      });
    });

    it('should reject noobs', (done) => {
      chai.request(server)
        .post('/users/noob')
        .send({
          name: 'shit',
          username: 'shit',
          password: 'shit',
        })
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('#noobRequired', () => {
    let req;
    let res;
    beforeEach(() => {
      res = new FakeRes();
    });

    it('should accept admin', (done) => {
      req = fakeReq(1); // Bill - admin
      noobRequired(req, res, () => {
        assert.strictEqual(req.user.name, 'Bill', 'User 1 name');
        assert.strictEqual(req.user.username, 'bill', 'User 1 username');
        assert.strictEqual(req.user.user_group, 'admin', 'User 1 user group');
        assert.strictEqual(res.code, 0, 'Response status code');
        done();
      });
    });

    it('should accept noobs', (done) => {
      req = fakeReq(2); // Eric - noob
      noobRequired(req, res, () => {
        assert.strictEqual(req.user.name, 'Eric', 'User 2 name');
        assert.strictEqual(req.user.username, 'eri101', 'User 2 username');
        assert.strictEqual(req.user.user_group, 'noob', 'User 2 user group');
        assert.strictEqual(res.code, 0, 'Response status code');
        done();
      });
    });
  });
});
