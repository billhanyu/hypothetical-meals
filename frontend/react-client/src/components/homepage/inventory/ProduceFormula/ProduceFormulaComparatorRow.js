import React, { Component } from 'react';

class ProduceFormulaComparatorRow extends Component {
  constructor(props) {
    super(props);
  }

  /*** REQUIRED PROPS
    1. amount (Number)
    2. stock (Number)
    3. name (String)
  */
  render() {
    const leftoverAmount = this.props.stock - this.props.amount;
    return (
      <tr>
        <td> {this.props.name} </td>
        <td> {this.props.stock} </td>
        <td> {this.props.amount} </td>
        <td style={{color: leftoverAmount < 0 ? 'red' : 'green'}}> {leftoverAmount} </td>
      </tr>
    );
  }
}

export default ProduceFormulaComparatorRow;
