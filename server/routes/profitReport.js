import handleError from './common/customError';

export function view(req, res, next) {
  let productMap = {};
  connection.query(`SELECT Formulas.name as formula_name, Formulas.id as formula_id, ProductRuns.*
    FROM ProductRuns JOIN Formulas ON ProductRuns.formula_id = Formulas.id 
    WHERE Formulas.intermediate = 0 AND ProductRuns.completed = 1`)
    .then((productruns) => {
      productruns.forEach(product => {
        const formulaId = product.formula_id;
        if (!(formulaId in productMap)) {
          productMap[formulaId] = {};
          productMap[formulaId].formula_id = formulaId;
          productMap[formulaId].formula_name = product.formula_name;
          productMap[formulaId].total_ingredient_cost = product.cost_for_run;
          productMap[formulaId].units_sold = 0;
          productMap[formulaId].average_wholesale_price = 0;
          productMap[formulaId].wholesale_revenue = 0;
          productMap[formulaId].total_profit = 0;
          productMap[formulaId].unit_profit = 0;
          productMap[formulaId].profit_margin = 0;
        } else {
          productMap[formulaId].total_ingredient_cost += product.cost_for_run;
        }
      });
      return connection.query(`SELECT * FROM Sales WHERE formula_id IN (?)`, [productruns.map(x => x.formula_id)]);
    })
    .then((sales) => {
      sales.forEach(sale => {
        productMap[sale.formula_id].units_sold += sale.num_packages;
        productMap[sale.formula_id].wholesale_revenue += sale.total_revenue;
      });
      Object.keys(productMap).forEach(product => {
        const myProduct = productMap[product];
        myProduct.average_wholesale_price = myProduct.wholesale_revenue / myProduct.units_sold;
        myProduct.total_profit = myProduct.wholesale_revenue - myProduct.total_ingredient_cost;
        myProduct.unit_profit = myProduct.total_profit / myProduct.units_sold;
        myProduct.profit_margin = myProduct.wholesale_revenue / myProduct.total_ingredient_cost;
      });
      return Promise.resolve(Object.values(productMap));
    })
    .catch((err) => {
      handleError(err, res);
    });
}
