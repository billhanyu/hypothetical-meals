import React, { Component } from 'react';
import PropTypes from 'prop-types';

class FormulaIngredientsTable extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const columnClass = 'HalfWidth';
    return (
      <div>
        <table className="table">
          <thead>
            <tr>
              <th className={columnClass}>Ingredient</th>
              <th className={columnClass}>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.ingredients.map((ingredient, idx) =>
                <tr key={idx}>
                  <td className={columnClass}>
                    <a href="javascript:void(0)" onClick={e => this.props.viewIngredient(ingredient.id)}>{ingredient.name}</a>
                    {
                      ingredient.intermediate == 1 &&
                      <span style={{ 'margin-left': '10px' }} className="badge badge-secondary">Intermediate</span>
                    }
                  </td>
                  <td className={columnClass}>{ingredient.num_native_units} {ingredient.native_unit}</td>
                </tr>)
            }
          </tbody>
        </table>
      </div>
    );
  }
}

FormulaIngredientsTable.propTypes = {
  ingredients: PropTypes.array,
  viewIngredient: PropTypes.func,
};

export default FormulaIngredientsTable;
