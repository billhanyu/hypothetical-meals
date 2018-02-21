import React, { Component } from 'react';
import axios from 'axios';
import FormulaInput from './NewFormula/FormulaInput.js';
import FormulaSelector from './NewFormula/FormulaSelector.js';
import FormulaButton from './NewFormula/FormulaButton.js';

class FormulaWindow extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.state = {
      name: '',
      desc: '',
      quantity: 0,
      ingredients: [],
    };
  }

  /*** REQUIRED PROPS
    1. onFinish (Func)

    OPTIONAL PROPS
    1. BackButtonShown (Bool)
    2. onBackClick (Func)
    3. newFormulaObject (JSON Formula Object)
  ****/

  handleInputChange(newInput, id) {
    const newState = this.state;
    newState[id] = newInput;
    this.setState(newState);
  }

  _handleIngredientChange(ingredients) {
    this.setState({
      ingredients,
    });
  }

  _onFinish() {
    this.props.onFinish(this.state);
  }

  render() {
    return (
      <div className="NewFormulaContainer borderAll">
        {
          this.props.BackButtonShown ? <i className="far fa-arrow-alt-circle-left fa-2x BackButtonFormulaContainer" onClick={this.props.onBackClick} ></i> : null
        }
        <div className="NewFormulaHeader">New Formula</div>
        <FormulaInput value={this.props.newFormulaObject != null ? newFormulaObject.name : null} id="name" onChange={this.handleInputChange} HeaderText="Unique Formula Name" ContentText="Name of the amalgamated entity" placeholder="Formula Name"/>
        <FormulaInput value={this.props.newFormulaObject != null ? newFormulaObject.desc : null} id="desc" onChange={this.handleInputChange} HeaderText="Formula Description" ContentText="Full description or important notes for this particular formula" useTextArea/>
        <FormulaSelector values={this.props.newFormulaObject != null ? newFormulaObject.ingredients : null} onChange={this._handleIngredientChange.bind(this)} HeaderText="Formula Ingredients" ContentText="List of all formula ingredients utilized, with corresponding quantities"/>
        <FormulaInput value={this.props.newFormulaObject != null ? newFormulaObject.quantity : null} id="quantity" HeaderText="Quantity Created" ContentText="Total quantity created per instance of formula recipe / ingredient usage" placeholder="Quantity Created" inputStyle={{marginTop:'12px'}}/>
        <FormulaButton onChange={this.handleInputChange} onClick={this._onFinish.bind(this)}/>
        <div style={{clear: 'both'}}></div>
      </div>
    );
  }
}

export default FormulaWindow;
