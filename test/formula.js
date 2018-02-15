import server from '../server/server';

const alasql = require('alasql');
const assert = require('chai').assert;
const testTokens = require('./testTokens');

describe('Formulas', () => {
    describe('#view()', () => {
        it('should return all formulas', (done) => {
            chai.request(server)
                .get('/formulas')
                .set('Authorization', `Token ${testTokens.managerTestToken}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    const formulas = res.body;
                    assert.strictEqual(formulas.length, 2, 'Number of formulas in database');
                    assert.strictEqual(formulas[0].id, 1, 'Id of formula 1');
                    assert.strictEqual(formulas[0].name, 'cake', 'Name of formula 1');
                    assert.strictEqual(formulas[0].description, 'A simple cake', 'Description for cake');
                    assert.strictEqual(formulas[0].num_product, 1, 'Number of product produced by formula');
                    const ingredient = formulas[0]['ingredients']['boop'];
                    assert.strictEqual(Object.keys(ingredient).length, 3, 'Properties in ingredient');
                    assert.strictEqual(ingredient['ingredient_id'], 3, 'Id of ingredient in formula');
                    assert.strictEqual(ingredient['num_native_units'], 1, 'Number of native units of boop');
                    assert.strictEqual(ingredient['native_unit'], 'kg', 'Native unit of boop');
                    done();
                });
        });

        it('should let noobs view', (done) => {
            chai.request(server)
                .get('/formulas')
                .set('Authorization', `Token ${testTokens.noobTestToken}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    });

    describe('#add()', () => {
        beforeEach(() => {
            alasql('SOURCE "./server/create_database.sql"');
            alasql('SOURCE "./server/sample_data.sql"');
        });

        it('should add two formulas to the database', (done) => {
            chai.request(server)
                .post('/formulas')
                .set('Authorization', `Token ${testTokens.adminTestToken}`)
                .send({
                    'formulas': [
                        {
                            'name': 'blob',
                            'description': 'A blob',
                            'num_product': 1,
                            'ingredients': [
                                {
                                    'ingredient_id': 1,
                                    'num_native_units': 2,
                                },
                            ],
                        },
                        {
                            'name': 'Bill',
                            'description': 'Fried up Bill',
                            'num_product': 1,
                            'ingredients': [
                                {
                                    'ingredient_id': 1,
                                    'num_native_units': 10,
                                },
                                {
                                    'ingredient_id': 2,
                                    'num_native_units': 2,
                                },
                            ],
                        },
                    ],
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    const formulas = alasql(`SELECT * FROM Formulas`);
                    assert.strictEqual(formulas.length, 4, 'Number of formulas in database');
                    assert.strictEqual(formulas[3].name, 'Bill', 'Name for formula 3');
                    assert.strictEqual(formulas[3].description, 'Fried up Bill', 'Description for formula 3');
                    assert.strictEqual(formulas[3].num_product, 1, 'Number of products for formula 3');
                    const formulaIngredients = alasql(`SELECT * FROM FormulaEntries WHERE formula_id = ${formulas[3].id}`);
                    assert.strictEqual(formulaIngredients.length, 2, 'Number of ingredients in formula 3');
                    assert.strictEqual(formulaIngredients[0].ingredient_id, 1, 'First ingredient id in formula 3');
                    assert.strictEqual(formulaIngredients[0].num_native_units, 10, 'First ingredient native units formula 3');
                    done();
                });
        });

        it('should reject an add request from a noob', (done) => {
            chai.request(server)
                .post('/formulas')
                .set('Authorization', `Token ${testTokens.noobTestToken}`)
                .send({
                    'formulas': [
                        {
                            'name': 'blob',
                            'description': 'A blob',
                            'num_product': 1,
                            'ingredients': [
                                {
                                    'ingredient_id': 1,
                                    'num_native_units': 2,
                                },
                            ],
                        },
                    ],
                })
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });

        it('should reject an add request from a manager', (done) => {
            chai.request(server)
                .post('/formulas')
                .set('Authorization', `Token ${testTokens.managerTestToken}`)
                .send({
                    'formulas': [
                        {
                            'name': 'blob',
                            'description': 'A blob',
                            'num_product': 1,
                            'ingredients': [
                                {
                                    'ingredient_id': 1,
                                    'num_native_units': 2,
                                },
                            ],
                        },
                    ],
                })
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
    });
});
