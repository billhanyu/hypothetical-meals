import React, { Component } from 'react';

class FreshnessItem extends Component {
  render() {
    const { name, average, worst } = this.props.data;
    return (
      <tr>
        <td>{name}</td>
        <td>{average}</td>
        <td>{worst}</td>
      </tr>
    );
  }
}

export default FreshnessItem;
