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
        <td>${total_cost}</td>
        <td>${units_sold}</td>
        <td>${average_wholesale_price}</td>
        <td>${wholesale_revenue}</td>
        <td>${total_profit}</td>
        <td>${unit_profit}</td>
        <td>${profit_margin}</td>
      </tr>
    );
  }
}

ProfitabilityReportEntry.propTypes = {
  viewIngredient: PropTypes.func,
};

export default ProfitabilityReportEntry;
