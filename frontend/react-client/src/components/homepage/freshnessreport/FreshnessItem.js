import React, { Component } from 'react';
import PropTypes from 'prop-types';

class FreshnessItem extends Component {
  render() {
    const { ingredient_id, ingredient_name, average, worst } = this.props.data;
    return (
      <tr>
        <td>
          <a href="javascript:void(0)" onClick={e => this.props.viewIngredient(ingredient_id)}>{ingredient_name}</a>
        </td>
        <td>{average}</td>
        <td>{worst}</td>
      </tr>
    );
  }
}

FreshnessItem.propTypes = {
  data: PropTypes.shape({
    ingredient_id: PropTypes.number,
    ingredient_name: PropTypes.string,
    average: PropTypes.number,
    worst: PropTypes.number,
  }),
  viewIngredient: PropTypes.func,
};

export default FreshnessItem;
