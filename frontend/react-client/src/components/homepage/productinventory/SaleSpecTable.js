import React, { Component } from 'react';
import PropTypes from 'prop-types';

class SaleSpecTable extends Component {
  render() {
    const columnClass = 'OneFourthWidth';
    return (
      <div>
        <table className='table'>
          <thead>
            <tr>
              <th className={columnClass}>Product</th>
              <th className={columnClass}>Number of Packages</th>
              <th className={columnClass}>Unit Price</th>
              <th className={columnClass}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.products.map((product, idx) => {
                return (
                  <tr key={idx}>
                    <td className={columnClass}>{product.formula_name}</td>
                    <td className={columnClass}>{product.num_packages}</td>
                    <td className={columnClass}>{product.unit_price}</td>
                    <td className={columnClass}>${product.unit_price * product.num_packages}</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    );
  }
}

SaleSpecTable.propTypes = {
  products: PropTypes.array,
};

export default SaleSpecTable;
