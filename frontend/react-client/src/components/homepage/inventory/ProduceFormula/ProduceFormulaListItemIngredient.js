import React, { Component } from 'react';

class ProduceFormulaListItemIngredient extends Component {
  constructor(props) {
    super(props);
  }

  /*** REQUIRED PROPS
    1. ingredient (JSON Object) - see parent element for sample obj
    2. numIngredients (Number)
  */

  render() {
    return (
      <div className="ProduceFormulaListItemIngredient">
        <div className="Quantity"> {Number(this.props.numIngredients).toFixed(2)} </div>
        <div className="IngredientName"> {this.props.ingredient.name} </div>
      </div>
    );
  }
}

export default ProduceFormulaListItemIngredient;
