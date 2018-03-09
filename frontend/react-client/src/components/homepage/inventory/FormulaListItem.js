import React, { Component } from 'react';

class FormulaListItem extends Component {
  constructor(props) {
    super(props);
  }

  /** REQUIRED PROPS
    1. element (JSON Object)
    2. onClick (Func)
  */

  handleFormulaClick() {
    this.props.onClick(this.props);
  }

  render() {
    return (
      <tr className="ProduceFormulaListItemRow" onClick={this.handleFormulaClick.bind(this)}>
        <td>{this.props.element.name}</td>
        <td>{this.props.element.num_product}</td>
        <td>{Object.keys(this.props.element.ingredients).length}</td>
      </tr>
    );
  }
}

export default FormulaListItem;
