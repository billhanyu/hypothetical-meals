import React, { Component } from 'react';

class InventoryItem extends Component {
  constructor(props) {
    super(props);
    this.selectSelf = this.selectSelf.bind(this);
  }

  selectSelf() {
    this.props.selectInventoryItem(Object.assign(this.props.item));
  }

  render() {
    const cssClassName = this.props.mode == "view" ? "" : "InventoryRowCart";
    return (
      <tr className={cssClassName} onClick={this.selectSelf}>
        <td>{this.props.item.ingredient_name}</td>
        <td>{this.props.item.ingredient_temperature_state}</td>
        <td>{this.props.item.ingredient_package_type}</td>
        <td>{this.props.item.num_packages}</td>
      </tr>
    );
  }
}

export default InventoryItem;
