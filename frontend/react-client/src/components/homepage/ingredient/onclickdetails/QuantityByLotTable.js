import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

class QuantityByLotTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lots: [],
    };
  }

  componentDidMount() {
    axios.get(`/inventory/lot/${this.props.ingredient.id}`, {
      headers: {Authorization: "Token " + global.token}
    })
    .then(response => {
      this.setState({
        lots: response.data
      });
    })
    .catch(err => alert('Error retrieving lots info'));
  }

  render() {
    return (
      <div>
        {
          this.props.withTitle &&
          <h3>Quantities by Lot Numbers</h3>
        }
      <table className="table">
        <tr>
          <th className="HalfWidth">Lot Number</th>
          <th className="HalfWidth">Quantity</th>
        </tr>
        {
          this.state.lots.map((lot, idx) => {
            return (
              <tr key={idx}>
                <td className="HalfWidth">{lot.lot}</td>
                <td className="HalfWidth">{lot.quantity.toFixed(2)} {this.props.ingredient.native_unit}</td>
              </tr>
            );
          })
        }
      </table>
      </div>
    );
  }
}

QuantityByLotTable.propTypes = {
  ingredient: PropTypes.shape({
    id: PropTypes.number.isRequired,
    native_unit: PropTypes.string.isRequired
  }).isRequired,
  withTitle: PropTypes.bool,
};

export default QuantityByLotTable;
