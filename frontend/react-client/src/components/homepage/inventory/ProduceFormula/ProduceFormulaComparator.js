import React, { Component } from 'react';
import ProduceFormulaComparatorRow from './ProduceFormulaComparatorRow.js';
import axios from 'axios';
import Snackbar from 'material-ui/Snackbar';

class ProduceFormulaComparator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      snackbarMessage: "Finished",
    };

    //ingredientIDtoAmountMap entry looks like:
      // ingredientid:
      // {
      //   name: name,
      //   amount:amount,
      //   stock: 0
      // }
    const ingredientIDtoAmountMap = {};
    const ingredientList = [];
    Object.keys(props.formulaToFormulaAmountMap).forEach(formulaID => {
      const formulaAmount = props.formulaToFormulaAmountMap[formulaID];
      const formulaPackageObject = props.EditFormulaBoxes.find(formulaBox => {
        return formulaBox.id == formulaID;
      });
      Object.keys(formulaPackageObject.ingredients).forEach(ingredient => {
        const ingredientObject = formulaPackageObject.ingredients[ingredient];
        const addedIngredients = formulaAmount * ingredientObject.num_native_units;
        if(ingredientIDtoAmountMap[ingredientObject.ingredient_id] != null) {
          ingredientIDtoAmountMap[ingredientObject.ingredient_id].amount = ingredientIDtoAmountMap[ingredientObject.ingredient_id].amount + addedIngredients;
        }
        else {
          ingredientList.push(ingredientObject);
          ingredientIDtoAmountMap[ingredientObject.ingredient_id] = {
            name: ingredientObject.name,
            amount: addedIngredients,
            stock: 0,
          };
        }
      });
    });
    Object.keys(ingredientIDtoAmountMap).forEach(ingredientid => {
      const inventoryOfIngredient = Object.keys(props.inventoryStock).find(inventoryStockObjID => {
        return ingredientid == props.inventoryStock[inventoryStockObjID].ingredient_id;
      });
      ingredientIDtoAmountMap[ingredientid].stock = inventoryOfIngredient == null ? 0 : props.inventoryStock[inventoryOfIngredient].ingredient_num_native_units;
    });
    this.ingredientIDtoAmountMap = ingredientIDtoAmountMap;
    this.ingredientList = ingredientList;
    this.negativeEntries = [];
    Object.keys(this.ingredientIDtoAmountMap).map((elementId, key) => {
      const leftoverStock = this.ingredientIDtoAmountMap[elementId].stock - this.ingredientIDtoAmountMap[elementId].amount;
      if(leftoverStock < 0) {
        this.negativeEntries.push({elementId, leftoverStock});
      }
    });
  }

  /*** REQUIRED PROPS
    1. inventoryStock (JSON Obj of Formulas)
      1:{
        id: 1,
        ingredient_id: 1,
        num_packages: 20,
        ingredient-name: 'poop',
        ingredient_num_native_units: 10,
        ingredient-package_type: "sack",
        ingredient_storage_id: 1,
      }
    2. formulaToFormulaAmountMap (JSON Object Map of id:formulaAmount)
    3. EditFormulaBoxes (Array)
    4. onBackClick (Func)
    5. formulaToFormulaAmountTotalMap (JSON Obj Map of id:formulaAmount * amt_per_formula_created)

    Process
    1. Create parent object/map with ingredientid:{name: name, amount:amount, stock: 0}
    2. Iterate through formulaToFormulaAmountMap and get each formula ingredient id with amount
      1. Use the value and multiply it with ingredient_id
      2. Store it in parent object
    3. Iterate through each object and find stock from inventoryStock, update object
  */

  addIngredientsToCart() {
    global.cart = [];
    this.negativeEntries.forEach(negativeIngredientObj => {
      const ingredientObj = this.ingredientList.find(ingredientObj => {
        return ingredientObj.ingredient_id == negativeIngredientObj.elementId;
      });
      const stockRequired = Math.abs(negativeIngredientObj.leftoverStock);
      ingredientObj.quantity = Math.ceil(stockRequired / ingredientObj.ingredient_num_native_units);
      //Modify the object to become more like the cart Object
      ingredientObj.id = ingredientObj.ingredient_id;
      ingredientObj.num_native_units = ingredientObj.ingredient_num_native_units;
      delete ingredientObj.ingredient_id;
      delete ingredientObj.formula_id;
      delete ingredientObj.ingredient_num_native_units;

      global.cart.push(ingredientObj);
    });
    this.setState({
      open: true,
      snackbarMessage: "Added to Cart",
    });
  }

  produceFormulas() {
    const promiseArray = [];
    Object.keys(this.props.formulaToFormulaAmountTotalMap).forEach(formula_id => {
      promiseArray.push(axios.put(`/inventory`, {
        formula_id: Number(formula_id),
        num_products: this.props.formulaToFormulaAmountTotalMap[formula_id],
      }, {
        headers: {Authorization: "Token " + global.token}
      }));
    });
    Promise.all(promiseArray)
    .then(response => {
      this.setState({
        open: true,
        snackbarMessage: "Produced Formulas",
      });
    }).catch(error => {
      alert("Error Producing Formula");
    });
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  render() {
    return (
      <div className="ProduceFormulaComparator borderAll">
        <Snackbar
          open={this.state.open}
          message={this.state.snackbarMessage}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        <i className="fas fa-arrow-alt-circle-left fa-2x ProduceFormulaComparatorBackButton" onClick={this.props.onBackClick}></i>
        <table>
          <thead>
            <th> Ingredient </th>
            <th> Original </th>
            <th> Used </th>
            <th> Leftover </th>
          </thead>
          <tbody>
            {
              Object.keys(this.ingredientIDtoAmountMap).map((element, key) => {
                return <ProduceFormulaComparatorRow key={key}
                        name={this.ingredientIDtoAmountMap[element].name}
                        amount={this.ingredientIDtoAmountMap[element].amount}
                        stock={this.ingredientIDtoAmountMap[element].stock} />;
              })
            }
          </tbody>
        </table>
        {
          this.negativeEntries.length > 0 ?
          <div>
            <div style={{margin: '12px 0', clear:'both', textAlign:'center', fontSize:'15px', width: '100%'}}> Cannot Order - Not enough ingredients. </div>
            <div className="ProduceFormulaButtonTable" onClick={this.addIngredientsToCart.bind(this)}>Add Difference to Cart <br /> (See cart in Order sub-tab)</div>
          </div>
          : <div className="ProduceFormulaButtonTable" onClick={this.produceFormulas.bind(this)}>Produce Formulas</div>
        }
      </div>
    );
  }
}

export default ProduceFormulaComparator;