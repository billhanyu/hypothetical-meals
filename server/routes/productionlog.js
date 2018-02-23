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
