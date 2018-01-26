const assert = require('chai').assert;
import { adminRequired, noobRequired } from '../server/authMiddleware';

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

    xit('should reject noobs', (done) => {
      req = fakeReq(2); // Eric - noob
      adminRequired(req, res, () => {
        assert.strictEqual(req.user.name, 'Eric', 'User 2 name');
        assert.strictEqual(req.user.username, 'eric', 'User 2 username');
        assert.strictEqual(req.user.user_group, 'noob', 'User 2 user group');
        assert.strictEqual(res.code, 401, 'Response status code');
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
        assert.strictEqual(req.user.username, 'eric', 'User 2 username');
        assert.strictEqual(req.user.user_group, 'noob', 'User 2 user group');
        assert.strictEqual(res.code, 0, 'Response status code');
        done();
      });
    });
  });
});
