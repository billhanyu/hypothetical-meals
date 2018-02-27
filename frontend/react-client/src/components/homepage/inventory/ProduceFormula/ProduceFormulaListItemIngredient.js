import React, { Component } from 'react';

class ProduceFormulaListItemIngredient extends Component {
  constructor(props) {
    super(props);
  }

  /*** REQUIRED PROPS
    1. ingredient (JSON Object) - see parent element for sample obj
    2. numFormula (Number)
  */

  render() {
    return (
      <div className="ProduceFormulaListItemIngredient">
        <div className="Quantity"> {(Number(this.props.ingredient.num_native_units) * Number(this.props.numFormula)).toFixed(2)} </div>
        <div className="IngredientName"> {this.props.ingredient.name} </div>
      </div>
    );
  }
}

export default ProduceFormulaListItemIngredient;
