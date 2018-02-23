import React, { Component } from 'react';
import ProduceFormulaListItemIngredient from './ProduceFormulaListItemIngredient.js';

class ProduceFormulaListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numFormula: 0,
    };
  }

  /**** REQUIRED PROPS
    1. name (String)
    2. num_product (Number)
    3. ingredients (JSON Object) form:
      {
        ingredient_name: {
          id: 1,
          ingredient_id, 2,
          ingredient_num_native_units: 1
          num_native_units: 11,
          formula_id: 11,
          native_unit: kg,
          num_native_units: 11,
          package_type: sack
        }
       }
    4. id (Number)
    5. handleNumChange (Func)
  */

  handleInputChange(event) {
    this.setState({
      numFormula: event.target.value,
    });
    this.props.handleNumChange(event.target.value, this.props.id, Number(this.state.numFormula) * Number(this.props.num_product));
  }

  render() {
    return (
      <div className="ProduceFormulaListItem">
        <div className="ProduceFormulaListItemContainer">
          <div className="ProduceFormulaItemName">{this.props.name}</div>
          <input value={this.state.numFormula} onChange={this.handleInputChange.bind(this)} />
          <div className="ProduceFormulaQuantity">x {Number(this.props.num_product)} (Amt per package) = {Number(this.state.numFormula) * Number(this.props.num_product)}</div>
        </div>
        <div className="ProduceFormulaListItemIngredientHeader">Ingredients Used in Formula Production: </div>
        {
          Object.keys(this.props.ingredients).map((elementKey, key) => {
            return <ProduceFormulaListItemIngredient key={key}
                      ingredient={this.props.ingredients[elementKey]}
                      numFormula={this.state.numFormula}
                    />;
          })
        }
      </div>
    );
  }
}

export default ProduceFormulaListItem;
