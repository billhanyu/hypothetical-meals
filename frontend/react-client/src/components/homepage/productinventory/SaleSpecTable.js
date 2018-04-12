import React, { Component } from 'react';
import PropTypes from 'prop-types';

class SaleSpecTable extends Component {
  render() {
    const { columnClass } = '';
    return (
      <div>
        <table className='table'>
          <thead>
            <tr>
              <th className={columnClass}>Requested Time</th>
              <th className={columnClass}>Total Revenue</th>
              <th className={columnClass}>Number of Products</th>
              {
                global.user_group !== 'noob' &&
                <th className={columnClass}>Options</th>
              }
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
      </div>
    );
  }
}

SaleSpecTable.propTypes = {
};

export default SaleSpecTable;
