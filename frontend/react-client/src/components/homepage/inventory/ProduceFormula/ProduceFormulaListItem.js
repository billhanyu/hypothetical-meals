import React, { Component } from 'react';
import ProduceFormulaListItemIngredient from './ProduceFormulaListItemIngredient.js';

class ProduceFormulaListNoob extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numProduct: 0,
      belowMinError: false,
    };
    props.handleNumChange(Number(props.num_product), props.id, Number(this.props.num_product), false);
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
    let newValueNoDecimal = event.target.value.replace('.', '');
    let newValueNoNeg = newValueNoDecimal.replace('-', '');
    if(isNaN(newValueNoNeg)) {
      return;
    }
    const belowMinError = (Number(newValueNoNeg) < this.props.num_product) && (Number(newValueNoNeg) != 0);
    this.setState({
      numProduct: Number(newValueNoNeg),
      belowMinError,
    });
    this.props.handleNumChange(Number(this.props.num_product), this.props.id, Number(newValueNoNeg), belowMinError);
  }

  render() {
    return (
      <div className="ProduceFormulaListItem">
        <div className="ProduceFormulaListItemContainer">
          <div className="ProduceFormulaItemName">{this.props.name}</div>
          <div className="ProduceFormulaQuantity" style={{marginLeft:'12px'}}>Amount (packages):</div>
          <input style={this.state.belowMinError ? {border:'1px solid red'} : null} value={this.state.numProduct} onChange={this.handleInputChange.bind(this)} />
          {
            this.state.belowMinError ? <div style={{color:'red', marginLeft:'12px', float:'left'}}>Below min. package size</div> : null
          }
        </div>
        <div className="ProduceFormulaListItemIngredientHeader">Ingredients Used in Formula Production: </div>
        <div style={{maxHeight: '150px', overflow:'auto', width:'100%', float:'left', clear:'both'}}>
        {
          Object.keys(this.props.ingredients).map((elementKey, key) => {
            return <ProduceFormulaListItemIngredient
              key={key}
              ingredient={this.props.ingredients[elementKey]}
              numIngredients={this.state.numProduct / this.props.num_product * this.props.ingredients[elementKey].num_native_units}
            />;
          })
        }
        </div>
      </div>
    );
  }
}

export default ProduceFormulaListNoob;
