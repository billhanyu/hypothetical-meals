import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ProfitabilityReportEntry extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const costs = 100;
    const sales = 200;
    const netProfit = 100;
    const ingredient_name = "Dummy";
    const sale_amount = "Dummy Amount";
    return(
      <tr>
        <td>
          <a href="javascript:void(0)" onClick={e => this.props.viewIngredient(ingredient_id)}>{ingredient_name}</a>
        </td>
        <td>{sale_amount}</td>
        <td>${costs.toFixed(2)}</td>
        <td>${sales.toFixed(2)}</td>
        <td>${netProfit.toFixed(2)}</td>
      </tr>
    );
  }
}

ProfitabilityReportEntry.propTypes = {
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

export default ProfitabilityReportEntry;
