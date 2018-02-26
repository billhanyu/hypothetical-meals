import React, { Component } from 'react';

class SpendingLogEntry extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <tr>
        <td>{this.props.item.ingredient_name}</td>
        <td>{`${this.props.item.total_weight}  ${this.props.item.ingredient_native_unit}`}</td>
        <td>${Math.round(this.props.item.total * 100) / 100}</td>
        <td>${Math.round(this.props.item.consumed * 100) / 100}</td>
      </tr>
    );
  }
}

export default SpendingLogEntry;
