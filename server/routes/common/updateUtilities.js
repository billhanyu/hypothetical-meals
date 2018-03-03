import { createError } from './customError';
import { checkSuperset } from './checkParams';

/**
 *
 * @param {String} tableName
 * @param {*} updates
 * updates = [
 *  {
 *      'id': 'id in tableName',
 *      'key1': 'value1',
 *      ...
 *  },...
 * ]
 * @return {Promise}
 */
export function updateDatabaseHelper(tableName, updates) {
    return new Promise((resolve, reject) => {
        let updated = [];
        if (updates.length < 1) {
            reject(createError('Updates are empty'));
        } else {
            let updateMap = createNewUpdateMap(updates);
            let updateKeys = new Set();
            connection.query(`SELECT * FROM ${tableName} WHERE id IN (${Array.from(updateMap.keys()).join(', ')})`)
                .then((oldData) => {
                    if (oldData.length < 1) {
                        throw createError('Trying to update nonexistent table.');
                    } else if (!checkSuperset(Object.keys(oldData[0]), Object.keys(updates[0]))) {
                        throw createError('Trying to update nonexistent fields in database');
                    }
                    let updateCompare = getToUpdate(oldData, updateMap);
                    updateKeys = updateCompare.keys;
                    updated = updateCompare.updates;
                    return updateCases(tableName, Array.from(updateKeys), updated);
                })
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                });
        }
    });
}

/**
 *
 * @param {*} updates
 * updates = [
 *  {
 *      'id': 'id in tableName',
 *      'key1': 'value1',
 *      ...
 *  },...
 * ]
 * @return {Map} map of id to updates for that id
 */
export function createNewUpdateMap(updates) {
    let updateMap = new Map();
    updates.forEach(x => {
        if (!('id' in x)) {
            throw createError('Id not included in request');
        }
        updateMap.set(x.id, x);
    });
    return updateMap;
}

/**
 *
 * @param {Array} oldData
 * @param {Map} updateMap result from creating update map with ids as keys and update array as values
 * @return {*} object with 'keys': keys and 'updates': updated as an array
 */
export function getToUpdate(oldData, updateMap) {
    let updated = [];
    let updateKeys = new Set();
    oldData.forEach(x => {
        let updateColumn = {};
        let updatedTuples = {};
        const keys = Object.keys(x);
        const myUpdates = updateMap.get(x.id);
        for (let key of keys) {
            if (key != 'id') {
                updateKeys.add(key);
            }
            if (myUpdates != null) {
                let newValue = updateMap.get(x.id)[key];
                let oldValue = x[key];
                updatedTuples[key] = newValue || oldValue;
            } else {
                throw createError('Values to update not found for id');
            }
        }
        updateColumn['id'] = x.id;
        updateColumn['updates'] = updatedTuples;
        updated.push(updateColumn);
    });
    let updateStruct = {};
    updateStruct['keys'] = updateKeys;
    updateStruct['updates'] = updated;
    return updateStruct;
}

/**
 * @param {String} tableName
 * @param {Array} updateKeys keys (strings) to update in database
 * @param {*} updates
 * updates = [{
 *      'id': 1,
 *      'updates': {
 *          'key1': 'value1',
 *       },
 *  },
 * ;..]
 * @return {Promise}
 */
export function updateCases(tableName, updateKeys, updates) {
    let updateString = createUpdateString(tableName, updateKeys, updates);
    return connection.query(`${updateString}`)
        .catch((err) => {
            console.log(err);
            throw createError(`Cannot update database for ${tableName}`);
        });
}

/**
 *
 * @param {String} tableName
 * @param {Array} updateKeys ['key1', 'key2', ...]
 * @param {*} updates
 * updates = [
 *  {
 *      'id': 'id in tableName',
 *      'key1': 'value1',
 *      ...
 *  },...
 * ]
 * @return {String}
 */
export function createUpdateString(tableName, updateKeys, updates) {
    let caseStruct = {};
    updateKeys.forEach(x => {
        caseStruct[x] = [];
    });
    let updateIds = [];
    updates.forEach(x => {
        let updateId = x.id;
        updateIds.push(updateId);
        let myUpdates = x.updates;
        updateKeys.forEach(key => {
            if (myUpdates == null || isNaN(myUpdates[key])) {
                caseStruct[key].push(`when id = ${updateId} then '${myUpdates[key] || 'NULL'}'`);
            } else {
                caseStruct[key].push(`when id = ${updateId} then ${myUpdates[key]}`);
            }
        });
    });
    let cases = [];
    updateKeys.forEach(x => {
        cases.push(`${x} = (case ${caseStruct[x].join(' ')} end)`);
    });
    let updateString = `UPDATE ${tableName} SET ${cases.join(', ')} WHERE id IN (${updateIds.join(', ')})`;
    return updateString;
}
