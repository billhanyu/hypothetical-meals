import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ProductionRunIngredientTable extends Component {
  render() {
    return (
      <table className="table">
        <thead>
          <th>Ingredient</th>
          <th>Lot Number</th>
          <th>Vendor</th>
          <th>Quantity</th>
        </thead>
        <tbody>
          {
            this.props.ingredients.map((ingredient, idx) => {
              return (
                <tr key={idx}>
                  <td>
                    <a href="javascript:void(0)" onClick={e => this.props.viewIngredient(ingredient.ingredient_id)}>{ingredient.ingredient_name}</a>
                  </td>
                  <td>{ingredient.lot}</td>
                  <td>
                    <a href="javascript:void(0)" onClick={e => this.props.viewVendor(ingredient.vendor_id)}>{ingredient.vendor_name}</a>
                  </td>
                  <td>{ingredient.num_native_units} {ingredient.ingredient_native_unit}</td>
                </tr>
              );
            })
          }
        </tbody>
      </table>
    );
  }
}

ProductionRunIngredientTable.propTypes = {
  ingredients: PropTypes.array,
  viewIngredient: PropTypes.func,
  viewVendor: PropTypes.func,
};

export default ProductionRunIngredientTable;
