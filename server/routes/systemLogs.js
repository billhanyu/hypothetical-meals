import { createError, handleError } from './common/customError';
import success from './common/success';

const logInsertString = 'INSERT INTO SystemLog';

/**
 *
 * @param {*} logParams
 * logParams = {
 *      user_id: abc123,
 *      entities: [],
 *      events: []
 * }
 */
export function logAction(logParams) {
    connection.query(`${logInsertString} (user_id, description) `);
}

function createLogString(logParams) {
    return `User ${logParams.user_id} changed ${logParams.entities.join(' and ')} by ${logParams.events.join(' and ')}.`;
}
