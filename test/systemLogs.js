import { logAction, getQueryString } from '../server/routes/systemLogs';

const alasql = require('alasql');
const assert = require('chai').assert;
const testTokens = require('./testTokens');

describe('SystemLogs', () => {
    describe('#pages()', () => {
        it('should return number of pages of data', (done) => {
            chai.request(server)
                .get('/systemlogs/pages')
                .set('Authorization', `Token ${testTokens.managerTestToken}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    assert.strictEqual(res.body['numPages'], 1, 'number of pages');
                    done();
                });
        });
    });

    describe('#view()', () => {
        beforeEach(() => {
            alasql('SOURCE "./server/create_database.sql"');
            alasql('SOURCE "./server/sample_data.sql"');
        });

        it('should return all system logs', (done) => {
            chai.request(server)
                .get('/systemlogs/page/1')
                .set('Authorization', `Token ${testTokens.managerTestToken}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(6);
                    done();
                });
        });

        it('should only return one page of system logs', (done) => {
            for (let i = 0; i < 52; i++) {
                alasql(`INSERT INTO SystemLogs (user_id, description) VALUES (5, 'test${i}')`);
            }
            chai.request(server)
                .get('/systemlogs/page/1')
                .set('Authorization', `Token ${testTokens.managerTestToken}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(50);
                    done();
                });
        });
    });

    describe('#logAction()', () => {
        beforeEach(() => {
            alasql('SOURCE "./server/create_database.sql"');
            alasql('SOURCE "./server/sample_data.sql"');
        });

        it('Should insert user id and description into the database', function() {
            const testString = 'Testing proper insert into database';
            logAction(5, testString)
                .then(() => {
                    const systemLogs = alasql('SELECT * FROM SystemLogs');
                    const lastLog = systemLogs[systemLogs.length - 1];
                    assert.strictEqual(lastLog.user_id, 5, 'User id of log');
                    assert.strictEqual(lastLog.description, testString, 'Description of test string');
                });
        });
    });

    describe('#getQueryString()', () => {
        it('Should get the correct query string with a given from date', function() {
            const params = {
                'from_date': '2018-01-01',
            };
            assert.strictEqual(getQueryString(params), `SELECT * FROM SystemLogs WHERE created_at >= '2018-01-01 00:00:00'`);
        });

        it('Should get the correct query string with a given from date and to date', function() {
            const twoParams = {
                'from_date': '2018-01-01',
                'to_date': '2018-01-02',
            };
            assert.strictEqual(getQueryString(twoParams), `SELECT * FROM SystemLogs WHERE created_at >= '2018-01-01 00:00:00' AND created_at <= '2018-01-02 23:59:59'`);
        });

        it('Should get the correct query string with date parameters and user parameter', function() {
            const threeParams = {
                'from_date': '2018-01-01',
                'to_date': '2018-01-02',
                'user_id': 5,
            };
            assert.strictEqual(getQueryString(threeParams), `SELECT * FROM SystemLogs WHERE created_at >= '2018-01-01 00:00:00' AND created_at <= '2018-01-02 23:59:59' AND user_id = 5`);
        });

        it('Should get the correct query string with date, user, and ingredient_id', function() {
            const allParams = {
                'from_date': '2018-01-01',
                'to_date': '2018-01-02',
                'user_id': 5,
                'ingredient_id': 2,
            };
            assert.strictEqual(getQueryString(allParams), `SELECT * FROM SystemLogs WHERE created_at >= '2018-01-01 00:00:00' AND created_at <= '2018-01-02 23:59:59' AND user_id = 5`);
        });
    });

    describe('#viewAll()', () => {
        beforeEach(() => {
            alasql('SOURCE "./server/create_database.sql"');
            alasql('SOURCE "./server/sample_data.sql"');
        });

        it('Should return all system logs with user_id 5', (done) => {
            chai.request(server)
                .get('/systemlogs?user_id=5')
                .set('Authorization', `Token ${testTokens.managerTestToken}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    const results = res.body;
                    assert.strictEqual(results.length, 2, 'Number of logs from user 5');
                    results.forEach(x => {
                        assert.strictEqual(x['user_id'], 5, 'User id that logged');
                    });
                    done();
                });
        });

        it('Should return all system logs with date after 1/02/2018', (done) => {
            chai.request(server)
                .get('/systemlogs?from_date=2018.01.02')
                .set('Authorization', `Token ${testTokens.managerTestToken}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    assert.strictEqual(res.body.length, 5, 'Number of logs after 1/02/2018');
                    done();
                });
        });

        it('Should return all system logs from 1/01/2018 to 1/02/2018', (done) => {
            chai.request(server)
                .get('/systemlogs?from_date=2018.01.01&to_date=2018.01.02')
                .set('Authorization', `Token ${testTokens.managerTestToken}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    assert.strictEqual(res.body.length, 4, 'Number of logs between 1/01/2018 and 1/02/2018 ');
                    done();
                });
        });

        it('Should return all system logs from 1/01/2018 to 1/02/2018 where user_id is 5', (done) => {
            chai.request(server)
                .get('/systemlogs?user_id=5&from_date=2018.01.01&to_date=2018.01.02')
                .set('Authorization', `Token ${testTokens.managerTestToken}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    const results = res.body;
                    results.forEach(x => {
                        assert.strictEqual(x['user_id'], 5, 'User id that logged order is 5');
                    });
                    assert.strictEqual(results.length, 2, 'Number of logs in date range and logged by user 5');
                    done();
                });
        });

        it('Should get system logs where ingredient_id is 3', (done) => {
            chai.request(server)
                .get('/systemlogs?ingredient_id=3')
                .set('Authorization', `Token ${testTokens.managerTestToken}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    const results = res.body;
                    assert.strictEqual(results.length, 2, 'Number of logs with boop');
                    done();
                });
        });

        it('Should reject if user is a noob', (done) => {
            chai.request(server)
                .get('/systemlogs?from_date=2018.01.01&to_date=2018.01.02')
                .set('Authorization', `Token ${testTokens.noobTestToken}`)
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });

        it('Should allow if user is a admin', (done) => {
            chai.request(server)
                .get('/systemlogs?from_date=2018.01.01&to_date=2018.01.02')
                .set('Authorization', `Token ${testTokens.adminTestToken}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    });
});
