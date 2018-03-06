import React, { Component } from 'react';
import PropTypes from 'prop-types';

class VendorIngredientsTable extends Component {
  render() {
    return (
      <table className="table">
        <tr>
          <th className="HalfWidth">Sold By</th>
          <th className="HalfWidth">Price</th>
        </tr>
        {
          this.props.vendoringredients.map((vendoringredient, idx) => {
            return (
              <tr key={idx}>
                <td className="HalfWidth">{vendoringredient.vendor_name}</td>
                <td className="HalfWidth">{vendoringredient.price}</td>
              </tr>
            );
          })
        }
      </table>
    );
  }
}

VendorIngredientsTable.propTypes = {
  vendoringredients: PropTypes.array.isRequired,
};

export default VendorIngredientsTable;
