import { createError, handleError } from './common/customError';
import success from './common/success';

const productionQuery = `SELECT * FROM ProductionlinesOccupancies`;

export function view(req, res, next) {
  const queryParams = req.query;
  let milliTime = 0;
  let myRes = {
    'occupancies': [],
    'total_time': null,
    'total_lines': null,
  };
  connection.query(`${getQueryString(queryParams)}`)
    .then((results) => {
      myRes.occupancies = results;
      const startTimes = results.map(x => x.start_time);
      const endTimes = results.map(x => x.end_time);
      endTimes.forEach((value, i) => {
        milliTime += getDate(value) - getDate(startTimes[i]);
      });
      myRes.total_time = milliTime;
      return connection.query(`SELECT COUNT(1) FROM Productionlines 
        WHERE created_at <= ${queryParams.to_date || new Date().toISOString().slice(0, 10)} 23:59:59`);
    })
    .then((lineNum) => {
      myRes.total_lines = lineNum[0]['COUNT(1)'];
      res.status(200).send(myRes);
    })
    .catch((err) => {
      console.log(err);
      handleError(err, res);
    });
}

/**
 *
 * @param {*} queryParams where keys are the parameters to search for and values are their values
 * @return {String}
 */
export function getQueryString(queryParams) {
  let queryCases = [];
  Object.keys(queryParams).forEach(x => {
      if (x == 'from_date') {
          queryCases.push(`end_time >= '${queryParams[x]} 00:00:00'`);
      } else if (x == 'to_date') {
          queryCases.push(`start_time <= '${queryParams[x]} 23:59:59'`);
      }
  });
  return `${productionQuery} ${queryCases.length > 0 ? 'WHERE' : ''} ${queryCases.join(' AND ')}`;
}

function getDate(timestamp) {
  const t = timestamp.split(/[- :]/);

  return new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]));
}
