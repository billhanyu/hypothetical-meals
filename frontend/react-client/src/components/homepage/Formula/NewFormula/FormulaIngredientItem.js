import React, { Component } from 'react';

class FormulaInput extends Component {
  constructor(props) {
    super(props);
  }

  /*** REQUIRED PROPS
    1. elementName (String)
    2. onInputChange (Func)

    OPTIONAL PROPS
    1. value (Number)
  */

  _handleChange(event) {
    this.props.onInputChange(this.props.elementName, event.target.value);
  }

  render() {
    return (
      <div className="FormulaIngredientItemContainer">
        <span>{this.props.elementName}</span>
        <input value={this.props.value} placeholder="Quantity of Ingredient" onChange={this._handleChange.bind(this)} />
      </div>
    );
  }
}

export default FormulaInput;
