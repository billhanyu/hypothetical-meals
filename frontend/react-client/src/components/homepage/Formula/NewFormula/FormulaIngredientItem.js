import React, { Component } from 'react';

class FormulaInput extends Component {
  constructor(props) {
    super(props);
  }

  /*** REQUIRED PROPS
    1. elementName (String)
    2. onInputChange (Func)
    3. onDelete (Func)

    OPTIONAL PROPS
    1. value (Number)
    2. error (Bool)
  */

  _handleChange(event) {
    this.props.onInputChange(this.props.elementName, event.target.value);
  }

  render() {
    return (
      <div className="FormulaIngredientItemContainer">
        <i className="fas fa-times" onClick={() => {this.props.onDelete(this.props.elementName)}}></i>
        <span>{this.props.elementName}</span>
        <input readOnly={this.props.readOnly} value={this.props.value} placeholder="Quantity of Ingredient" onChange={this._handleChange.bind(this)} />
      </div>
    );
  }
}

export default FormulaInput;
