import React, { Component } from 'react';
import PropTypes from 'prop-types';

class QuantityByLotTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lots: [],
    };
  }

  componentDidMount() {
    this.setState({ // fake data
      lots: [
        {
          name: 'shit',
          quantity: 100,
        },
        {
          name: 'fuck',
          quantity: 200,
        },
        {
          name: 'damn',
          quantity: 111,
        },
      ]
    });
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
                <td className="HalfWidth">{lot.name}</td>
                <td className="HalfWidth">{lot.quantity} {this.props.ingredient.native_unit}</td>
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
    native_unit: PropTypes.string.isRequired
  }).isRequired,
  withTitle: PropTypes.bool,
};

export default QuantityByLotTable;
