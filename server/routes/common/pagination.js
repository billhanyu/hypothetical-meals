const idsPerPage = 50;

export function getNumPages(tableName) {
  return connection.query(`SELECT COUNT(id) FROM ${tableName}`)
  .then((data) => {
    return {numPages: Math.ceil(data[0]['COUNT(id)'] / idsPerPage)};
  });
}

export function getAvailableNumPages(tableName) {
  return connection.query(`SELECT COUNT(id) FROM ${tableName} WHERE removed = 0`)
    .then((data) => {
      return { numPages: Math.ceil(data[0]['COUNT(id)'] / idsPerPage) };
    });
}

export function queryWithPagination(pageNum, tableName, queryString, orderByString) {
  const startId = (pageNum - 1) * idsPerPage + 1;
  const endId = pageNum * idsPerPage;

  // Insert directly after 'WHERE'
  const whereIndex = Math.max(queryString.indexOf('WHERE'), queryString.indexOf('where'));
  if (whereIndex >= 0) {
    return connection.query(`${queryString.substring(0, whereIndex + 5)} (${tableName}.id BETWEEN ${startId} AND ${endId}) AND${queryString.substring(whereIndex + 5)}`);
  }

  return connection.query(`${queryString} WHERE (${tableName}.id BETWEEN ${startId} AND ${endId}) ${orderByString ? orderByString : ''}`);
}

export function getPaginationQueryString(pageNum, tableName, queryString) {
  const startId = (pageNum - 1) * idsPerPage + 1;
  const endId = pageNum * idsPerPage;

  // Insert directly after 'WHERE'
  const whereIndex = Math.max(queryString.indexOf('WHERE'), queryString.indexOf('where'));
  if (whereIndex >= 0) {
    return `${queryString.substring(0, whereIndex + 5)} (${tableName}.id BETWEEN ${startId} AND ${endId}) AND${queryString.substring(whereIndex + 5)}`;
  }

  return `${queryString} WHERE (${tableName}.id BETWEEN ${startId} AND ${endId})`;
}
