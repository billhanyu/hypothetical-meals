import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ProfitabilityReportEntry extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {name, quantity, cost, sell, profit} = this.props;
    return(
      <tr>
        <td>
          <a href="javascript:void(0)" onClick={e => this.props.viewIngredient(ingredient_id)}>{name}</a>
        </td>
        <td>{quantity}</td>
        <td>${cost.toFixed(2)}</td>
        <td>${sell.toFixed(2)}</td>
        <td>${profit.toFixed(2)}</td>
      </tr>
    );
  }
}

ProfitabilityReportEntry.propTypes = {
  viewIngredient: PropTypes.func,
};

export default ProfitabilityReportEntry;
