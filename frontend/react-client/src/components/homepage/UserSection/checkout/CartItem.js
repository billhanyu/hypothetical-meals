import React, { Component } from 'react';

class CartItem extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="CartItem">
        <span className="CartItemColumn">{this.props.item.ingredient_name}</span>
        <span className="CartItemColumn">{this.props.item.package_type}</span>
        <span className="CartItemColumn">{this.props.item.quantity}</span>
      </div>
    );
  }
}

export default CartItem;
