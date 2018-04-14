import * as checkNumber from './common/checkNumber';
import { createError, handleError } from './common/customError';
// import { getSpace } from './common/packageUtilies';
// import success from './common/success';
// import { updateConsumedSpendingLogForCart } from './spendinglog';
import { logAction } from './systemLogs';
// import { uuid } from './common/uuid';

const formulasQueryString = 'SELECT * FROM Formulas';
const finalProductInventoryQueryString = 'SELECT FinalProductInventories.*, ProductRuns.id AS product_run_id, ProductRuns.cost_for_run FROM FinalProductInventories INNER JOIN ProductRuns ON FinalProductInventories.productrun_id = ProductRuns.id';

export function getAll(req, res, next) {
  connection.query('SELECT * from Sales')
    .then(results => res.status(200).send(results))
    .catch(err => handleError(err, res));
}

/* request body format:
 * req.body.products = [
 *   {
 *     formula_id = 1
 *     num_packages = 15
 *     sell_price_per_product = 100
 *   }, ...
 * ]
 */
export function submit(req, res, next) {
  const removedFinalProductInventoryItems = [];
  const modifiedFinalProductInventoryItems = [];
  const modifiedFormulas = [];
  const newSaleItems = [];
  const logStrings = [];

  Promise.all([
    connection.query(finalProductInventoryQueryString),
    connection.query(formulasQueryString),
  ])
    .then(results => {
      const [finalProductsDatabase, formulasDatabase] = results;
      const finalProductInventory = {};
      for (let result of finalProductsDatabase) {
        let existingInventory = finalProductInventory[result.formula_id];
        if (!existingInventory) {
          existingInventory = {
            totalPackages: 0,
            inventoryEntries: [],
          };
        }

        existingInventory.totalPackages += result.num_packages;
        existingInventory.inventoryEntries.push(result);
        existingInventory.inventoryEntries.sort(function(a, b) {
          return a.created_at - b.created_at;
        });

        finalProductInventory[result.formula_id] = existingInventory;
      }

      if (!req.body.products) throw createError('Missing products field');
      for (let product of req.body.products) {
        if (!product.formula_id || !product.num_packages || !product.sell_price_per_product) throw createError('Invalid request format');
        if (!checkNumber.isNonNegativeInteger(product.num_packages)) throw createError('Invalid number of packages for a product');
        if (!parseFloat(product.sell_price_per_product) || product.sell_price_per_product <= 0) throw createError('Invalid price per product: product.sell_price_per_product');
        const currFormulaEntries = finalProductInventory[product.formula_id];
        const formula = formulasDatabase.find(entry => entry.id == product.formula_id);
        const originalFormulaTotalNumProducts = formula.total_num_products;

        if (!formula) throw createError(`Missing formula with id ${product.formula_id}`);

        if (!currFormulaEntries) throw createError('Missing final product in final product inventory');
        if (currFormulaEntries.totalPackages < product.num_packages) throw createError('Insufficient final product in inventory');
      
        let packagesToConsume = product.num_packages;
        let costForCurrFormula = 0;
        for (let currFormulaEntry of currFormulaEntries.inventoryEntries) {
          if (currFormulaEntry.num_packages <= packagesToConsume) {
            removedFinalProductInventoryItems.push(currFormulaEntry.id);
            packagesToConsume -= currFormulaEntry.num_packages;

            // Formulas
            const timeSinceCreation = new Date() - currFormulaEntry.created_at;
            formula.worst_duration = Math.max(formula.worst_duration, timeSinceCreation);
            formula.total_weighted_duration += timeSinceCreation * currFormulaEntry.num_packages * formula.num_product;
            formula.total_num_products += currFormulaEntry.num_packages * formula.num_product;

            // Sale
            costForCurrFormula += currFormulaEntry.cost_for_run;
          }
          else {
            modifiedFinalProductInventoryItems.push([currFormulaEntry.id, 1, 1, currFormulaEntry.num_packages - packagesToConsume]);

            // Formulas
            const timeSinceCreation = new Date() - currFormulaEntry.created_at;
            formula.worst_duration = Math.max(formula.worst_duration, timeSinceCreation);
            formula.total_weighted_duration += timeSinceCreation * (currFormulaEntry.num_packages - packagesToConsume) * formula.num_product;
            formula.total_num_products += packagesToConsume * formula.num_product;

            // Sale
            costForCurrFormula += currFormulaEntry.cost_for_run * packagesToConsume / currFormulaEntry.num_packages;
            break;
          }
        }
        const numAddedProducts = formula.total_num_products - originalFormulaTotalNumProducts;
        newSaleItems.push([formula.id, numAddedProducts, costForCurrFormula, product.sell_price_per_product * numAddedProducts]);
        logStrings.push(`${product.num_packages} ${formula.name} sold at $${product.sell_price_per_product} per product`);
        modifiedFormulas.push([formula.id, formula.ingredient_id, formula.name, formula.description, formula.num_product, formula.worst_duration, formula.total_weighted_duration, formula.total_num_products]);
      }

      return (removedFinalProductInventoryItems.length > 0 ? connection.query('DELETE FROM FinalProductInventories WHERE id in (?)', [removedFinalProductInventoryItems]) : Promise.resolve());
    })
    .then(() => modifiedFinalProductInventoryItems.length > 0 ? connection.query('INSERT INTO FinalProductInventories (id, productrun_id, formula_id, num_packages) VALUES ? ON DUPLICATE KEY UPDATE num_packages=VALUES(num_packages)', [modifiedFinalProductInventoryItems]) : Promise.resolve())
    .then(() => modifiedFormulas.length > 0 ? connection.query('INSERT INTO Formulas (id, ingredient_id, name, description, num_product, worst_duration, total_weighted_duration, total_num_products) VALUES ? ON DUPLICATE KEY UPDATE worst_duration=VALUES(worst_duration), total_weighted_duration=VALUES(total_weighted_duration), total_num_products=VALUES(total_num_products)', [modifiedFormulas]) : Promise.resolve())
    .then(() => connection.query('INSERT INTO Sales (formula_id, num_packages, total_cost, total_revenue) VALUES ? ON DUPLICATE KEY UPDATE num_packages=num_packages+VALUES(num_packages), total_cost=total_cost+VALUES(total_cost), total_revenue=total_revenue+VALUES(total_revenue)', [newSaleItems]))
    .then(() => logAction(req.payload.id, `Confirmed a sale for ${logStrings.join(', ')}.`))
    .then(results => res.status(200).send(results))
    .catch(err => handleError(err, res));
  }
