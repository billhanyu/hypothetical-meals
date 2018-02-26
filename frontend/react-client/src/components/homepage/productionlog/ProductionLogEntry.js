import React, { Component } from 'react';

class ProductionLogEntry extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <tr>
        <td>{this.props.item.formula_name}</td>
        <td>{this.props.item.num_product}</td>
        <td>${Math.round(this.props.item.total_cost * 100) / 100}</td>
      </tr>
    );
  }
}

export default ProductionLogEntry;
