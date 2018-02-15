const alasql = require('alasql');
const assert = require('chai').assert;
const testTokens = require('./testTokens');

describe('Order', () => {
  describe('#placeOrder()', () => {
    beforeEach(() => {
        alasql('SOURCE "./server/create_database.sql"');
        alasql('SOURCE "./server/sample_data.sql"');
    });

    it('should place an order for valid ingredients', (done) => {
        chai.request(server)
        .post('/order')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({
            'orders': {
                '1': 2,
                '3': 1,
            },
        })
        .end((err, res) => {
            res.should.have.status(200);
            const inventory = alasql('SELECT * FROM Inventories');
            const logs = alasql('SELECT * FROM Logs');
            const spendingLogs = alasql('SELECT * FROM SpendingLogs');
            assert.strictEqual(inventory.length, 3, 'Number of things in inventory');
            assert.strictEqual(inventory[0].id, 1, 'Id for inventory 1');
            assert.strictEqual(inventory[0].ingredient_id, 1, 'Ingredient for inventory 1');
            assert.strictEqual(inventory[0].num_packages, 12, 'Number of packages for inventory 1');
            assert.strictEqual(inventory[2].id, 3, 'Id for inventory 3');
            assert.strictEqual(inventory[2].ingredient_id, 3, 'Ingredient for inventory 4');

            assert.strictEqual(logs.length, 4, 'Number of logs');
            assert.strictEqual(logs[2].user_id, 4, 'User id for log 3');
            assert.strictEqual(logs[2].vendor_ingredient_id, 1, 'Vendor ingredient for log 3');
            assert.strictEqual(logs[2].quantity, 100, 'Quantity for log 3');
            assert.strictEqual(logs[3].user_id, 4, 'User id for log 4');
            assert.strictEqual(logs[3].vendor_ingredient_id, 3, 'Vendor ingredient for log 4');
            assert.strictEqual(logs[3].quantity, 50, 'Quantity for log 4');

            assert.strictEqual(spendingLogs.length, 2, 'Length of spending logs');
            assert.strictEqual(spendingLogs[0].ingredient_id, 1, 'Ingredient id for spending log 1');
            assert.strictEqual(spendingLogs[0].total_weight, 600, 'Ingredient weight for spending log 1');
            assert.strictEqual(spendingLogs[0].total, 5020, 'Total amount spent for ingredient 1');
            assert.strictEqual(spendingLogs[0].consumed, 50, 'Total amount consumed in weight for ingredient 1');
            assert.strictEqual(spendingLogs[1].ingredient_id, 3, 'Ingredient id for spending log 2');
            assert.strictEqual(spendingLogs[1].total_weight, 50, 'Ingredient weight for spending log 2');
            assert.strictEqual(spendingLogs[1].total, 30, 'Total amount spent for ingredient 2');
            assert.strictEqual(spendingLogs[1].consumed, 0, 'Total amount consumed in weight for ingredient 2');
            done();
        });
    });

    it('should place reject an order with invalid ingredients', (done) => {
        chai.request(server)
        .post('/order')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({
            'orders': {
                '10': 2,
            },
        })
        .end((err, res) => {
            res.should.have.status(400);
            assert.strictEqual(res.text, 'Some id not in Vendor Ingredients');
            done();
        });
    });

    it('should place reject an order with ingredient over capacity', (done) => {
        chai.request(server)
        .post('/order')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .send({
            'orders': {
                '4': 1,
            },
        })
        .end((err, res) => {
            res.should.have.status(400);
            assert.strictEqual(res.text, 'Requested quantity exceeds capacity.');
            done();
        });
    });
  });
});
