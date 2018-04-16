import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ProfitabilityReportEntry extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {name, total_cost, units_sold, average_wholesale_price, wholesale_revenue, total_profit, unit_profit, profit_margin,} = this.props;
    return(
      <tr>
        <td>
          <a href="javascript:void(0)" onClick={e => this.props.viewIngredient(ingredient_id)}>{name}</a>
        </td>
        <td>${total_cost.toFixed(2)}</td>
        <td>${units_sold.toFixed(2)}</td>
        <td>${average_wholesale_price.toFixed(2)}</td>
        <td>${wholesale_revenue.toFixed(2)}</td>
        <td>${total_profit.toFixed(2)}</td>
        <td>${unit_profit.toFixed(2)}</td>
        <td>${profit_margin.toFixed(2)}</td>
      </tr>
    );
  }
}

ProfitabilityReportEntry.propTypes = {
  viewIngredient: PropTypes.func,
};

export default ProfitabilityReportEntry;
