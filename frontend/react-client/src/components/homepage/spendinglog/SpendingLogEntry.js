import React, { Component } from 'react';
import PropTypes from 'prop-types';

class SpendingLogEntry extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { ingredient_id, ingredient_name, total_weight, ingredient_native_unit, total, consumed } = this.props.item;
    return(
      <tr>
        <td>
          <a href="javascript:void(0)" onClick={e => this.props.viewIngredient(ingredient_id)}>{ingredient_name}</a>
        </td>
        <td>{`${total_weight} ${ingredient_native_unit}`}</td>
        <td>${total.toFixed(2)}</td>
        <td>${consumed.toFixed(2)}</td>
      </tr>
    );
  }
}

SpendingLogEntry.propTypes = {
  item: PropTypes.shape({
    ingredient_id: PropTypes.number,
    ingredient_name: PropTypes.string,
    total_weight: PropTypes.number,
    ingredient_native_unit: PropTypes.string,
    total: PropTypes.number,
    consumed: PropTypes.number,
  }),
  viewIngredient: PropTypes.func,
};

export default SpendingLogEntry;
