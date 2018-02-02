import React, { Component } from 'react';

class InventoryItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ingredient: {},
      storage: {},
    };
  }

  render() {
    return (
      <div className="InventoryRow">
        <span className="InventoryColumn">{this.props.item.ingredient_name}</span>
        <span className="InventoryColumn">{this.props.item.ingredient_temperature_state}</span>
        <span className="InventoryColumn">{this.props.item.package_type}</span>
        <span className="InventoryColumn">{this.props.item.num_packages}</span>
      </div>
    );
  }
}

export default InventoryItem;
