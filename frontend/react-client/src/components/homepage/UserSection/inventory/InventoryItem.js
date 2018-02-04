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
    const cssClassName =
      `InventoryRow${this.props.mode == "view" ? "" : " InventoryRowCart"}`;
    return (
      <div className={cssClassName} onClick={this.selectSelf}>
        <span className="InventoryColumn">{this.props.item.ingredient_name}</span>
        <span className="InventoryColumn">{this.props.item.ingredient_temperature_state}</span>
        <span className="InventoryColumn">{this.props.item.package_type}</span>
        <span className="InventoryColumn">{this.props.item.num_packages}</span>
      </div>
    );
  }
}

export default InventoryItem;
