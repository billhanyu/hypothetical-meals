import { getNumPages, queryWithPagination } from './common/pagination';

const basicViewQueryString = 'SELECT ProductionLogs.*, Formulas.name AS formula_name, Formulas.id AS formula_id FROM ProductionLogs INNER JOIN Formulas ON ProductionLogs.formula_id = Formulas.id';

export function pages(req, res, next) {
  getNumPages('ProductionLogs')
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(err);
      return res.status(500).send('Database error');
    });
}

export function view(req, res, next) {
  queryWithPagination(req.params.page_num, 'ProductionLogs', basicViewQueryString)
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(err);
      return res.status(500).send('Database error');
    });
}

// Total spending is for current checkout only
export function addFormulaCheckoutToProductionLog(formulaId, numProducts, totalSpending) {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM ProductionLogs WHERE formula_id = ${formulaId}`)
    .then(results => {
      if (results == 0) return connection.query(`INSERT INTO ProductionLogs(formula_id, num_product, total_cost) VALUES (${formulaId}, ${numProducts}, ${totalSpending})`);
      return connection.query(`UPDATE ProductionLogs SET num_product = num_product + ${numProducts}, total_cost = total_cost + ${totalSpending} WHERE formula_id = ${formulaId}`);
    })
    .then(() => resolve())
    .catch(error => reject(error));
  });
}
