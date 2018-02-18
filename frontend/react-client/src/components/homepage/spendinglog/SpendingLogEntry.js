import React, { Component } from 'react';

class SpendingLogEntry extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <tr>
        <td>{this.props.item.ingredient_name}</td>
        <td>{this.props.item.total_weight} lbs</td>
        <td>${this.props.item.total}</td>
        <td>${this.props.item.consumed}</td>
      </tr>
    );
  }
}

export default SpendingLogEntry;
