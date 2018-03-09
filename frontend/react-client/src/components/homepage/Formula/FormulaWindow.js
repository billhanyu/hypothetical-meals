import React, { Component } from 'react';
import FormulaInput from './NewFormula/FormulaInput.js';
import FormulaSelector from './NewFormula/FormulaSelector.js';
import FormulaButton from './NewFormula/FormulaButton.js';
import axios from 'axios';

class FormulaWindow extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    const name = props.newFormulaObject != null ? props.newFormulaObject.name : '';
    const desc = props.newFormulaObject != null ? props.newFormulaObject.description : '';
    const quantity = props.newFormulaObject != null ? props.newFormulaObject.num_product : 0;
    const removed = props.newFormulaObject != null ? props.newFormulaObject.removed.data[0] : 0;
    const idToQuantityMap = {};
    const values = [];
    const ingredientNameToQuantityMap = {};
    if (props.newFormulaObject != null) {
      Object.keys(props.newFormulaObject.ingredients).forEach(ingredient => {
        const element = props.newFormulaObject.ingredients[ingredient];
        idToQuantityMap[element.ingredient_id] = element.num_native_units;
        values.push(ingredient);
        ingredientNameToQuantityMap[element.name] = element.num_native_units;
      });
    }

    this.state = {
      name,
      desc,
      quantity,
      removed,
      idToQuantityMap,
      values,
      ingredientNameToQuantityMap,
    };
  }

  /*** REQUIRED PROPS
    1. onFinish (Func)
    2. isEditing (Bool)

    OPTIONAL PROPS
    1. BackButtonShown (Bool)
    2. onBackClick (Func)
    3. newFormulaObject (JSON Formula Object)
    4. activeId (Number)
  ****/

  handleInputChange(newInput, id) {
    const newState = this.state;
    let newInputVal = newInput;
    let errorObj = {};
    if (id == 'name') {
      Object.assign(errorObj, { nameError: false, });
    }
    if (id == 'desc') {
      Object.assign(errorObj, { descError: false, });
    }
    if (id == 'quantity') {
      Object.assign(errorObj, { quantityError: false, });
      const replacedValue = Number(newInputVal.replace('.', '').replace('-', ''));
      newInputVal = isNaN(replacedValue) ? newInputVal : replacedValue;
    }
    newState[id] = newInputVal;
    Object.assign(newState, errorObj);
    this.setState(newState);
  }

  _handleIngredientChange(idToQuantityMap, ingredientNameToQuantityMap) {
    this.setState({
      idToQuantityMap,
      ingredientNameToQuantityMap,
    });
  }

  _handleValueChange(values) {
    const newIngredientNameToQuantityMap = this.state.ingredientNameToQuantityMap;
    const newidToQuantityMap = this.state.idToQuantityMap;
    Object.keys(this.state.ingredientNameToQuantityMap).forEach(ingredientName => {
      if (values.find(element => element == ingredientName) == null) {
        delete newIngredientNameToQuantityMap[ingredientName];
        let ingredientId = -1;
        Object.keys(this.props.newFormulaObject.ingredients).forEach(ingredient => {
          const element = this.props.newFormulaObject.ingredients[ingredient];
          if (element.name == ingredientName) {
            ingredientId = element.ingredient_id;
          }
        });
        delete newidToQuantityMap[ingredientId];
      }
    });
    this.setState({
      values,
      ingredError: false,
      ingredientNameToQuantityMap: newIngredientNameToQuantityMap,
      idToQuantityMap: newidToQuantityMap,
    });
  }

  _onFinish() {
    const isNameEmpty = this.state.name == '' || this.state.name == null;
    const isQuantityEmpty = this.state.quantity == '' || this.state.quantity == null || isNaN(Number(this.state.quantity)) || Number(this.state.quantity <= 0);
    const isIngredEmpty = this.state.values.length == 0;
    if (isNameEmpty || isQuantityEmpty || isIngredEmpty) {
      return this.setState({
        nameError: isNameEmpty,
        quantityError: isQuantityEmpty,
        ingredError: isIngredEmpty,
      });
    }

    if (this.props.isEditing) {
      const { name, desc, quantity, idToQuantityMap } = this.state;
      //PUT REQUEST HERE
      const ingredients = [];
      Object.keys(idToQuantityMap).forEach(key => {
        if (Number(idToQuantityMap[key]) > 0) {
          ingredients.push({
            ingredient_id: key,
            num_native_units: idToQuantityMap[key],
          });
        }
      });

      const id = this.props.activeId;
      console.log(id);
      console.log(ingredients);
      console.log(name);
      console.log(description);
      axios.put(`/formulas`, {
        'formulas': [
          {
            id,
            name,
            description: desc,
            num_product: quantity,
            ingredients,
          }
        ]
      }, {
          headers: { Authorization: "Token " + global.token }
        })
        .then(response => {
          if (this.props.onFinish) {
            this.props.onFinish();
          } else {
            alert('Updated!');
          }
        })
        .catch(err => {
          console.error(err);
          alert('Error updating');
        });
    } else {
      this.props.onFinish(this.state, this.props.activeId);
    }
  }

  render() {
    const readOnly = global.user_group !== "admin" || this.state.removed == 1;
    return (
      <div className="NewFormulaContainer borderAll">
        {
          this.props.BackButtonShown ? <i className="far fa-arrow-alt-circle-left fa-2x BackButtonFormulaContainer" onClick={this.props.onBackClick} ></i> : null
        }
        {
          global.user_group == "admin" &&
          <div className="NewFormulaHeader">{this.props.isEditing ? "Edit Formula" : "New Formula"}</div>
        }
        {
          global.user_group != "admin" &&
          <div className="NewFormulaHeader">{"Formula: " + this.state.name}</div>
        }
        <h3>
          {
            this.state.removed == 1 &&
            <span style={{ 'margin-left': '20px' }} className="badge badge-danger">Deleted</span>
          }
        </h3>
        <FormulaInput readOnly={readOnly} error={this.state.nameError} errorText="Invalid Name" value={this.state.name} id="name" onChange={this.handleInputChange} HeaderText="Unique Formula Name" ContentText="Name of the amalgamated entity" placeholder="Formula Name" />
        <FormulaInput readOnly={readOnly} error={this.state.descError} errorText="Invalid Desc" value={this.state.desc} id="desc" onChange={this.handleInputChange} HeaderText="Formula Description" ContentText="Full description or important notes for this particular formula" useTextArea />
        <FormulaSelector
          readOnly={readOnly}
          onChange={this._handleIngredientChange.bind(this)}
          onValueChange={this._handleValueChange.bind(this)}
          nameToQuantityMap={this.state.idToQuantityMap}
          values={this.state.values}
          ingredientNameToQuantityMap={this.state.ingredientNameToQuantityMap}
          HeaderText="Formula Ingredients"
          ContentText="List of all formula ingredients utilized, with corresponding quantities"
          errorText={this.state.ingredError ? "Select at least 1 ingredient" : null}
        />
        <FormulaInput readOnly={readOnly} error={this.state.quantityError} errorText="Invalid Quantity" value={this.state.quantity} id="quantity" onChange={this.handleInputChange} HeaderText="Quantity Created" ContentText="Total quantity created per instance of formula recipe / ingredient usage" placeholder="Quantity Created" inputStyle={{ marginTop: '12px' }} />
        {
          global.user_group == "admin" &&
          <FormulaButton text={this.props.isEditing ? "Edit Formula" : "Create New Formula"} onClick={this._onFinish.bind(this)} />
        }
        <div style={{ clear: 'both' }}></div>
      </div>
    );
  }
}

export default FormulaWindow;
