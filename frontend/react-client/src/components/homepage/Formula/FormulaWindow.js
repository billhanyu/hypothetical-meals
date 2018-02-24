import React, { Component } from 'react';
import axios from 'axios';
import FormulaInput from './NewFormula/FormulaInput.js';
import FormulaSelector from './NewFormula/FormulaSelector.js';
import FormulaButton from './NewFormula/FormulaButton.js';

class FormulaWindow extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    const name = props.newFormulaObject != null ? props.newFormulaObject.name : '';
    const desc = props.newFormulaObject != null ? props.newFormulaObject.description : '';
    const quantity = props.newFormulaObject != null ? props.newFormulaObject.num_product : 0;
    const idToQuantityMap = {};
    const values = [];
    const ingredientNameToQuantityMap = {};
    if(props.newFormulaObject != null) {
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
    newState[id] = newInput;
    this.setState(newState);
  }

  _handleIngredientChange(idToQuantityMap, ingredientNameToQuantityMap) {
    this.setState({
      idToQuantityMap,
      ingredientNameToQuantityMap,
    });
  }

  _handleValueChange(values) {
    this.setState({
      values,
    });
  }

  _onFinish() {
    this.props.onFinish(this.state, this.props.activeId);
  }

  render() {
    return (
      <div className="NewFormulaContainer borderAll">
        {
          this.props.BackButtonShown ? <i className="far fa-arrow-alt-circle-left fa-2x BackButtonFormulaContainer" onClick={this.props.onBackClick} ></i> : null
        }
        <div className="NewFormulaHeader">New Formula</div>
        <FormulaInput value={this.state.name} id="name" onChange={this.handleInputChange} HeaderText="Unique Formula Name" ContentText="Name of the amalgamated entity" placeholder="Formula Name"/>
        <FormulaInput value={this.state.desc} id="desc" onChange={this.handleInputChange} HeaderText="Formula Description" ContentText="Full description or important notes for this particular formula" useTextArea/>
        <FormulaSelector
          onChange={this._handleIngredientChange.bind(this)}
          onValueChange={this._handleValueChange.bind(this)}
          nameToQuantityMap={this.state.idToQuantityMap}
          values={this.state.values}
          ingredientNameToQuantityMap={this.state.ingredientNameToQuantityMap}
          HeaderText="Formula Ingredients"
          ContentText="List of all formula ingredients utilized, with corresponding quantities"
        />
        <FormulaInput value={this.state.quantity} id="quantity" onChange={this.handleInputChange} HeaderText="Quantity Created" ContentText="Total quantity created per instance of formula recipe / ingredient usage" placeholder="Quantity Created" inputStyle={{marginTop:'12px'}}/>
        <FormulaButton text={this.props.isEditing ? "Edit Formula" : "Create New Formula"} onChange={this.handleInputChange} onClick={this._onFinish.bind(this)}/>
        <div style={{clear: 'both'}}></div>
      </div>
    );
  }
}

export default FormulaWindow;