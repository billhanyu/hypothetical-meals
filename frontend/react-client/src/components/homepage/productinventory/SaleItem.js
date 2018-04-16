import React, { Component } from 'react';
import PropTypes from 'prop-types';

class SaleItem extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { columnClass, sale } = this.props;
    return (
      <tr>
        <td className={columnClass}>{sale.name}</td>
        <td className={columnClass}>{sale.sale_num_packages}</td>
        <td className={columnClass}>${sale.sale_total_cost.toFixed(2)}</td>
        <td className={columnClass}>${sale.sale_total_revenue.toFixed(2)}</td>
      </tr>
    );
  }
}

SaleItem.propTypes = {
  columnClass: PropTypes.string,
  sale: PropTypes.object,
  idx: PropTypes.number,
};

export default SaleItem;
