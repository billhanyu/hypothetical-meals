import React, { Component } from 'react';

class SpendingLogEntry extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <div className="InventoryRow">
        <span className="InventoryColumn">{this.props.item.ingredient_name}</span>
        <span className="InventoryColumn">{this.props.item.total_weight} lbs</span>
        <span className="InventoryColumn">${this.props.item.total}</span>
        <span className="InventoryColumn">${this.props.item.consumed}</span>
      </div>
    );
  }
}

export default SpendingLogEntry;
