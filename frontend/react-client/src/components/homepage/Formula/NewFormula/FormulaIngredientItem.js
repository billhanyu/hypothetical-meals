import React, { Component } from 'react';

class FormulaInput extends Component {
  constructor(props) {
    super(props);
  }

  /*** REQUIRED PROPS
    1. element (String)
    2. onInputChange (Func)
  */

  _handleChange(event) {
    this.props.onInputChange(this.props.element, event.target.value);
  }

  render() {
    return (
      <div className="FormulaIngredientItemContainer">
        <span>{this.props.element}</span>
        <input placeholder="Quantity of Ingredient" onChange={this._handleChange.bind(this)} />
      </div>
    );
  }
}

export default FormulaInput;
