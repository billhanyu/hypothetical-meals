import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ProductionRunIngredientTable extends Component {
  render() {
    return (
      <table className="table">
        <thead>
          <th>Ingredient</th>
          <th>Lot Number</th>
        </thead>
        <tbody>
          {
            this.props.ingredients.map((ingredient, idx) => {
              return (
                <tr key={idx}>
                  <td>{ingredient.ingredient_name}</td>
                  <td>{ingredient.lot}</td>
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
};

export default ProductionRunIngredientTable;